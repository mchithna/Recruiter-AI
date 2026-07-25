using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using RecruitmentPlatform.API.Controllers;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Infrastructure.Data;
using RecruitmentPlatform.Infrastructure.Repositories;
using RecruitmentPlatform.Infrastructure.Services;
using Xunit;

namespace RecruitmentPlatform.Tests;

public class NotificationTests
{
    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new ApplicationDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    private EmailNotificationService CreateEmailService()
    {
        var config = new ConfigurationBuilder().Build();
        var logger = NullLogger<EmailNotificationService>.Instance;
        return new EmailNotificationService(config, logger);
    }

    [Fact]
    public async Task InAppNotificationService_persists_notification_in_repository()
    {
        using var context = CreateInMemoryDbContext();
        var uow = new UnitOfWork(context);
        var inAppService = new InAppNotificationService(uow);

        await inAppService.SendAsync(
            recipientId: 42,
            type: "NewCandidateMessage",
            title: "Message from Jane",
            body: "Hello, I am interested in the Software Engineer role.",
            relatedEntityType: "Application",
            relatedEntityId: 101
        );

        var notification = await context.Notifications.FirstOrDefaultAsync(n => n.RecipientId == 42);

        Assert.NotNull(notification);
        Assert.Equal("NewCandidateMessage", notification!.Type);
        Assert.Equal("Message from Jane", notification.Title);
        Assert.Equal("Hello, I am interested in the Software Engineer role.", notification.Body);
        Assert.Equal("InApp", notification.Channel);
        Assert.False(notification.IsRead);
        Assert.Equal("Application", notification.RelatedEntityType);
        Assert.Equal(101, notification.RelatedEntityId);
    }

    [Fact]
    public void NotificationFactory_resolves_correct_channel_services()
    {
        using var context = CreateInMemoryDbContext();
        var uow = new UnitOfWork(context);
        var inApp = new InAppNotificationService(uow);
        var email = CreateEmailService();
        var composite = new CompositeNotificationService(inApp, email, uow);

        var factory = new NotificationFactory(inApp, email, composite);

        Assert.Same(inApp, factory.Create("inapp"));
        Assert.Same(inApp, factory.Create("INAPP"));
        Assert.Same(email, factory.Create("email"));
        Assert.Same(composite, factory.Create("all"));
        Assert.Same(composite, factory.Create("composite"));
        Assert.Same(inApp, factory.Create("unknown_channel"));
    }

    [Fact]
    public async Task ApplicationStatusService_dispatches_notification_on_status_change()
    {
        using var context = CreateInMemoryDbContext();
        var uow = new UnitOfWork(context);

        var candidateRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Candidate")
            ?? new Role { Name = "Candidate" };
        if (candidateRole.Id == 0) context.Roles.Add(candidateRole);

        var candidateUser = new User { RoleId = candidateRole.Id, Role = candidateRole, Email = "candidate@example.com", FirstName = "John", LastName = "Doe" };
        var job = new Job { Title = "Senior C# Developer", Description = "Job description for C# dev", Status = "Open" };
        context.Users.Add(candidateUser);
        context.Jobs.Add(job);
        await context.SaveChangesAsync();

        var app = new Application { JobId = job.Id, CandidateId = candidateUser.Id, Status = "Applied", AppliedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        context.Applications.Add(app);
        await context.SaveChangesAsync();

        var inAppService = new InAppNotificationService(uow);
        var emailService = CreateEmailService();
        var compositeService = new CompositeNotificationService(inAppService, emailService, uow);
        var factory = new NotificationFactory(inAppService, emailService, compositeService);

        var statusService = new ApplicationStatusService(uow, factory);

        var result = await statusService.ChangeStatusAsync(app.Id, "Shortlisted", changedByUserId: 1, notes: "Passed resume screen");

        Assert.Equal("Shortlisted", result.Status);

        var notif = await context.Notifications.FirstOrDefaultAsync(n => n.RecipientId == candidateUser.Id);
        Assert.NotNull(notif);
        Assert.Equal("ApplicationStatusUpdated", notif!.Type);
        Assert.Contains("Senior C# Developer", notif.Title);
        Assert.Contains("Shortlisted", notif.Body);
    }

    [Fact]
    public async Task ApplicationStatusService_dispatches_offer_notification_on_OfferExtended()
    {
        using var context = CreateInMemoryDbContext();
        var uow = new UnitOfWork(context);

        var candidateRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Candidate")
            ?? new Role { Name = "Candidate" };
        if (candidateRole.Id == 0) context.Roles.Add(candidateRole);

        var candidateUser = new User { RoleId = candidateRole.Id, Role = candidateRole, Email = "candidate@example.com", FirstName = "John", LastName = "Doe" };
        var job = new Job { Title = "Lead Architect", Description = "Job description for architect", Status = "Open" };
        context.Users.Add(candidateUser);
        context.Jobs.Add(job);
        await context.SaveChangesAsync();

        var app = new Application { JobId = job.Id, CandidateId = candidateUser.Id, Status = "Shortlisted", AppliedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        context.Applications.Add(app);
        await context.SaveChangesAsync();

        var inAppService = new InAppNotificationService(uow);
        var emailService = CreateEmailService();
        var compositeService = new CompositeNotificationService(inAppService, emailService, uow);
        var factory = new NotificationFactory(inAppService, emailService, compositeService);

        var statusService = new ApplicationStatusService(uow, factory);

        await statusService.ChangeStatusAsync(app.Id, "Offer Extended", changedByUserId: 1);

        var notif = await context.Notifications.FirstOrDefaultAsync(n => n.RecipientId == candidateUser.Id);
        Assert.NotNull(notif);
        Assert.Equal("OfferIssued", notif!.Type);
        Assert.Contains("Offer Received", notif.Title);
    }

    [Fact]
    public async Task NotificationsController_test_endpoint_creates_test_notification()
    {
        using var context = CreateInMemoryDbContext();
        var uow = new UnitOfWork(context);
        var controller = new NotificationsController(uow);

        var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("app_user_id", "7")
        }, "TestAuth"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = userClaims }
        };

        var response = await controller.CreateTestNotification("Custom Test", "Custom Body");

        var okResult = Assert.IsType<OkObjectResult>(response);
        Assert.NotNull(okResult.Value);

        var notification = await context.Notifications.FirstOrDefaultAsync(n => n.RecipientId == 7);
        Assert.NotNull(notification);
        Assert.Equal("TestNotification", notification!.Type);
        Assert.Equal("Custom Test", notification.Title);
        Assert.Equal("Custom Body", notification.Body);
    }

    [Fact]
    public async Task Candidate_sending_message_dispatches_notification_to_company_admin_recruiter()
    {
        using var context = CreateInMemoryDbContext();
        var uow = new UnitOfWork(context);

        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin")
            ?? new Role { Name = "Admin" };
        var candidateRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Candidate")
            ?? new Role { Name = "Candidate" };

        if (adminRole.Id == 0) context.Roles.Add(adminRole);
        if (candidateRole.Id == 0) context.Roles.Add(candidateRole);

        var company = new Company { Name = "Acme Corp", SubscriptionStatus = "Active" };
        context.Companies.Add(company);
        await context.SaveChangesAsync();

        var dept = new Department { CompanyId = company.Id, Name = "Engineering" };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        var adminUser = new User { CompanyId = company.Id, DepartmentId = dept.Id, RoleId = adminRole.Id, Role = adminRole, Email = "admin@acme.com", FirstName = "Alice", LastName = "Admin", IsActive = true };
        var candidateUser = new User { RoleId = candidateRole.Id, Role = candidateRole, Email = "candidate@example.com", FirstName = "Bob", LastName = "Candidate", IsActive = true };

        context.Users.AddRange(adminUser, candidateUser);
        await context.SaveChangesAsync();

        var job = new Job { DepartmentId = dept.Id, Department = dept, RecruiterId = adminUser.Id, Title = "Full Stack Engineer", Description = "Full stack dev description", Status = "Open" };
        context.Jobs.Add(job);
        await context.SaveChangesAsync();

        var app = new Application { JobId = job.Id, Job = job, CandidateId = candidateUser.Id, Candidate = candidateUser, Status = "Applied" };
        context.Applications.Add(app);
        await context.SaveChangesAsync();

        var inAppService = new InAppNotificationService(uow);
        var emailService = CreateEmailService();
        var compositeService = new CompositeNotificationService(inAppService, emailService, uow);
        var factory = new NotificationFactory(inAppService, emailService, compositeService);

        var scopeFactory = new MockScopeFactory();
        var controller = new CandidateController(context, scopeFactory, factory);

        var candidateClaims = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("app_user_id", candidateUser.Id.ToString()),
            new Claim(ClaimTypes.Role, "Candidate")
        }, "TestAuth"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = candidateClaims }
        };

        var actionResult = await controller.SendMessage(app.Id, new CandidateMessageCreateDto { Body = "Hello Alice, I have a question about the job." }, CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(actionResult);
        Assert.NotNull(okResult.Value);

        // Verify CommunicationMessage stored
        var msg = await context.CommunicationMessages.FirstOrDefaultAsync(m => m.ApplicationId == app.Id);
        Assert.NotNull(msg);
        Assert.Equal("Hello Alice, I have a question about the job.", msg!.Body);

        // Verify InApp Notification dispatched to recipient ID (adminUser.Id)
        var notification = await context.Notifications.FirstOrDefaultAsync(n => n.RecipientId == adminUser.Id);
        Assert.NotNull(notification);
        Assert.Equal("NewCandidateMessage", notification!.Type);
        Assert.Contains("Message from Candidate", notification.Title);
        Assert.Equal("Application", notification.RelatedEntityType);
        Assert.Equal(app.Id, notification.RelatedEntityId);
    }
}

public class MockScopeFactory : IServiceScopeFactory
{
    public IServiceScope CreateScope()
    {
        return new MockScope();
    }

    private class MockScope : IServiceScope
    {
        public IServiceProvider ServiceProvider => new MockServiceProvider();
        public void Dispose() { }
    }

    private class MockServiceProvider : IServiceProvider
    {
        public object? GetService(Type serviceType) => null;
    }
}

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Core.Interfaces;
using System.Net;
using System.Net.Mail;

namespace RecruitmentPlatform.Infrastructure.Services;

public class EmailNotificationService : INotificationService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(IConfiguration configuration, ILogger<EmailNotificationService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public Task SendAsync(int recipientId, string type, string title, string body, string? relatedEntityType = null, int? relatedEntityId = null)
    {
        return Task.CompletedTask;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var senderName = _configuration["EmailSettings:SenderName"];
            var appPassword = _configuration["EmailSettings:AppPassword"];

            if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(senderEmail))
            {
                _logger.LogWarning("SMTP not configured properly. Skipping email send to {Email}", toEmail);
                return;
            }

            using var client = new SmtpClient(smtpServer, smtpPort)
            {
                Credentials = new NetworkCredential(senderEmail, appPassword),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Successfully sent email notification to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            // Log warning and swallow exception so main API transaction never fails on bad/fake email address
            _logger.LogWarning(ex, "Failed to send email to {Email}. Main process will continue.", toEmail);
        }
    }
}
using Microsoft.Extensions.Configuration;
using RecruitmentPlatform.Core.Interfaces;
using System.Net;
using System.Net.Mail;

namespace RecruitmentPlatform.Infrastructure.Services;

public class EmailNotificationService : INotificationService
{
    private readonly IConfiguration _configuration;

    public EmailNotificationService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task SendAsync(int userId, string message)
    {
        throw new NotImplementedException();
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var smtpServer = _configuration["EmailSettings:SmtpServer"];
        var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
        var senderEmail = _configuration["EmailSettings:SenderEmail"];
        var senderName = _configuration["EmailSettings:SenderName"];
        var appPassword = _configuration["EmailSettings:AppPassword"];

        using var client = new SmtpClient(smtpServer, smtpPort)
        {
            Credentials = new NetworkCredential(senderEmail, appPassword),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail!, senderName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }
}
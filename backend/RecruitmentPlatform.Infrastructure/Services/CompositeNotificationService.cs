using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class CompositeNotificationService : INotificationService
{
    private readonly InAppNotificationService _inAppService;
    private readonly EmailNotificationService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public CompositeNotificationService(InAppNotificationService inAppService, EmailNotificationService emailService, IUnitOfWork unitOfWork)
    {
        _inAppService = inAppService;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task SendAsync(int recipientId, string type, string title, string body, string? relatedEntityType = null, int? relatedEntityId = null)
    {
        // 1. Save InApp Notification record in PostgreSQL
        await _inAppService.SendAsync(recipientId, type, title, body, relatedEntityType, relatedEntityId);

        // 2. Fetch Recipient Email & send SMTP Email if available
        var recipient = await _unitOfWork.Users.GetByIdAsync(recipientId);
        if (recipient != null && !string.IsNullOrEmpty(recipient.Email))
        {
            var htmlTemplate = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2 style='color: #7c3aed;'>{title}</h2>
                    <p>{body}</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #888;'>Sent automatically by Hirely Recruitment Platform.</p>
                </div>";

            await _emailService.SendEmailAsync(recipient.Email, title, htmlTemplate);
        }
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        await _emailService.SendEmailAsync(toEmail, subject, htmlBody);
    }
}

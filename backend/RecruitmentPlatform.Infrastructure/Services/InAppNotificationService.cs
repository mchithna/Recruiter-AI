using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class InAppNotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;

    public InAppNotificationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SendAsync(int recipientId, string type, string title, string body, string? relatedEntityType = null, int? relatedEntityId = null)
    {
        var notification = new Notification
        {
            RecipientId = recipientId,
            Type = type,
            Title = title,
            Body = body,
            Channel = "InApp",
            IsRead = false,
            RelatedEntityType = relatedEntityType,
            RelatedEntityId = relatedEntityId,
            SentAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync();
    }

    public Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        return Task.CompletedTask; // InApp service ignores raw direct emails
    }
}

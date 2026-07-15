namespace RecruitmentPlatform.Core.Interfaces;

public interface INotificationFactory
{
    INotificationService Create(string channel);
}

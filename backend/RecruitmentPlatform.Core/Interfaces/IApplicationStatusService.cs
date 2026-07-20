using RecruitmentPlatform.Core.Entities;

namespace RecruitmentPlatform.Core.Interfaces;

public interface IApplicationStatusService
{
    Task<Application> ChangeStatusAsync(int applicationId, string newStatus, int changedByUserId, string? notes = null);
}
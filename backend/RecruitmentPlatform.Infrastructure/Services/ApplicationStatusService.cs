using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public sealed class ApplicationStatusService : IApplicationStatusService
{
    private static readonly Dictionary<string, string[]> AllowedTransitions = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Applied"] = ["Under Review", "Shortlisted", "Rejected", "Withdrawn"],
        ["Under Review"] = ["Shortlisted", "Rejected", "Withdrawn"],
        ["Shortlisted"] = ["Interview Scheduled", "Offer Extended", "Rejected", "Withdrawn"],
        ["Interview Scheduled"] = ["Offer Extended", "Rejected", "Withdrawn"],
        ["Offer Extended"] = ["Hired", "Rejected", "Withdrawn"],
        ["Hired"] = [],
        ["Rejected"] = ["Offer Extended"],
        ["Withdrawn"] = []
    };

    private readonly IUnitOfWork _unitOfWork;

    public ApplicationStatusService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Application> ChangeStatusAsync(int applicationId, string newStatus, int changedByUserId, string? notes = null)
    {
        var requestedStatus = NormalizeStatusOrThrow(newStatus);

        var application = await _unitOfWork.Applications.GetByIdAsync(applicationId);
        if (application is null)
        {
            throw new KeyNotFoundException($"Application {applicationId} was not found.");
        }

        var currentStatus = NormalizeStatusOrThrow(application.Status);
        EnsureTransitionAllowed(currentStatus, requestedStatus);

        if (currentStatus.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Application is already in '{currentStatus}' status.");
        }

        application.Status = requestedStatus;
        application.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Applications.Update(application);

        var history = new ApplicationStatusHistory
        {
            ApplicationId = application.Id,
            ChangedBy = changedByUserId,
            OldStatus = currentStatus,
            NewStatus = requestedStatus,
            Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim(),
            ChangedAt = DateTime.UtcNow
        };

        await _unitOfWork.ApplicationStatusHistories.AddAsync(history);
        await _unitOfWork.SaveChangesAsync();

        return application;
    }

    private static string NormalizeStatusOrThrow(string? status)
    {
        var normalized = AllowedTransitions.Keys.FirstOrDefault(s =>
            s.Equals(status?.Trim(), StringComparison.OrdinalIgnoreCase));

        if (normalized is null)
        {
            throw new InvalidOperationException($"Unknown application status '{status}'.");
        }

        return normalized;
    }

    private static void EnsureTransitionAllowed(string currentStatus, string newStatus)
    {
        if (!AllowedTransitions.TryGetValue(currentStatus, out var nextStatuses))
        {
            throw new InvalidOperationException($"Current status '{currentStatus}' is not supported by the workflow.");
        }

        if (nextStatuses.Contains(newStatus, StringComparer.OrdinalIgnoreCase))
        {
            return;
        }

        if (nextStatuses.Length == 0)
        {
            throw new InvalidOperationException($"Status '{currentStatus}' is terminal and cannot transition to '{newStatus}'.");
        }

        throw new InvalidOperationException($"Invalid transition from '{currentStatus}' to '{newStatus}'.");
    }
}

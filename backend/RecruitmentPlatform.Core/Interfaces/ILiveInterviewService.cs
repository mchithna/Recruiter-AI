using RecruitmentPlatform.Core.DTOs;

namespace RecruitmentPlatform.Core.Interfaces;

public interface ILiveInterviewService
{
    Task<LiveInterviewSessionDto?> StartSessionAsync(StartInterviewSessionRequest request, int userId, string role, int companyId, CancellationToken cancellationToken = default);
    Task<LiveInterviewSessionDto?> GetSessionAsync(int sessionId, int userId, string role, int companyId, CancellationToken cancellationToken = default);
    Task<LiveQuestionResponse?> GenerateQuestionAsync(int sessionId, GenerateLiveQuestionRequest request, int userId, string role, int companyId, CancellationToken cancellationToken = default);
    Task<CandidateAnswerInsightResponse?> SubmitAnswerAsync(int sessionId, SubmitCandidateAnswerRequest request, int userId, string role, int companyId, CancellationToken cancellationToken = default);
    Task<LiveQuestionResponse?> UpdateQuestionStatusAsync(int sessionId, int questionId, string status, int userId, string role, int companyId, CancellationToken cancellationToken = default);
    Task<InterviewSummaryResponse?> EndSessionAsync(int sessionId, int userId, string role, int companyId, CancellationToken cancellationToken = default);
    Task<InterviewSummaryResponse?> GetSummaryAsync(int sessionId, int userId, string role, int companyId, CancellationToken cancellationToken = default);
}

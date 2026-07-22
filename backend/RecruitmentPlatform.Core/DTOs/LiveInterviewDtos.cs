namespace RecruitmentPlatform.Core.DTOs;

public static class LiveInterviewMessages
{
    public const string Disclaimer = "AI assistance only - interviewer review is required. The AI must not make hiring decisions.";
    public const string AiUnavailable = "The AI assistant is temporarily unavailable. You can continue the interview using your own questions and retry shortly.";
    public const string SessionEnded = "This interview session has already ended.";
}

public class StartInterviewSessionRequest
{
    public int InterviewId { get; set; }
    public string? Difficulty { get; set; }
    public string? QuestionMode { get; set; }
    public bool ConsentRecorded { get; set; }
}

public class GenerateLiveQuestionRequest
{
    public string? Mode { get; set; }
    public string? Difficulty { get; set; }
    public string? ControlAction { get; set; }
    public string? CurrentTopic { get; set; }
    public string? LatestAnswerNotes { get; set; }
    public int? SavedQuestionId { get; set; }
}

public class SubmitCandidateAnswerRequest
{
    public int QuestionId { get; set; }
    public string? Transcript { get; set; }
    public string? InterviewerNotes { get; set; }
}

public class LiveInterviewSessionDto
{
    public int SessionId { get; set; }
    public int InterviewId { get; set; }
    public int ApplicationId { get; set; }
    public string Status { get; set; } = "";
    public string QuestionMode { get; set; } = "";
    public string Difficulty { get; set; } = "";
    public bool ConsentRecorded { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public LiveInterviewContextDto Context { get; set; } = new();
    public List<LiveQuestionResponse> Questions { get; set; } = new();
    public InterviewSummaryResponse? Summary { get; set; }
    public string Disclaimer { get; set; } = LiveInterviewMessages.Disclaimer;
}

public class LiveInterviewContextDto
{
    public string CandidateName { get; set; } = "";
    public string? CandidatePhotoUrl { get; set; }
    public string Position { get; set; } = "";
    public string? CvSummary { get; set; }
    public int? ExperienceYears { get; set; }
    public List<string> CandidateSkills { get; set; } = new();
    public List<string> RequiredJobSkills { get; set; } = new();
    public int? PreviousInterviewScore { get; set; }
    public int InterviewDurationMinutes { get; set; }
    public string InterviewStage { get; set; } = "";
    public string? MeetingLink { get; set; }
}

public class LiveQuestionResponse
{
    public int QuestionId { get; set; }
    public string Question { get; set; } = "";
    public string? Category { get; set; }
    public string? Type { get; set; }
    public string? Difficulty { get; set; }
    public string? Skill { get; set; }
    public string? Reason { get; set; }
    public List<string> ExpectedPoints { get; set; } = new();
    public string Status { get; set; } = "";
    public DateTime GeneratedAt { get; set; }
    public DateTime? AskedAt { get; set; }
}

public class CandidateAnswerInsightResponse
{
    public int AnswerId { get; set; }
    public int QuestionId { get; set; }
    public string? AnswerSummary { get; set; }
    public int? RelevanceScore { get; set; }
    public int? DepthScore { get; set; }
    public int? ClarityScore { get; set; }
    public string? Confidence { get; set; }
    public string? PotentialConcern { get; set; }
    public string? SuggestedAction { get; set; }
    public string? SuggestedFollowUpQuestion { get; set; }
    public string Disclaimer { get; set; } = LiveInterviewMessages.Disclaimer;
}

public class InterviewSummaryResponse
{
    public List<string> StrongAreas { get; set; } = new();
    public List<string> AreasRequiringValidation { get; set; } = new();
    public int QuestionsAsked { get; set; }
    public int QuestionsSkipped { get; set; }
    public List<CandidateAnswerInsightResponse> AnswerInsights { get; set; } = new();
    public string AiRecommendation { get; set; } = "Proceed to human review.";
    public string Disclaimer { get; set; } = LiveInterviewMessages.Disclaimer;
}

public class LiveInterviewAiQuestionDto
{
    public string Question { get; set; } = "";
    public string? Category { get; set; }
    public string? Type { get; set; }
    public string? Skill { get; set; }
    public string? Difficulty { get; set; }
    public string? Reason { get; set; }
    public List<string> ExpectedPoints { get; set; } = new();
}

public class LiveInterviewAiAnswerInsightDto
{
    public string? AnswerSummary { get; set; }
    public int? RelevanceScore { get; set; }
    public int? DepthScore { get; set; }
    public int? ClarityScore { get; set; }
    public string? Confidence { get; set; }
    public string? PotentialConcern { get; set; }
    public string? SuggestedAction { get; set; }
    public string? SuggestedFollowUpQuestion { get; set; }
}

public class LiveInterviewAiSummaryDto
{
    public List<string> StrongAreas { get; set; } = new();
    public List<string> AreasRequiringValidation { get; set; } = new();
    public string AiRecommendation { get; set; } = "Proceed to human review.";
}

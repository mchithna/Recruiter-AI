namespace RecruitmentPlatform.Core.DTOs;

public static class DashboardAiMessages
{
    public const string MissingData = "I couldn't find enough current information to complete this request. Please verify the available information and try again.";
    public const string CandidateDisclaimer = "AI-generated guidance is advisory. Review and edit all generated content before using it.";
    public const string AdminDisclaimer = "AI-generated insights are advisory. Backend metrics are calculated exactly before summarization.";
    public const string CandidateOutOfScope = "I'm configured to assist with your profile, resume, job recommendations, applications, skill gaps, and interview preparation. Please ask a candidate-related question.";
    public const string AdminOutOfScope = "I'm configured to assist with user administration, recruitment analytics, organizations, departments, system activity, and hiring-performance insights. Please ask an Admin Dashboard-related question.";
}

public class DashboardAiResponse<T>
{
    public T? Result { get; set; }
    public string Disclaimer { get; set; } = "";
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class ResumeExtractedSkillsDto
{
    public List<string> Skills { get; set; } = new();
}

public class CandidateProfileResumeAnalysisDto
{
    public int ProfileCompletenessScore { get; set; }
    public int ResumeCompletenessScore { get; set; }
    public List<string> MissingProfileInformation { get; set; } = new();
    public List<string> MissingResumeInformation { get; set; } = new();
    public List<string> ExtractedSkills { get; set; } = new();
    public List<string> Education { get; set; } = new();
    public List<string> Experience { get; set; } = new();
    public List<string> Projects { get; set; } = new();
    public List<string> Certifications { get; set; } = new();
    public List<string> Suggestions { get; set; } = new();
}

public class CandidateJobRecommendationDto
{
    public int JobId { get; set; }
    public string JobTitle { get; set; } = "";
    public string? DepartmentName { get; set; }
    public string? EmploymentType { get; set; }
    public string? WorkMode { get; set; }
    public string? Location { get; set; }
    public int MatchScore { get; set; }
    public List<string> MatchingSkills { get; set; } = new();
    public List<string> MissingSkills { get; set; } = new();
    public List<string> RelevantStrengths { get; set; } = new();
    public string Explanation { get; set; } = "";
}

public class CandidateJobRecommendationsDto
{
    public List<CandidateJobRecommendationDto> Recommendations { get; set; } = new();
}

public class CandidateSkillGapDto
{
    public int JobId { get; set; }
    public string JobTitle { get; set; } = "";
    public List<string> AvailableRequiredSkills { get; set; } = new();
    public List<string> MissingRequiredSkills { get; set; } = new();
    public List<string> PreferredSkills { get; set; } = new();
    public List<string> SuggestedLearningAreas { get; set; } = new();
    public List<string> PracticalRecommendations { get; set; } = new();
}

public class CandidateApplicationAssistanceRequestDto
{
    public int JobId { get; set; }
    public string? Notes { get; set; }
}

public class CandidateApplicationAssistanceDto
{
    public List<string> ApplicationTips { get; set; } = new();
    public List<string> ProfileSummarySuggestions { get; set; } = new();
    public string CoverLetterDraft { get; set; } = "";
    public List<string> InterviewPreparationGuidance { get; set; } = new();
    public List<string> ReviewChecklist { get; set; } = new();
}

public class AdminAnalyticsSummaryDto
{
    public object? Metrics { get; set; }
    public string Summary { get; set; } = "";
    public List<string> Observations { get; set; } = new();
    public List<string> SuggestedActions { get; set; } = new();
}

public class AdminInsightsDto
{
    public List<string> RecruitmentInsights { get; set; } = new();
    public List<string> Bottlenecks { get; set; } = new();
    public List<string> AttentionRequired { get; set; } = new();
    public List<string> Trends { get; set; } = new();
}

public class AdminActivitySummaryDto
{
    public string Summary { get; set; } = "";
    public List<string> ImportantEvents { get; set; } = new();
    public List<string> RecentChangesRequiringAttention { get; set; } = new();
}

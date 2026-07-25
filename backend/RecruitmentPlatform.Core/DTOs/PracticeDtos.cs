namespace RecruitmentPlatform.Core.DTOs;

public class StartPracticeRequestDto
{
    public int SkillId { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public string SourceType { get; set; } = string.Empty;
    public int? SourceApplicationId { get; set; }
    public int? SourceInterviewId { get; set; }
}

public class SubmitAnswerRequestDto
{
    public int PracticeQuestionId { get; set; }
    public string CandidateAnswer { get; set; } = string.Empty;
}

public class PracticeSessionResponseDto
{
    public int Id { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? Score { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<PracticeSessionQuestionDto> Questions { get; set; } = new();
}

public class PracticeSessionQuestionDto
{
    public int Id { get; set; }
    public int PracticeQuestionId { get; set; }
    public int QuestionOrder { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
    
    // Only revealed after answering or when session is complete
    public string? CandidateAnswer { get; set; }
    public string? CorrectOption { get; set; }
    public string? ExplanationText { get; set; }
    public bool? IsCorrect { get; set; }
    public DateTime? AnsweredAt { get; set; }
}

public class PracticeSourcesResponseDto
{
    public int UsedToday { get; set; }
    public int DailyQuota { get; set; } = 5;
    public List<PracticeSourceDto> Sources { get; set; } = new();
}

public class PracticeSourceDto
{
    public int SourceId { get; set; }
    public string SourceType { get; set; } = string.Empty; // "Interview" or "Application"
    public string Title { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public List<SkillDto> Skills { get; set; } = new();
}

public class SkillDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

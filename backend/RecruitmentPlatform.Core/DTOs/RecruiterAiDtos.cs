using System.Text.Json;
using System.Text.Json.Serialization;

namespace RecruitmentPlatform.Core.DTOs;

public static class RecruiterAiMessages
{
    public const string MissingData = "I couldn’t find enough current information to complete this request. Please verify the candidate, vacancy, or application data and try again.";
    public const string MissingJobDescriptionInput = "Add a job title, description, or requirements before using AI to improve the job description.";
    public const string JobDescriptionGenerationFailed = "AI could not generate a job description right now. Please try again after reviewing the job details.";
    public const string Disclaimer = "AI-generated insights are provided to support recruiter review. Please verify candidate information before making employment decisions.";
    public const string OutOfScope = "I’m configured to assist with vacancies, candidates, applications, screening, interviews, and recruitment analytics. Please ask a question related to the Recruiter Dashboard.";
}

public class RecruiterAiResponse<T>
{
    public T? Result { get; set; }
    public string Disclaimer { get; set; } = RecruiterAiMessages.Disclaimer;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class CvAnalysisResultDto
{
    public List<string> Education { get; set; } = new();
    public List<string> Experience { get; set; } = new();
    public List<string> Skills { get; set; } = new();
    public List<string> Certifications { get; set; } = new();
    public List<string> Projects { get; set; } = new();
    public List<string> RelevantStrengths { get; set; } = new();
    public List<string> MissingOrUnclearInformation { get; set; } = new();
    public string EstimatedRelevantExperience { get; set; } = "";
}

public class CandidateJobMatchResultDto
{
    public int OverallMatchScore { get; set; }
    public int SkillMatchScore { get; set; }
    public int ExperienceMatchScore { get; set; }
    public int EducationMatchScore { get; set; }
    public List<string> MatchedRequirements { get; set; } = new();
    public List<string> MissingRequirements { get; set; } = new();
    public List<string> Strengths { get; set; } = new();
    public List<string> Concerns { get; set; } = new();
    public string Explanation { get; set; } = "";
}

public class CandidateSummaryResultDto
{
    public string CandidateName { get; set; } = "";
    public string Summary { get; set; } = "";
    public List<string> Strengths { get; set; } = new();
    public List<string> QualificationGaps { get; set; } = new();
    public List<string> ManualReviewFlags { get; set; } = new();
}

public class CandidateRankingItemDto
{
    public int ApplicationId { get; set; }
    public string CandidateName { get; set; } = "";
    public int ExplainableRank { get; set; }
    public int MatchScore { get; set; }
    public List<string> Strengths { get; set; } = new();
    public List<string> QualificationGaps { get; set; } = new();
    public string Explanation { get; set; } = "";
}

public class CandidateRankingResultDto
{
    public string JobTitle { get; set; } = "";
    public List<CandidateRankingItemDto> Rankings { get; set; } = new();
}

public class JobDescriptionRequestDto
{
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? Responsibilities { get; set; }
    public string? RequiredSkills { get; set; }
    public string? PreferredSkills { get; set; }
    public string? Experience { get; set; }
    public string? Education { get; set; }
    public string? EmploymentType { get; set; }
    public string? WorkMode { get; set; }
    public string? Location { get; set; }
    public string? ExistingDescription { get; set; }
    public string? ExistingRequirements { get; set; }
}

public class JobDescriptionResultDto
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    [JsonConverter(typeof(StringOrStringArrayConverter))]
    public string Requirements { get; set; } = "";
    [JsonConverter(typeof(StringListOrStringConverter))]
    public List<string> ReviewNotes { get; set; } = new();
}

public sealed class StringOrStringArrayConverter : JsonConverter<string>
{
    public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.TokenType switch
        {
            JsonTokenType.String => reader.GetString() ?? string.Empty,
            JsonTokenType.StartArray => string.Join(Environment.NewLine, ReadArray(ref reader)),
            JsonTokenType.Null => string.Empty,
            _ => throw new JsonException("Expected a string or an array of strings.")
        };
    }

    private static List<string> ReadArray(ref Utf8JsonReader reader)
    {
        var values = new List<string>();
        while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
        {
            if (reader.TokenType != JsonTokenType.String) throw new JsonException("Expected an array of strings.");
            var value = reader.GetString();
            if (!string.IsNullOrWhiteSpace(value)) values.Add(value.Trim());
        }
        return values;
    }

    public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options) => writer.WriteStringValue(value);
}

public sealed class StringListOrStringConverter : JsonConverter<List<string>>
{
    public override List<string> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var value = reader.GetString();
            return string.IsNullOrWhiteSpace(value) ? [] : [value.Trim()];
        }

        if (reader.TokenType == JsonTokenType.StartArray)
        {
            var values = new List<string>();
            while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
            {
                if (reader.TokenType != JsonTokenType.String) throw new JsonException("Expected an array of strings.");
                var value = reader.GetString();
                if (!string.IsNullOrWhiteSpace(value)) values.Add(value.Trim());
            }
            return values;
        }

        if (reader.TokenType == JsonTokenType.Null) return [];
        throw new JsonException("Expected a string or an array of strings.");
    }

    public override void Write(Utf8JsonWriter writer, List<string> value, JsonSerializerOptions options)
    {
        writer.WriteStartArray();
        foreach (var item in value) writer.WriteStringValue(item);
        writer.WriteEndArray();
    }
}

public class InterviewQuestionResultDto
{
    public List<string> TechnicalQuestions { get; set; } = new();
    public List<string> BehavioralQuestions { get; set; } = new();
    public List<string> SituationalQuestions { get; set; } = new();
    public List<string> CandidateSpecificQuestions { get; set; } = new();
    public List<string> SuggestedEvaluationCriteria { get; set; } = new();
}

public class ScreeningAssistanceResultDto
{
    public List<string> CandidatesMeetingMandatoryRequirements { get; set; } = new();
    public List<string> MissingQualifications { get; set; } = new();
    public List<string> ApplicationsNeedingManualReview { get; set; } = new();
    public List<string> PossibleDuplicateApplications { get; set; } = new();
    public List<string> InformationRequiringVerification { get; set; } = new();
}

public class AnalyticsSummaryResultDto
{
    public string Summary { get; set; } = "";
    public List<string> Observations { get; set; } = new();
    public List<string> SuggestedActions { get; set; } = new();
}

public class MessageDraftRequestDto
{
    public int ApplicationId { get; set; }
    public string MessageType { get; set; } = "";
    public string? Notes { get; set; }
}

public class MessageDraftResultDto
{
    public string Subject { get; set; } = "";
    public string Body { get; set; } = "";
}

public class JobSkillsExtractionRequestDto
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Requirements { get; set; } = "";
}

public class JobSkillsExtractionResultDto
{
    public List<string> ExtractedSkills { get; set; } = new();
}

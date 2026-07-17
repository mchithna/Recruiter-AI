namespace RecruitmentPlatform.Core.DTOs;

public class ChatMessageRequestDto
{
    public string Message { get; set; } = string.Empty;
    public int? SessionId { get; set; }
    public string? Path { get; set; }
}

public class ChatMessageResponseDto
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public string ContextKey { get; set; } = string.Empty;
    public string ResponseType { get; set; } = "answer";
}

public class ChatSessionDto
{
    public int Id { get; set; }
    public string? SessionContext { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public List<ChatMessageResponseDto> Messages { get; set; } = new();
}

public class ChatContextMetadataDto
{
    public string ContextKey { get; set; } = string.Empty;
    public string AssistantName { get; set; } = "Hirely";
    public string WelcomeMessage { get; set; } = string.Empty;
    public string ScopeDescription { get; set; } = string.Empty;
    public string OutOfScopeResponse { get; set; } = string.Empty;
    public string MissingDataResponse { get; set; } = string.Empty;
    public bool RequiresAuthentication { get; set; }
    public IReadOnlyList<string> ExampleQuestions { get; set; } = Array.Empty<string>();
}

public class ChatGenerationRequest
{
    public string SystemInstruction { get; set; } = string.Empty;
    public string UserMessage { get; set; } = string.Empty;
    public IReadOnlyList<ChatHistoryItem> History { get; set; } = Array.Empty<ChatHistoryItem>();
}

public class ChatHistoryItem
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

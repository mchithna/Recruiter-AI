namespace RecruitmentPlatform.Core.DTOs;

public class ChatMessageRequestDto
{
    public string Message { get; set; } = string.Empty;
    public int? SessionId { get; set; }
}

public class ChatMessageResponseDto
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
}

public class ChatSessionDto
{
    public int Id { get; set; }
    public string? SessionContext { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public List<ChatMessageResponseDto> Messages { get; set; } = new();
}

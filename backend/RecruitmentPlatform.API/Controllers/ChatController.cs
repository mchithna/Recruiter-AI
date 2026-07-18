using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.API.Chat;
using RecruitmentPlatform.Core.DTOs;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAiChatService _aiChatService;
    private readonly IChatContextResolver _contextResolver;
    private readonly IChatPermissionValidator _permissionValidator;
    private readonly IChatInputValidator _inputValidator;
    private readonly IChatScopeClassifier _scopeClassifier;
    private readonly IChatDataRetrievalService _dataRetrievalService;
    private readonly IChatPromptBuilder _promptBuilder;
    private readonly IChatRateLimiter _rateLimiter;
    private readonly ILogger<ChatController> _logger;

    public ChatController(
        ApplicationDbContext context,
        IAiChatService aiChatService,
        IChatContextResolver contextResolver,
        IChatPermissionValidator permissionValidator,
        IChatInputValidator inputValidator,
        IChatScopeClassifier scopeClassifier,
        IChatDataRetrievalService dataRetrievalService,
        IChatPromptBuilder promptBuilder,
        IChatRateLimiter rateLimiter,
        ILogger<ChatController> logger)
    {

        _context = context;
        _aiChatService = aiChatService;
        _contextResolver = contextResolver;
        _permissionValidator = permissionValidator;
        _inputValidator = inputValidator;
        _scopeClassifier = scopeClassifier;
        _dataRetrievalService = dataRetrievalService;
        _promptBuilder = promptBuilder;
        _rateLimiter = rateLimiter;
        _logger = logger;
    }

    [AllowAnonymous]
    [HttpGet("context")]
    public ActionResult<ChatContextMetadataDto> GetContext([FromQuery] string? path)
    {
        var resolved = _contextResolver.Resolve(path, User);
        if (!_permissionValidator.IsAllowed(resolved))
        {
            return Unauthorized(new { message = "Please log in and open the relevant dashboard to use this assistant." });
        }

        return Ok(_contextResolver.ToMetadata(resolved));
    }

    [AllowAnonymous]
    [HttpGet("sessions")]
    public async Task<ActionResult<IEnumerable<ChatSessionDto>>> GetSessions([FromQuery] string? contextKey)
    {
        var resolved = _contextResolver.Resolve(null, User, contextKey);
        if (resolved.Config.ContextKey == ChatAssistantConfigProvider.Home && !resolved.IsAuthenticated)
        {
            return Ok(Array.Empty<ChatSessionDto>());
        }

        if (!_permissionValidator.IsAllowed(resolved))
        {
            return Unauthorized(new { message = "Please log in and open the relevant dashboard to view chat history." });
        }

        var sessions = await _context.ChatSessions
            .AsNoTracking()
            .Where(s => s.UserId == resolved.UserId!.Value && s.SessionContext == resolved.Config.ContextKey)
            .OrderByDescending(s => s.StartedAt)
            .Select(s => new ChatSessionDto
            {
                Id = s.Id,
                SessionContext = s.SessionContext,
                StartedAt = s.StartedAt,
                EndedAt = s.EndedAt
            })
            .ToListAsync();

        return Ok(sessions);
    }

    [Authorize]
    [HttpGet("sessions/{id:int}")]
    public async Task<ActionResult<ChatSessionDto>> GetSession(int id, [FromQuery] string? contextKey)
    {
        var resolved = _contextResolver.Resolve(null, User, contextKey);
        if (!_permissionValidator.IsAllowed(resolved))
        {
            return Unauthorized(new { message = "You are not authorized to view this chat session." });
        }

        var session = await _context.ChatSessions
            .AsNoTracking()
            .Include(s => s.ChatMessages)
            .FirstOrDefaultAsync(s =>
                s.Id == id
                && s.UserId == resolved.UserId!.Value
                && s.SessionContext == resolved.Config.ContextKey);

        if (session == null)
        {
            return NotFound(new { message = "Session not found." });
        }

        return Ok(new ChatSessionDto
        {
            Id = session.Id,
            SessionContext = session.SessionContext,
            StartedAt = session.StartedAt,
            EndedAt = session.EndedAt,
            Messages = session.ChatMessages.OrderBy(m => m.SentAt).Select(m => new ChatMessageResponseDto
            {
                Id = m.Id,
                SessionId = m.SessionId,
                Role = m.Role,
                Content = m.Content,
                SentAt = m.SentAt,
                ContextKey = resolved.Config.ContextKey
            }).ToList()
        });
    }

    [AllowAnonymous]
    [HttpPost("message")]
    public async Task<ActionResult<ChatMessageResponseDto>> SendMessage([FromBody] ChatMessageRequestDto request, CancellationToken cancellationToken)
    {
        var resolved = _contextResolver.Resolve(request.Path, User);
        if (!_permissionValidator.IsAllowed(resolved))
        {
            return Unauthorized(new { message = "Please log in and open the relevant dashboard to use this assistant." });
        }

        var rateKey = resolved.UserId?.ToString() ?? HttpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous";
        if (!_rateLimiter.IsAllowed($"{resolved.Config.ContextKey}:{rateKey}"))
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new { message = "Too many chat requests. Please wait a moment and try again." });
        }

        var validation = _inputValidator.Validate(request.Message);
        if (!validation.IsValid)
        {
            return BadRequest(new { message = validation.ErrorMessage });
        }

        var scope = _scopeClassifier.Classify(resolved, validation.SanitizedMessage);
        if (!scope.IsAllowed)
        {
            return await ReturnAssistantMessageAsync(resolved, request.SessionId, validation.SanitizedMessage, scope.Response!, "out_of_scope", cancellationToken);
        }

        ChatDataSnapshot snapshot;
        try
        {
            snapshot = await _dataRetrievalService.GetSnapshotAsync(resolved, cancellationToken);
        }
        catch
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Chat data is temporarily unavailable. Please try again." });
        }

        if (!snapshot.HasData)
        {
            return await ReturnAssistantMessageAsync(resolved, request.SessionId, validation.SanitizedMessage, resolved.Config.MissingDataResponse, "missing_data", cancellationToken);
        }

        var session = await GetOrCreateSessionAsync(resolved, request.SessionId, cancellationToken);
        var history = session?.ChatMessages.OrderBy(m => m.SentAt).ToList() ?? new List<ChatMessage>();
        
        var prompt = _promptBuilder.Build(resolved, validation.SanitizedMessage, snapshot, history);
        var aiResponseText = await _aiChatService.GenerateResponseAsync(prompt, cancellationToken);

        var aiMessage = new ChatMessage
        {
            SessionId = session?.Id ?? 0,
            Role = "AI",
            Content = aiResponseText,
            SentAt = DateTime.UtcNow
        };

        if (session != null)
        {
            var userMessage = new ChatMessage
            {
                SessionId = session.Id,
                Role = "User",
                Content = validation.SanitizedMessage,
                SentAt = DateTime.UtcNow
            };
            
            _context.ChatMessages.Add(userMessage);
            _context.ChatMessages.Add(aiMessage);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Ok(ToResponse(aiMessage, resolved.Config.ContextKey));
    }

    private async Task<ActionResult<ChatMessageResponseDto>> ReturnAssistantMessageAsync(
        ChatResolvedContext resolved,
        int? sessionId,
        string userText,
        string assistantText,
        string responseType,
        CancellationToken cancellationToken)
    {
        if (resolved.Config.ContextKey == ChatAssistantConfigProvider.Home)
        {
            return Ok(new ChatMessageResponseDto
            {
                Id = 0,
                SessionId = 0,
                Role = "AI",
                Content = assistantText,
                SentAt = DateTime.UtcNow,
                ContextKey = resolved.Config.ContextKey,
                ResponseType = responseType
            });
        }

        var session = await GetOrCreateSessionAsync(resolved, sessionId, cancellationToken);
        if (session == null)
        {
            return NotFound(new { message = "Session not found." });
        }

        var userMessage = new ChatMessage
        {
            SessionId = session.Id,
            Role = "User",
            Content = userText,
            SentAt = DateTime.UtcNow
        };
        var aiMessage = new ChatMessage
        {
            SessionId = session.Id,
            Role = "AI",
            Content = assistantText,
            SentAt = DateTime.UtcNow
        };

        _context.ChatMessages.Add(userMessage);
        _context.ChatMessages.Add(aiMessage);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = ToResponse(aiMessage, resolved.Config.ContextKey);
        dto.ResponseType = responseType;
        return Ok(dto);
    }

    private async Task<ChatSession?> GetOrCreateSessionAsync(ChatResolvedContext resolved, int? sessionId, CancellationToken cancellationToken)
    {
        if (resolved.UserId is null)
        {
            return null;
        }

        if (sessionId.HasValue && sessionId.Value > 0)
        {
            return await _context.ChatSessions
                .Include(s => s.ChatMessages)
                .FirstOrDefaultAsync(s =>
                    s.Id == sessionId.Value
                    && s.UserId == resolved.UserId.Value
                    && s.SessionContext == resolved.Config.ContextKey,
                    cancellationToken);
        }

        var session = new ChatSession
        {
            UserId = resolved.UserId.Value,
            StartedAt = DateTime.UtcNow,
            SessionContext = resolved.Config.ContextKey
        };

        _context.ChatSessions.Add(session);
        await _context.SaveChangesAsync(cancellationToken);
        return session;
    }

    private static ChatMessageResponseDto ToResponse(ChatMessage aiMessage, string contextKey)
    {
        return new ChatMessageResponseDto
        {
            Id = aiMessage.Id,
            SessionId = aiMessage.SessionId,
            Role = aiMessage.Role,
            Content = aiMessage.Content,
            SentAt = aiMessage.SentAt,
            ContextKey = contextKey
        };
    }
}

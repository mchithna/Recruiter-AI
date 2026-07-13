using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.DTOs;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;
using System.Security.Claims;

namespace RecruitmentPlatform.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAiChatService _aiChatService;

    public ChatController(ApplicationDbContext context, IAiChatService aiChatService)
    {
        _context = context;
        _aiChatService = aiChatService;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out int userId))
        {
            return userId;
        }
        return 0; // Fallback, though [Authorize] should prevent this if claims are setup properly
    }

    [HttpGet("sessions")]
    public async Task<ActionResult<IEnumerable<ChatSessionDto>>> GetSessions()
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        var sessions = await _context.ChatSessions
            .Where(s => s.UserId == userId)
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

    [HttpGet("sessions/{id}")]
    public async Task<ActionResult<ChatSessionDto>> GetSession(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        var session = await _context.ChatSessions
            .Include(s => s.ChatMessages)
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (session == null)
            return NotFound();

        var dto = new ChatSessionDto
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
                SentAt = m.SentAt
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost("message")]
    public async Task<ActionResult<ChatMessageResponseDto>> SendMessage([FromBody] ChatMessageRequestDto request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        ChatSession? session;

        if (request.SessionId.HasValue && request.SessionId.Value > 0)
        {
            session = await _context.ChatSessions
                .Include(s => s.ChatMessages)
                .FirstOrDefaultAsync(s => s.Id == request.SessionId.Value && s.UserId == userId);
            
            if (session == null) return NotFound("Session not found");
        }
        else
        {
            session = new ChatSession
            {
                UserId = userId,
                StartedAt = DateTime.UtcNow,
                SessionContext = "General Support"
            };
            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();
        }

        // 1. Add user message
        var userMessage = new ChatMessage
        {
            SessionId = session.Id,
            Role = "User",
            Content = request.Message,
            SentAt = DateTime.UtcNow
        };
        session.ChatMessages.Add(userMessage);
        
        // Save user message first so we have the DB ID if needed, 
        // though we can also save both later.
        await _context.SaveChangesAsync();

        // 2. Call AI Service (passing the full session context)
        var aiResponseText = await _aiChatService.ProcessMessageAsync(session, request.Message);

        // 3. Add AI message
        var aiMessage = new ChatMessage
        {
            SessionId = session.Id,
            Role = "AI",
            Content = aiResponseText,
            SentAt = DateTime.UtcNow
        };
        session.ChatMessages.Add(aiMessage);
        await _context.SaveChangesAsync();

        return Ok(new ChatMessageResponseDto
        {
            Id = aiMessage.Id,
            SessionId = aiMessage.SessionId,
            Role = aiMessage.Role,
            Content = aiMessage.Content,
            SentAt = aiMessage.SentAt
        });
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    private async Task<int?> GetAppUserIdAsync()
    {
        var appUserIdClaim = User.FindFirst("app_user_id")?.Value;
        if (int.TryParse(appUserIdClaim, out var id))
        {
            return id;
        }

        var subValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (!string.IsNullOrEmpty(subValue) && Guid.TryParse(subValue, out var supabaseUserId))
        {
            var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.SupabaseUserId == supabaseUserId);
            if (user != null)
            {
                return user.Id;
            }
        }

        return null;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] bool unreadOnly = false, [FromQuery] int limit = 50)
    {
        var userId = await GetAppUserIdAsync();
        if (!userId.HasValue) return Unauthorized(new { message = "User profile not found." });
        var list = await _unitOfWork.Notifications.FindAsync(n => n.RecipientId == userId.Value && (!unreadOnly || !n.IsRead));

        var result = list.OrderByDescending(n => n.SentAt).Take(limit).Select(n => new
        {
            n.Id,
            n.Type,
            n.Title,
            n.Body,
            n.Channel,
            n.IsRead,
            n.RelatedEntityType,
            n.RelatedEntityId,
            n.SentAt,
            n.ReadAt
        });

        return Ok(result);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = await GetAppUserIdAsync();
        if (!userId.HasValue) return Unauthorized(new { message = "User profile not found." });
        var list = await _unitOfWork.Notifications.FindAsync(n => n.RecipientId == userId.Value && !n.IsRead);
        return Ok(new { unreadCount = list.Count() });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = await GetAppUserIdAsync();
        if (!userId.HasValue) return Unauthorized(new { message = "User profile not found." });
        var notifications = await _unitOfWork.Notifications.FindAsync(n => n.Id == id && n.RecipientId == userId.Value);
        var notif = notifications.FirstOrDefault();
        if (notif == null) return NotFound(new { message = "Notification not found." });

        notif.IsRead = true;
        notif.ReadAt = DateTime.UtcNow;
        _unitOfWork.Notifications.Update(notif);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpPut("mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = await GetAppUserIdAsync();
        if (!userId.HasValue) return Unauthorized(new { message = "User profile not found." });
        var list = (await _unitOfWork.Notifications.FindAsync(n => n.RecipientId == userId.Value && !n.IsRead)).ToList();

        foreach (var n in list)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
            _unitOfWork.Notifications.Update(n);
        }
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { success = true, markedCount = list.Count });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var userId = await GetAppUserIdAsync();
        if (!userId.HasValue) return Unauthorized(new { message = "User profile not found." });
        var notifications = await _unitOfWork.Notifications.FindAsync(n => n.Id == id && n.RecipientId == userId.Value);
        var notif = notifications.FirstOrDefault();
        if (notif == null) return NotFound(new { message = "Notification not found." });

        _unitOfWork.Notifications.Delete(notif);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpPost("test")]
    public async Task<IActionResult> CreateTestNotification([FromQuery] string? title = null, [FromQuery] string? body = null)
    {
        var userId = await GetAppUserIdAsync();
        if (!userId.HasValue) return Unauthorized(new { message = "User profile not found." });
        var notifTitle = string.IsNullOrWhiteSpace(title) ? "🔔 Test Notification" : title.Trim();
        var notifBody = string.IsNullOrWhiteSpace(body) ? "This is a test notification generated to verify system dispatch." : body.Trim();

        var notification = new RecruitmentPlatform.Core.Entities.Notification
        {
            RecipientId = userId.Value,
            Type = "TestNotification",
            Title = notifTitle,
            Body = notifBody,
            Channel = "InApp",
            IsRead = false,
            SentAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { success = true, notification });
    }
}

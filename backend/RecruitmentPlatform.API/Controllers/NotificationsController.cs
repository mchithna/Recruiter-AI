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

    private int GetAppUserId()
    {
        var claim = User.FindFirst("app_user_id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(claim, out var id))
        {
            return id;
        }
        throw new UnauthorizedAccessException("Missing or invalid user ID claim.");
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] bool unreadOnly = false, [FromQuery] int limit = 50)
    {
        var userId = GetAppUserId();
        var list = await _unitOfWork.Notifications.FindAsync(n => n.RecipientId == userId && (!unreadOnly || !n.IsRead));

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
        var userId = GetAppUserId();
        var list = await _unitOfWork.Notifications.FindAsync(n => n.RecipientId == userId && !n.IsRead);
        return Ok(new { unreadCount = list.Count() });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetAppUserId();
        var notifications = await _unitOfWork.Notifications.FindAsync(n => n.Id == id && n.RecipientId == userId);
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
        var userId = GetAppUserId();
        var list = (await _unitOfWork.Notifications.FindAsync(n => n.RecipientId == userId && !n.IsRead)).ToList();

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
        var userId = GetAppUserId();
        var notifications = await _unitOfWork.Notifications.FindAsync(n => n.Id == id && n.RecipientId == userId);
        var notif = notifications.FirstOrDefault();
        if (notif == null) return NotFound(new { message = "Notification not found." });

        _unitOfWork.Notifications.Delete(notif);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { success = true });
    }
}

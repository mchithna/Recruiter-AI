namespace RecruitmentPlatform.Core.Entities;

public class Offer
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public int InitiatedBy { get; set; }
    public int? ManagedBy { get; set; }
    public decimal? OfferedSalary { get; set; }
    public string? SalaryCurrency { get; set; }
    public DateOnly? ProposedStartDate { get; set; }
    public DateOnly? OfferExpiryDate { get; set; }
    public string? OfferLetterUrl { get; set; }
    public string Status { get; set; } = null!;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Application Application { get; set; } = null!;
    public virtual User InitiatedByUser { get; set; } = null!;
    public virtual User? ManagedByUser { get; set; }
}
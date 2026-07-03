namespace RecruitmentPlatform.Core.Entities;

public class CandidateDocument
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public string DocumentType { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public int? FileSizeKb { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime UploadedAt { get; set; }

    public virtual CandidateProfile Candidate { get; set; } = null!;
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
}
namespace RecruitmentPlatform.Core.DTOs.Analytics;

public class ApplicationStatusCountDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class AnalyticsOverviewDto
{
    public int TotalOpenJobs { get; set; }
    public int TotalApplications { get; set; }
    public int TotalShortlisted { get; set; }
    public int TotalInterviewsScheduled { get; set; }
    public int TotalOffersExtended { get; set; }
    public int TotalHires { get; set; }
    public double? AvgAiMatchScore { get; set; }
    public List<ApplicationStatusCountDto> ApplicationsByStatus { get; set; } = new();
}

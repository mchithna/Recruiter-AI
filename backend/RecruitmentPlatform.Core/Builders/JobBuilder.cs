using RecruitmentPlatform.Core.Entities;

namespace RecruitmentPlatform.Core.Builders;

public class JobBuilder
{
    private readonly Job _job = new();
    private decimal? _minimumSalary;
    private decimal? _maximumSalary;
    private string? _salaryCurrency;

    public JobBuilder SetDepartmentId(int departmentId)
    {
        _job.DepartmentId = departmentId;
        return this;
    }

    public JobBuilder SetRecruiterId(int recruiterId)
    {
        _job.RecruiterId = recruiterId;
        return this;
    }

    public JobBuilder SetHiringManagerId(int? hiringManagerId)
    {
        _job.HiringManagerId = hiringManagerId;
        return this;
    }

    public JobBuilder SetTitle(string title)
    {
        _job.Title = title;
        return this;
    }

    public JobBuilder SetDescription(string description)
    {
        _job.Description = description;
        return this;
    }

    public JobBuilder SetRequirements(string? requirements)
    {
        _job.Requirements = requirements;
        return this;
    }

    public JobBuilder SetEmploymentType(string? employmentType)
    {
        _job.EmploymentType = employmentType;
        return this;
    }

    public JobBuilder SetWorkMode(string? workMode)
    {
        _job.WorkMode = workMode;
        return this;
    }

    public JobBuilder SetLocation(string? location)
    {
        _job.Location = location;
        return this;
    }

    public JobBuilder SetApplicationDeadline(DateOnly? applicationDeadline)
    {
        _job.ApplicationDeadline = applicationDeadline;
        return this;
    }

    public JobBuilder SetStatus(string status)
    {
        _job.Status = status;
        return this;
    }

    public JobBuilder SetSalary(decimal minimumSalary, decimal maximumSalary, string currency = "USD")
    {
        _minimumSalary = minimumSalary;
        _maximumSalary = maximumSalary;
        _salaryCurrency = currency;
        return this;
    }

    public Job Build()
    {
        if (string.IsNullOrWhiteSpace(_job.Title))
        {
            throw new InvalidOperationException("Job title must be provided before building.");
        }

        if (string.IsNullOrWhiteSpace(_job.Description))
        {
            throw new InvalidOperationException("Job description must be provided before building.");
        }

        if (string.IsNullOrWhiteSpace(_job.Status))
        {
            _job.Status = "Draft";
        }

        if (_job.CreatedAt == default)
        {
            _job.CreatedAt = DateTime.UtcNow;
        }

        _job.UpdatedAt = DateTime.UtcNow;

        return _job;
    }

    public (decimal? MinimumSalary, decimal? MaximumSalary, string? Currency) GetSalary()
    {
        return (_minimumSalary, _maximumSalary, _salaryCurrency);
    }
}
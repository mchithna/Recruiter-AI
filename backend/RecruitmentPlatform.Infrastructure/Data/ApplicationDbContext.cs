using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.Entities;

namespace RecruitmentPlatform.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserInvitation> UserInvitations => Set<UserInvitation>();
    public DbSet<CandidateProfile> CandidateProfiles => Set<CandidateProfile>();
    public DbSet<CandidateEducation> CandidateEducations => Set<CandidateEducation>();
    public DbSet<CandidateWorkExperience> CandidateWorkExperiences => Set<CandidateWorkExperience>();
    public DbSet<CandidateDocument> CandidateDocuments => Set<CandidateDocument>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<CandidateSkill> CandidateSkills => Set<CandidateSkill>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<JobSkill> JobSkills => Set<JobSkill>();
    public DbSet<JobRecommendation> JobRecommendations => Set<JobRecommendation>();
    public DbSet<AiScreeningResult> AiScreeningResults => Set<AiScreeningResult>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories => Set<ApplicationStatusHistory>();
    public DbSet<CalendarIntegration> CalendarIntegrations => Set<CalendarIntegration>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<Evaluation> Evaluations => Set<Evaluation>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<CommunicationMessage> CommunicationMessages => Set<CommunicationMessage>();
    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Section 1: Identity & Access Management
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.Description)
                .HasColumnName("description")
                .HasMaxLength(255);

            entity.HasIndex(e => e.Name)
                .IsUnique();
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("permissions");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Description)
                .HasColumnName("description")
                .HasMaxLength(255);

            entity.HasIndex(e => e.Name)
                .IsUnique();
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("role_permissions");

            entity.HasKey(e => new { e.RoleId, e.PermissionId });

            entity.Property(e => e.RoleId)
                .HasColumnName("role_id");

            entity.Property(e => e.PermissionId)
                .HasColumnName("permission_id");

            entity.HasOne(e => e.Role)
                .WithMany(e => e.RolePermissions)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Permission)
                .WithMany(e => e.RolePermissions)
                .HasForeignKey(e => e.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Company>(entity =>
        {
            entity.ToTable("companies");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Industry)
                .HasColumnName("industry")
                .HasMaxLength(100);

            entity.Property(e => e.WebsiteUrl)
                .HasColumnName("website_url")
                .HasMaxLength(255);

            entity.Property(e => e.LogoUrl)
                .HasColumnName("logo_url")
                .HasMaxLength(500);

            entity.Property(e => e.Address)
                .HasColumnName("address")
                .HasMaxLength(255);

            entity.Property(e => e.SubscriptionStatus)
                .HasColumnName("subscription_status")
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("Active");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.ToTable("departments");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.CompanyId)
                .HasColumnName("company_id")
                .IsRequired();

            entity.Property(e => e.ParentId)
                .HasColumnName("parent_id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(255)
                .IsRequired();

            entity.HasOne(e => e.Company)
                .WithMany(e => e.Departments)
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ParentDepartment)
                .WithMany(e => e.ChildDepartments)
                .HasForeignKey(e => e.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.RoleId)
                .HasColumnName("role_id")
                .IsRequired();

            entity.Property(e => e.CompanyId)
                .HasColumnName("company_id");

            entity.Property(e => e.DepartmentId)
                .HasColumnName("department_id");

            entity.Property(e => e.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.FirstName)
                .HasColumnName("first_name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.LastName)
                .HasColumnName("last_name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.PhoneNumber)
                .HasColumnName("phone_number")
                .HasMaxLength(20);

            entity.Property(e => e.ProfilePictureUrl)
                .HasColumnName("profile_picture_url")
                .HasMaxLength(500);

            entity.Property(e => e.IsActive)
                .HasColumnName("is_active")
                .IsRequired()
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.LastLoginAt)
                .HasColumnName("last_login_at");

            entity.HasIndex(e => e.Email)
                .IsUnique();

            entity.HasOne(e => e.Role)
                .WithMany(e => e.Users)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Company)
                .WithMany(e => e.Users)
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Department)
                .WithMany(e => e.Users)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UserInvitation>(entity =>
        {
            entity.ToTable("user_invitations");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.CompanyId)
                .HasColumnName("company_id")
                .IsRequired();

            entity.Property(e => e.InvitedBy)
                .HasColumnName("invited_by")
                .IsRequired();

            entity.Property(e => e.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.RoleId)
                .HasColumnName("role_id")
                .IsRequired();

            entity.Property(e => e.DepartmentId)
                .HasColumnName("department_id");

            entity.Property(e => e.InvitationTokenHash)
                .HasColumnName("invitation_token_hash")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.ExpiresAt)
                .HasColumnName("expires_at")
                .IsRequired();

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("Pending");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Company)
                .WithMany(e => e.UserInvitations)
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.InvitedByUser)
                .WithMany(e => e.SentUserInvitations)
                .HasForeignKey(e => e.InvitedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Role)
                .WithMany(e => e.UserInvitations)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Department)
                .WithMany(e => e.UserInvitations)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Section 2: Candidate Profiles & Documents
        modelBuilder.Entity<CandidateProfile>(entity =>
        {
            entity.ToTable("candidate_profiles");

            entity.HasKey(e => e.UserId);

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .ValueGeneratedNever();

            entity.Property(e => e.SummaryText)
                .HasColumnName("summary_text");

            entity.Property(e => e.PortfolioUrl)
                .HasColumnName("portfolio_url")
                .HasMaxLength(255);

            entity.Property(e => e.LinkedinUrl)
                .HasColumnName("linkedin_url")
                .HasMaxLength(255);

            entity.Property(e => e.GithubUrl)
                .HasColumnName("github_url")
                .HasMaxLength(255);

            entity.Property(e => e.LocationCity)
                .HasColumnName("location_city")
                .HasMaxLength(100);

            entity.Property(e => e.YearsOfExperience)
                .HasColumnName("years_of_experience");

            entity.Property(e => e.ResumeParseStatus)
                .HasColumnName("resume_parse_status")
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.User)
                .WithOne(e => e.CandidateProfile)
                .HasForeignKey<CandidateProfile>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CandidateEducation>(entity =>
        {
            entity.ToTable("candidate_education");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.CandidateId)
                .HasColumnName("candidate_id")
                .IsRequired();

            entity.Property(e => e.InstitutionName)
                .HasColumnName("institution_name")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Degree)
                .HasColumnName("degree")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.FieldOfStudy)
                .HasColumnName("field_of_study")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.StartDate)
                .HasColumnName("start_date")
                .IsRequired();

            entity.Property(e => e.EndDate)
                .HasColumnName("end_date");

            entity.Property(e => e.IsCurrent)
                .HasColumnName("is_current")
                .IsRequired()
                .HasDefaultValue(false);

            entity.Property(e => e.Grade)
                .HasColumnName("grade")
                .HasMaxLength(50);

            entity.HasOne(e => e.Candidate)
                .WithMany(e => e.CandidateEducations)
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CandidateWorkExperience>(entity =>
        {
            entity.ToTable("candidate_work_experience");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.CandidateId)
                .HasColumnName("candidate_id")
                .IsRequired();

            entity.Property(e => e.CompanyName)
                .HasColumnName("company_name")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.JobTitle)
                .HasColumnName("job_title")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(255);

            entity.Property(e => e.StartDate)
                .HasColumnName("start_date")
                .IsRequired();

            entity.Property(e => e.EndDate)
                .HasColumnName("end_date");

            entity.Property(e => e.IsCurrent)
                .HasColumnName("is_current")
                .IsRequired()
                .HasDefaultValue(false);

            entity.Property(e => e.Description)
                .HasColumnName("description");

            entity.HasOne(e => e.Candidate)
                .WithMany(e => e.CandidateWorkExperiences)
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CandidateDocument>(entity =>
        {
            entity.ToTable("candidate_documents");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.CandidateId)
                .HasColumnName("candidate_id")
                .IsRequired();

            entity.Property(e => e.DocumentType)
                .HasColumnName("document_type")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.FileName)
                .HasColumnName("file_name")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.FileUrl)
                .HasColumnName("file_url")
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(e => e.FileSizeKb)
                .HasColumnName("file_size_kb");

            entity.Property(e => e.IsPrimary)
                .HasColumnName("is_primary")
                .IsRequired()
                .HasDefaultValue(false);

            entity.Property(e => e.UploadedAt)
                .HasColumnName("uploaded_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Candidate)
                .WithMany(e => e.CandidateDocuments)
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Skill>(entity =>
        {
            entity.ToTable("skills");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(100)
                .IsRequired();

            entity.HasIndex(e => e.Name)
                .IsUnique();
        });

        modelBuilder.Entity<CandidateSkill>(entity =>
        {
            entity.ToTable("candidate_skills");

            entity.HasKey(e => new { e.CandidateId, e.SkillId });

            entity.Property(e => e.CandidateId)
                .HasColumnName("candidate_id");

            entity.Property(e => e.SkillId)
                .HasColumnName("skill_id");

            entity.Property(e => e.ProficiencyLevel)
                .HasColumnName("proficiency_level")
                .HasMaxLength(50);

            entity.Property(e => e.YearsOfExperience)
                .HasColumnName("years_of_experience");

            entity.Property(e => e.ExtractedByAi)
                .HasColumnName("extracted_by_ai")
                .IsRequired()
                .HasDefaultValue(false);

            entity.HasOne(e => e.Candidate)
                .WithMany(e => e.CandidateSkills)
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Skill)
                .WithMany(e => e.CandidateSkills)
                .HasForeignKey(e => e.SkillId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Section 3: Jobs & AI Matching
        modelBuilder.Entity<Job>(entity =>
        {
            entity.ToTable("jobs");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.DepartmentId)
                .HasColumnName("department_id")
                .IsRequired();

            entity.Property(e => e.RecruiterId)
                .HasColumnName("recruiter_id")
                .IsRequired();

            entity.Property(e => e.HiringManagerId)
                .HasColumnName("hiring_manager_id");

            entity.Property(e => e.Title)
                .HasColumnName("title")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Description)
                .HasColumnName("description")
                .IsRequired();

            entity.Property(e => e.Requirements)
                .HasColumnName("requirements");

            entity.Property(e => e.EmploymentType)
                .HasColumnName("employment_type")
                .HasMaxLength(50);

            entity.Property(e => e.WorkMode)
                .HasColumnName("work_mode")
                .HasMaxLength(50);

            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(255);

            entity.Property(e => e.ApplicationDeadline)
                .HasColumnName("application_deadline");

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("Draft");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Department)
                .WithMany(e => e.Jobs)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Recruiter)
                .WithMany(e => e.RecruiterJobs)
                .HasForeignKey(e => e.RecruiterId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.HiringManager)
                .WithMany(e => e.HiringManagerJobs)
                .HasForeignKey(e => e.HiringManagerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<JobSkill>(entity =>
        {
            entity.ToTable("job_skills");

            entity.HasKey(e => new { e.JobId, e.SkillId });

            entity.Property(e => e.JobId)
                .HasColumnName("job_id");

            entity.Property(e => e.SkillId)
                .HasColumnName("skill_id");

            entity.Property(e => e.IsMandatory)
                .HasColumnName("is_mandatory")
                .IsRequired()
                .HasDefaultValue(true);

            entity.HasOne(e => e.Job)
                .WithMany(e => e.JobSkills)
                .HasForeignKey(e => e.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Skill)
                .WithMany(e => e.JobSkills)
                .HasForeignKey(e => e.SkillId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<JobRecommendation>(entity =>
        {
            entity.ToTable("job_recommendations");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.CandidateId)
                .HasColumnName("candidate_id")
                .IsRequired();

            entity.Property(e => e.JobId)
                .HasColumnName("job_id")
                .IsRequired();

            entity.Property(e => e.MatchScore)
                .HasColumnName("match_score")
                .HasPrecision(5, 2)
                .IsRequired();

            entity.Property(e => e.RecommendationReason)
                .HasColumnName("recommendation_reason");

            entity.Property(e => e.IsDismissed)
                .HasColumnName("is_dismissed")
                .IsRequired()
                .HasDefaultValue(false);

            entity.Property(e => e.GeneratedAt)
                .HasColumnName("generated_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => new { e.CandidateId, e.JobId })
                .IsUnique();

            entity.HasOne(e => e.Candidate)
                .WithMany(e => e.JobRecommendations)
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Job)
                .WithMany(e => e.JobRecommendations)
                .HasForeignKey(e => e.JobId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AiScreeningResult>(entity =>
        {
            entity.ToTable("ai_screening_results");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.ApplicationId)
                .HasColumnName("application_id")
                .IsRequired();

            entity.Property(e => e.OverallScore)
                .HasColumnName("overall_score")
                .HasPrecision(5, 2)
                .IsRequired();

            entity.Property(e => e.SkillsMatchScore)
                .HasColumnName("skills_match_score")
                .HasPrecision(5, 2);

            entity.Property(e => e.ExperienceMatchScore)
                .HasColumnName("experience_match_score")
                .HasPrecision(5, 2);

            entity.Property(e => e.EducationMatchScore)
                .HasColumnName("education_match_score")
                .HasPrecision(5, 2);

            entity.Property(e => e.ScreeningSummary)
                .HasColumnName("screening_summary");

            entity.Property(e => e.AiRank)
                .HasColumnName("ai_rank");

            entity.Property(e => e.ProcessedAt)
                .HasColumnName("processed_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.ApplicationId)
                .IsUnique();

            entity.HasOne(e => e.Application)
                .WithOne(e => e.AiScreeningResult)
                .HasForeignKey<AiScreeningResult>(e => e.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Section 4: Applications & Pipeline Tracking
        modelBuilder.Entity<Application>(entity =>
        {
            entity.ToTable("applications");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.JobId)
                .HasColumnName("job_id")
                .IsRequired();

            entity.Property(e => e.CandidateId)
                .HasColumnName("candidate_id")
                .IsRequired();

            entity.Property(e => e.DocumentId)
                .HasColumnName("document_id");

            entity.Property(e => e.CoverLetterText)
                .HasColumnName("cover_letter_text");

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("Applied");

            entity.Property(e => e.AiMatchScore)
                .HasColumnName("ai_match_score")
                .HasPrecision(5, 2);

            entity.Property(e => e.RecruiterNotes)
                .HasColumnName("recruiter_notes");

            entity.Property(e => e.AppliedAt)
                .HasColumnName("applied_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => new { e.JobId, e.CandidateId })
                .IsUnique();

            entity.HasOne(e => e.Job)
                .WithMany(e => e.Applications)
                .HasForeignKey(e => e.JobId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Candidate)
                .WithMany(e => e.CandidateApplications)
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Document)
                .WithMany(e => e.Applications)
                .HasForeignKey(e => e.DocumentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ApplicationStatusHistory>(entity =>
        {
            entity.ToTable("application_status_history");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.ApplicationId)
                .HasColumnName("application_id")
                .IsRequired();

            entity.Property(e => e.ChangedBy)
                .HasColumnName("changed_by")
                .IsRequired();

            entity.Property(e => e.OldStatus)
                .HasColumnName("old_status")
                .HasMaxLength(50);

            entity.Property(e => e.NewStatus)
                .HasColumnName("new_status")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.Notes)
                .HasColumnName("notes");

            entity.Property(e => e.ChangedAt)
                .HasColumnName("changed_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Application)
                .WithMany(e => e.ApplicationStatusHistories)
                .HasForeignKey(e => e.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ChangedByUser)
                .WithMany(e => e.ApplicationStatusHistories)
                .HasForeignKey(e => e.ChangedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Section 5: Interviews, Scheduling & Calendar Integration
        modelBuilder.Entity<CalendarIntegration>(entity =>
        {
            entity.ToTable("calendar_integrations");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.Provider)
                .HasColumnName("provider")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.AccessTokenEncrypted)
                .HasColumnName("access_token_encrypted")
                .IsRequired();

            entity.Property(e => e.RefreshTokenEncrypted)
                .HasColumnName("refresh_token_encrypted");

            entity.Property(e => e.TokenExpiresAt)
                .HasColumnName("token_expires_at");

            entity.Property(e => e.CalendarId)
                .HasColumnName("calendar_id")
                .HasMaxLength(255);

            entity.Property(e => e.ConnectedAt)
                .HasColumnName("connected_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => new { e.UserId, e.Provider })
                .IsUnique();

            entity.HasOne(e => e.User)
                .WithMany(e => e.CalendarIntegrations)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Interview>(entity =>
        {
            entity.ToTable("interviews");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.ApplicationId)
                .HasColumnName("application_id")
                .IsRequired();

            entity.Property(e => e.InterviewerId)
                .HasColumnName("interviewer_id")
                .IsRequired();

            entity.Property(e => e.InterviewType)
                .HasColumnName("interview_type")
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("Video");

            entity.Property(e => e.ScheduledTime)
                .HasColumnName("scheduled_time")
                .IsRequired();

            entity.Property(e => e.DurationMinutes)
                .HasColumnName("duration_minutes")
                .IsRequired()
                .HasDefaultValue(60);

            entity.Property(e => e.MeetingLink)
                .HasColumnName("meeting_link")
                .HasMaxLength(500);

            entity.Property(e => e.CalendarEventId)
                .HasColumnName("calendar_event_id")
                .HasMaxLength(255);

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("Scheduled");

            entity.Property(e => e.Notes)
                .HasColumnName("notes");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Application)
                .WithMany(e => e.Interviews)
                .HasForeignKey(e => e.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Interviewer)
                .WithMany(e => e.InterviewsConducted)
                .HasForeignKey(e => e.InterviewerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Evaluation>(entity =>
        {
            entity.ToTable("evaluations");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.InterviewId)
                .HasColumnName("interview_id")
                .IsRequired();

            entity.Property(e => e.EvaluatedBy)
                .HasColumnName("evaluated_by")
                .IsRequired();

            entity.Property(e => e.OverallScore)
                .HasColumnName("overall_score")
                .IsRequired();

            entity.Property(e => e.FeedbackText)
                .HasColumnName("feedback_text")
                .IsRequired();

            entity.Property(e => e.StrengthsText)
                .HasColumnName("strengths_text");

            entity.Property(e => e.ConcernsText)
                .HasColumnName("concerns_text");

            entity.Property(e => e.HireRecommendation)
                .HasColumnName("hire_recommendation")
                .IsRequired();

            entity.Property(e => e.SubmittedAt)
                .HasColumnName("submitted_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.InterviewId)
                .IsUnique();

            entity.HasOne(e => e.Interview)
                .WithOne(e => e.Evaluation)
                .HasForeignKey<Evaluation>(e => e.InterviewId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.EvaluatedByUser)
                .WithMany(e => e.EvaluationsSubmitted)
                .HasForeignKey(e => e.EvaluatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Section 6: Offers & Final Decisions
        modelBuilder.Entity<Offer>(entity =>
        {
            entity.ToTable("offers");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.ApplicationId)
                .HasColumnName("application_id")
                .IsRequired();

            entity.Property(e => e.InitiatedBy)
                .HasColumnName("initiated_by")
                .IsRequired();

            entity.Property(e => e.ManagedBy)
                .HasColumnName("managed_by");

            entity.Property(e => e.OfferedSalary)
                .HasColumnName("offered_salary")
                .HasPrecision(12, 2);

            entity.Property(e => e.SalaryCurrency)
                .HasColumnName("salary_currency")
                .HasMaxLength(10)
                .HasDefaultValue("USD");

            entity.Property(e => e.ProposedStartDate)
                .HasColumnName("proposed_start_date");

            entity.Property(e => e.OfferExpiryDate)
                .HasColumnName("offer_expiry_date");

            entity.Property(e => e.OfferLetterUrl)
                .HasColumnName("offer_letter_url")
                .HasMaxLength(500);

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("Pending");

            entity.Property(e => e.Notes)
                .HasColumnName("notes");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.ApplicationId)
                .IsUnique();

            entity.HasOne(e => e.Application)
                .WithOne(e => e.Offer)
                .HasForeignKey<Offer>(e => e.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.InitiatedByUser)
                .WithMany(e => e.InitiatedOffers)
                .HasForeignKey(e => e.InitiatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ManagedByUser)
                .WithMany(e => e.ManagedOffers)
                .HasForeignKey(e => e.ManagedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Section 7: Communication & Notifications
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("notifications");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.RecipientId)
                .HasColumnName("recipient_id")
                .IsRequired();

            entity.Property(e => e.Type)
                .HasColumnName("type")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Title)
                .HasColumnName("title")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Body)
                .HasColumnName("body")
                .IsRequired();

            entity.Property(e => e.Channel)
                .HasColumnName("channel")
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("InApp");

            entity.Property(e => e.IsRead)
                .HasColumnName("is_read")
                .IsRequired()
                .HasDefaultValue(false);

            entity.Property(e => e.RelatedEntityType)
                .HasColumnName("related_entity_type")
                .HasMaxLength(50);

            entity.Property(e => e.RelatedEntityId)
                .HasColumnName("related_entity_id");

            entity.Property(e => e.SentAt)
                .HasColumnName("sent_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.ReadAt)
                .HasColumnName("read_at");

            entity.HasOne(e => e.Recipient)
                .WithMany(e => e.NotificationsReceived)
                .HasForeignKey(e => e.RecipientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CommunicationMessage>(entity =>
        {
            entity.ToTable("communication_messages");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.ApplicationId)
                .HasColumnName("application_id")
                .IsRequired();

            entity.Property(e => e.SenderId)
                .HasColumnName("sender_id")
                .IsRequired();

            entity.Property(e => e.RecipientId)
                .HasColumnName("recipient_id")
                .IsRequired();

            entity.Property(e => e.Subject)
                .HasColumnName("subject")
                .HasMaxLength(255);

            entity.Property(e => e.Body)
                .HasColumnName("body")
                .IsRequired();

            entity.Property(e => e.IsRead)
                .HasColumnName("is_read")
                .IsRequired()
                .HasDefaultValue(false);

            entity.Property(e => e.SentAt)
                .HasColumnName("sent_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Application)
                .WithMany(e => e.CommunicationMessages)
                .HasForeignKey(e => e.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Sender)
                .WithMany(e => e.SentCommunicationMessages)
                .HasForeignKey(e => e.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Recipient)
                .WithMany(e => e.ReceivedCommunicationMessages)
                .HasForeignKey(e => e.RecipientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Section 8: AI Chatbot Support
        modelBuilder.Entity<ChatSession>(entity =>
        {
            entity.ToTable("chat_sessions");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.SessionContext)
                .HasColumnName("session_context");

            entity.Property(e => e.StartedAt)
                .HasColumnName("started_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.EndedAt)
                .HasColumnName("ended_at");

            entity.HasOne(e => e.User)
                .WithMany(e => e.ChatSessions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.ToTable("chat_messages");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.SessionId)
                .HasColumnName("session_id")
                .IsRequired();

            entity.Property(e => e.Role)
                .HasColumnName("role")
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(e => e.Content)
                .HasColumnName("content")
                .IsRequired();

            entity.Property(e => e.SentAt)
                .HasColumnName("sent_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Session)
                .WithMany(e => e.ChatMessages)
                .HasForeignKey(e => e.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Section 9: Audit & System Monitoring
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .HasColumnName("user_id");

            entity.Property(e => e.Action)
                .HasColumnName("action")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.EntityType)
                .HasColumnName("entity_type")
                .HasMaxLength(100);

            entity.Property(e => e.EntityId)
                .HasColumnName("entity_id");

            entity.Property(e => e.OldValue)
                .HasColumnName("old_value");

            entity.Property(e => e.NewValue)
                .HasColumnName("new_value");

            entity.Property(e => e.IpAddress)
                .HasColumnName("ip_address")
                .HasMaxLength(45);

            entity.Property(e => e.UserAgent)
                .HasColumnName("user_agent");

            entity.Property(e => e.OccurredAt)
                .HasColumnName("occurred_at")
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.User)
                .WithMany(e => e.AuditLogs)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
namespace RecruitmentPlatform.API.Chat;

public sealed record ChatAssistantConfig(
    string ContextKey,
    string AssistantName,
    string Purpose,
    string DashboardPlaceholder,
    bool RequiresAuthentication,
    IReadOnlySet<string> AllowedRoles,
    IReadOnlyList<string> AllowedTopics,
    IReadOnlyList<string> DisallowedTopics,
    IReadOnlyList<string> DataSources,
    IReadOnlyList<string> ExampleQuestions,
    string WelcomeMessage,
    string ScopeDescription,
    string OutOfScopeResponse,
    string MissingDataResponse);

public interface IChatAssistantConfigProvider
{
    ChatAssistantConfig Get(string contextKey);
    IReadOnlyCollection<ChatAssistantConfig> GetAll();
}

public sealed class ChatAssistantConfigProvider : IChatAssistantConfigProvider
{
    public const string Home = "home";
    public const string Candidate = "candidate";
    public const string Recruiter = "recruiter";
    public const string Admin = "admin";
    public const string HiringManager = "hiring-manager";

    private static readonly string OutOfScope =
        "I'm currently configured to assist with questions related to this dashboard. Please ask a question about the information, features, or activities available here.";

    private static readonly string MissingData =
        "I couldn't find enough current information to answer that question. Please check the dashboard data or contact support.";

    private readonly Dictionary<string, ChatAssistantConfig> _configs = new(StringComparer.OrdinalIgnoreCase)
    {
        [Home] = new(
            Home,
            "Hirely Website Assistant",
            "Help visitors understand Hirely, registration, login, navigation, dashboards, password reset, and support.",
            "Home page assistant",
            false,
            new HashSet<string>(StringComparer.OrdinalIgnoreCase),
            new[] { "website", "services", "features", "register", "login", "password", "navigation", "dashboard", "support", "contact", "pricing" },
            new[] { "private dashboard data", "user analytics", "applications", "candidates", "company data", "system prompt", "api key", "database" },
            new[] { "Public website feature and navigation summary only" },
            new[] { "What is this website?", "How do I register?", "Which dashboard should I use?", "How can I contact support?" },
            "Hi, I'm Hirely. I can help with general website questions, registration, login, navigation, and support.",
            "General website assistance only. Private dashboard data requires logging in and using the relevant dashboard.",
            "I can help with general website questions here. For private dashboard information, please log in and open the relevant dashboard.",
            MissingData),

        [Candidate] = new(
            Candidate,
            "Hirely Candidate Assistant",
            "Help candidates manage their job search, applications, skills, and interviews on the Hirely platform.",
            "Candidate Dashboard",
            true,
            new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Candidate" },
            new[] { "profile", "documents", "resume", "jobs", "applications", "application status", "recommendations", "skill gaps", "cover letter", "interview preparation", "messages", "interviews" },
            new[] { "admin analytics", "recruiter notes for other candidates", "other users", "company staff", "system prompt", "api key", "database" },
            new[] { "Candidate profile", "candidate documents metadata", "candidate applications", "status history", "recommendations", "candidate messages", "candidate interviews" },
            new[] { "Which jobs match my profile?", "How can I improve my profile?", "What skills am I missing for this job?", "Summarize my application progress.", "How should I prepare for this interview?", "What information is missing from my resume?" },
            "Hi, I'm Hirely. I can help with your profile, resume, job matches, skill gaps, applications, and interview preparation.",
            "Candidate dashboard assistance using only your authorized candidate data.",
            "I'm configured to assist with your profile, resume, job recommendations, applications, skill gaps, and interview preparation. Please ask a candidate-related question.",
            "I couldn't find enough current information to complete this request. Please verify the available information and try again."),

        [Recruiter] = new(
            Recruiter,
            "Hirely Recruiter Assistant",
            "Help recruiters manage job postings, candidates, screening processes, and interview schedules.",
            "Recruiter Dashboard",
            true,
            new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Recruiter" },
            new[] { "jobs", "candidates", "applications", "screening", "interviews", "messages", "pipeline", "recruiter" },
            new[] { "admin settings", "candidate private dashboard", "other recruiters", "other companies", "system prompt", "api key", "database" },
            new[] { "Recruiter-owned jobs", "applications for recruiter jobs", "candidate summaries for recruiter jobs", "interviews", "communication messages" },
            new[] { "Which jobs need attention?", "Summarize applications for my jobs.", "What interviews are scheduled?", "Which candidates have high match scores?" },
            "Hi, I'm Hirely. I can help with your jobs, candidate pipeline, applications, interviews, and messages.",
            "Recruiter dashboard assistance using only jobs and candidates you are authorized to access.",
            "I’m configured to assist with vacancies, candidates, applications, screening, interviews, and recruitment analytics. Please ask a question related to the Recruiter Dashboard.",
            "I couldn’t find enough current information to complete this request. Please verify the candidate, vacancy, or application data and try again."),

        [Admin] = new(
            Admin,
            "Hirely Admin Assistant",
            "Help administrators oversee company structure, manage staff, and monitor overall platform analytics.",
            "Admin Dashboard",
            true,
            new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Admin" },
            new[] { "company", "departments", "staff", "users", "analytics", "activity", "audit", "organization", "subscription", "hiring performance", "recruitment trends", "admin attention" },
            new[] { "candidate private dashboard", "recruiter-only notes outside company", "other companies", "system prompt", "api key", "database" },
            new[] { "Company profile", "departments", "staff summaries", "company analytics", "activity log" },
            new[] { "Summarize current recruitment activity.", "Which departments have low application numbers?", "Show important recruitment trends.", "Which hiring stages are slow?", "Summarize recent administrative activity.", "What requires admin attention?", "Compare recruitment performance between departments." },
            "Hi, I'm Hirely. I can help with user administration, recruitment analytics, organizations, departments, system activity, and hiring-performance insights.",
            "Admin dashboard assistance using only your organization's authorized data.",
            "I'm configured to assist with user administration, recruitment analytics, organizations, departments, system activity, and hiring-performance insights. Please ask an Admin Dashboard-related question.",
            "I couldn't find enough current information to complete this request. Please verify the available information and try again."),

        [HiringManager] = new(
            HiringManager,
            "Hirely Hiring Manager Assistant",
            "Help hiring managers review candidate pipelines, evaluate interview performance, and manage hiring decisions.",
            "Hiring Manager Dashboard",
            true,
            new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "HiringManager" },
            new[] { "assigned jobs", "candidates", "applications", "interviews", "evaluations", "hiring pipeline" },
            new[] { "admin settings", "other hiring managers", "other companies", "candidate private dashboard", "system prompt", "api key", "database" },
            new[] { "Hiring-manager assigned jobs", "related applications", "interviews", "evaluations" },
            new[] { "Which candidates need review?", "Summarize my assigned jobs.", "What interviews are scheduled?", "What evaluations are available?" },
            "Hi, I'm Hirely. I can help with your assigned jobs, candidates, applications, interviews, and evaluations.",
            "Hiring Manager dashboard assistance using only assigned hiring data.",
            OutOfScope,
            MissingData)
    };

    public ChatAssistantConfig Get(string contextKey)
    {
        return _configs.TryGetValue(contextKey, out var config) ? config : _configs[Home];
    }

    public IReadOnlyCollection<ChatAssistantConfig> GetAll() => _configs.Values;
}

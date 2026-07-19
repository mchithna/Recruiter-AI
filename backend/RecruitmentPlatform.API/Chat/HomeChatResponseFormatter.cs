namespace RecruitmentPlatform.API.Chat;

public interface IHomeChatResponseFormatter
{
    string Format(string message);
}

public sealed class HomeChatResponseFormatter : IHomeChatResponseFormatter
{
    public string Format(string message)
    {
        var lower = message.ToLowerInvariant();

        if (lower.Contains("analytics")
            || lower.Contains("application status")
            || lower.Contains("candidate")
            || lower.Contains("company hiring")
            || lower.Contains("staff")
            || lower.Contains("activity log")
            || lower.Contains("profile data")
            || lower.Contains("private"))
        {
            return "That information is private dashboard data. Please log in and open the relevant dashboard so I can use the right permissions and current backend data.";
        }

        if (lower.Contains("register") || lower.Contains("sign up") || lower.Contains("create account"))
        {
            return "To register, choose the path that matches you: candidates can go to `/register/candidate`, and companies can go to `/register/company`.";
        }

        if (lower.Contains("login") || lower.Contains("log in") || lower.Contains("sign in"))
        {
            return "To log in, open `/login` and sign in with your account. After login, Hirely opens the dashboard for your role.";
        }

        if (lower.Contains("password"))
        {
            return "Use the password reset option on the login page. If you still cannot access your account, contact support from `/contact`.";
        }

        if (lower.Contains("dashboard"))
        {
            return "Use Candidate for jobs and applications, Recruiter for jobs and candidate pipelines, Admin for company settings and analytics, and Hiring Manager for assigned hiring reviews.";
        }

        if (lower.Contains("contact") || lower.Contains("support"))
        {
            return "You can contact support from `/contact`. For private account or dashboard data, please use the relevant dashboard.";
        }

        if (lower.Contains("feature") || lower.Contains("service") || lower.Contains("available"))
        {
            return "Hirely supports AI-assisted recruiting, job discovery, applications, interviews, messaging, analytics, company management, and role-based dashboards.";
        }

        return "Hirely is an AI-powered recruitment platform for candidates, recruiters, hiring managers, and company administrators.";
    }
}

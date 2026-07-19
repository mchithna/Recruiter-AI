using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RecruitmentPlatform.API.Chat;
using RecruitmentPlatform.API.Controllers;
using RecruitmentPlatform.Core.DTOs;
using RecruitmentPlatform.Infrastructure.Services;
using Xunit;

namespace RecruitmentPlatform.Tests;

public class DashboardAiSecurityTests
{
    [Theory]
    [InlineData(typeof(CandidateAiController), "Candidate")]
    [InlineData(typeof(AdminAiController), "Admin")]
    [InlineData(typeof(CandidateController), "Candidate")]
    public void Dashboard_controllers_require_expected_role(Type controllerType, string role)
    {
        var attribute = controllerType.GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
            .Cast<AuthorizeAttribute>()
            .FirstOrDefault();

        Assert.NotNull(attribute);
        Assert.Equal(role, attribute!.Roles);
    }

    [Theory]
    [InlineData(typeof(CandidateAiController))]
    [InlineData(typeof(AdminAiController))]
    public void Ai_controllers_do_not_expose_data_changing_actions(Type controllerType)
    {
        var methods = controllerType.GetMethods();

        Assert.DoesNotContain(methods, m => m.GetCustomAttributes(typeof(HttpPutAttribute), true).Any());
        Assert.DoesNotContain(methods, m => m.GetCustomAttributes(typeof(HttpDeleteAttribute), true).Any());
        Assert.DoesNotContain(methods, m => m.GetCustomAttributes(typeof(HttpPatchAttribute), true).Any());
    }

    [Fact]
    public void Candidate_unrelated_chat_uses_exact_scope_response()
    {
        var context = Resolve("/candidate/home", "Candidate");
        var result = new ChatScopeClassifier().Classify(context, "Write me a cooking recipe.");

        Assert.False(result.IsAllowed);
        Assert.Equal(DashboardAiMessages.CandidateOutOfScope, result.Response);
    }

    [Fact]
    public void Admin_unrelated_chat_uses_exact_scope_response()
    {
        var context = Resolve("/admin/analytics", "Admin");
        var result = new ChatScopeClassifier().Classify(context, "Tell me today's sports scores.");

        Assert.False(result.IsAllowed);
        Assert.Equal(DashboardAiMessages.AdminOutOfScope, result.Response);
    }

    [Fact]
    public void Candidate_chat_allows_requested_dashboard_questions()
    {
        var context = Resolve("/candidate/jobs", "Candidate");
        var classifier = new ChatScopeClassifier();

        Assert.True(classifier.Classify(context, "Which jobs match my profile?").IsAllowed);
        Assert.True(classifier.Classify(context, "What skills am I missing for this job?").IsAllowed);
        Assert.True(classifier.Classify(context, "How should I prepare for this interview?").IsAllowed);
    }

    [Fact]
    public void Admin_chat_allows_requested_dashboard_questions()
    {
        var context = Resolve("/admin/analytics", "Admin");
        var classifier = new ChatScopeClassifier();

        Assert.True(classifier.Classify(context, "Summarize current recruitment activity.").IsAllowed);
        Assert.True(classifier.Classify(context, "Which hiring stages are slow?").IsAllowed);
        Assert.True(classifier.Classify(context, "Compare recruitment performance between departments.").IsAllowed);
    }

    [Fact]
    public async Task Structured_gemini_reads_general_gemini_settings()
    {
        var service = CreateService(new JsonHandler("""{"profileCompletenessScore":80,"resumeCompletenessScore":60}"""), new Dictionary<string, string?>
        {
            ["GeminiSettings:ApiKey"] = "test-key",
            ["GeminiSettings:Model"] = "gemini-test"
        });

        var result = await service.GenerateJsonAsync<CandidateProfileResumeAnalysisDto>("test", "test");

        Assert.NotNull(result);
        Assert.Equal(80, result!.ProfileCompletenessScore);
    }

    [Fact]
    public async Task Structured_gemini_missing_config_fails_closed_for_dashboard_ai()
    {
        var service = CreateService(new JsonHandler("""{"summary":"ok"}"""), new Dictionary<string, string?>());

        var result = await service.GenerateJsonAsync<AdminAnalyticsSummaryDto>("test", "test");

        Assert.Null(result);
    }

    [Fact]
    public void Rate_limiter_blocks_after_configured_window_limit()
    {
        var limiter = new InMemoryChatRateLimiter();
        var allowed = Enumerable.Range(0, 20).Count(_ => limiter.IsAllowed("dashboard-ai-test"));

        Assert.Equal(20, allowed);
        Assert.False(limiter.IsAllowed("dashboard-ai-test"));
    }

    private static ChatResolvedContext Resolve(string path, string role)
    {
        var resolver = new ChatContextResolver(new ChatAssistantConfigProvider());
        var claims = new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, role),
            new System.Security.Claims.Claim("app_user_id", "10"),
            new System.Security.Claims.Claim("company_id", "20")
        };
        return resolver.Resolve(path, new System.Security.Claims.ClaimsPrincipal(new System.Security.Claims.ClaimsIdentity(claims, "Test")));
    }

    private static GeminiStructuredService CreateService(HttpMessageHandler handler, Dictionary<string, string?> settings) =>
        new(new HttpClient(handler), new ConfigurationBuilder().AddInMemoryCollection(settings).Build(), NullLogger<GeminiStructuredService>.Instance);

    private sealed class JsonHandler : HttpMessageHandler
    {
        private readonly string _json;

        public JsonHandler(string json)
        {
            _json = json;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var escaped = System.Text.Json.JsonSerializer.Serialize(_json);
            var payload = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":" + escaped + "}]}}]}";
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(payload)
            });
        }
    }
}

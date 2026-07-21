using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RecruitmentPlatform.API.Controllers;
using RecruitmentPlatform.Core.DTOs;
using RecruitmentPlatform.Infrastructure.Services;
using Xunit;

namespace RecruitmentPlatform.Tests;

public class LiveInterviewCopilotTests
{
    [Fact]
    public void Live_interview_controller_requires_recruiter_or_hiring_manager()
    {
        var attribute = typeof(LiveInterviewController)
            .GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
            .Cast<AuthorizeAttribute>()
            .FirstOrDefault();

        Assert.NotNull(attribute);
        Assert.Equal("Recruiter,HiringManager", attribute!.Roles);
    }

    [Fact]
    public async Task Live_interview_gemini_ignores_general_dashboard_keys()
    {
        var handler = new RecordingHandler();
        var service = CreateService(handler, new Dictionary<string, string?>
        {
            ["GEMINI_API_KEYS"] = "dashboard-key",
            ["GEMINI_MODEL"] = "dashboard-model"
        });

        var result = await service.GenerateJsonAsync<LiveInterviewAiQuestionDto>("test", "test");

        Assert.Null(result);
        Assert.Empty(handler.RequestedModels);
    }

    [Fact]
    public async Task Live_interview_gemini_tries_live_models_then_text_fallback()
    {
        var handler = new RecordingHandler();
        var service = CreateService(handler, new Dictionary<string, string?>
        {
            ["LIVE_INTERVIEW_GEMINI_API_KEYS"] = "live-key",
            ["LIVE_INTERVIEW_GEMINI_MODELS"] = "live-one,live-two",
            ["LIVE_INTERVIEW_GEMINI_TEXT_FALLBACK_MODEL"] = "text-fallback"
        });

        var result = await service.GenerateJsonAsync<LiveInterviewAiQuestionDto>("test", "test");

        Assert.NotNull(result);
        Assert.Equal(["live-one", "live-two", "text-fallback"], handler.RequestedModels);
        Assert.Equal("Explain dependency injection.", result!.Question);
    }

    private static GeminiLiveInterviewService CreateService(HttpMessageHandler handler, Dictionary<string, string?> settings) =>
        new(new HttpClient(handler), new ConfigurationBuilder().AddInMemoryCollection(settings).Build(), NullLogger<GeminiLiveInterviewService>.Instance);

    private sealed class RecordingHandler : HttpMessageHandler
    {
        public List<string> RequestedModels { get; } = new();

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var segments = request.RequestUri!.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            RequestedModels.Add(segments.Last().Split(':')[0]);

            if (RequestedModels.Count < 3)
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }

            var escaped = System.Text.Json.JsonSerializer.Serialize("""{"question":"Explain dependency injection.","category":"Architecture","type":"Technical","skill":"ASP.NET Core","difficulty":"Intermediate","reason":"Tests required backend skills.","expectedPoints":["Service registration"]}""");
            var payload = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":" + escaped + "}]}}]}";
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(payload)
            });
        }
    }
}

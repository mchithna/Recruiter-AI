using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RecruitmentPlatform.Core.DTOs;
using RecruitmentPlatform.Infrastructure.Services;
using Xunit;

namespace RecruitmentPlatform.Tests;

public class RecruiterAiSecurityTests
{
    [Fact]
    public async Task Structured_gemini_without_key_fails_closed()
    {
        var service = CreateService(new JsonHandler("""{"overallMatchScore":90}"""), new Dictionary<string, string?>());

        var result = await service.GenerateJsonAsync<CandidateJobMatchResultDto>("test", "test");

        Assert.Null(result);
    }

    [Fact]
    public async Task Structured_gemini_timeout_fails_closed()
    {
        var service = CreateService(new TimeoutHandler(), SettingsWithKey());

        var result = await service.GenerateJsonAsync<CandidateJobMatchResultDto>("test", "test");

        Assert.Null(result);
    }

    [Fact]
    public async Task Structured_gemini_invalid_json_fails_closed()
    {
        var service = CreateService(new JsonHandler("not json"), SettingsWithKey());

        var result = await service.GenerateJsonAsync<CandidateJobMatchResultDto>("test", "test");

        Assert.Null(result);
    }

    [Fact]
    public async Task Structured_gemini_valid_json_deserializes()
    {
        var service = CreateService(new JsonHandler("""{"overallMatchScore":82,"skillMatchScore":80,"experienceMatchScore":75,"educationMatchScore":90,"matchedRequirements":["React"],"missingRequirements":[],"strengths":["Frontend"],"concerns":[],"explanation":"Good match."}"""), SettingsWithKey());

        var result = await service.GenerateJsonAsync<CandidateJobMatchResultDto>("test", "test");

        Assert.NotNull(result);
        Assert.Equal(82, result!.OverallMatchScore);
        Assert.Contains("React", result.MatchedRequirements);
    }

    [Fact]
    public async Task Structured_gemini_uses_first_balanced_json_object()
    {
        var service = CreateService(new JsonHandler("{\"overallMatchScore\":81}\n,\n{\"overallMatchScore\":12}"), SettingsWithKey());

        var result = await service.GenerateJsonAsync<CandidateJobMatchResultDto>("test", "test");

        Assert.NotNull(result);
        Assert.Equal(81, result!.OverallMatchScore);
    }

    [Fact]
    public async Task Structured_gemini_falls_back_when_configured_model_is_unavailable()
    {
        var handler = new ModelFallbackHandler();
        var service = CreateService(handler, SettingsWithKey());

        var result = await service.GenerateJsonAsync<CandidateJobMatchResultDto>("test", "test");

        Assert.NotNull(result);
        Assert.Equal(77, result!.OverallMatchScore);
        Assert.Contains("gemini-test", handler.RequestedModels);
        Assert.Contains("gemini-3.1-flash-lite", handler.RequestedModels);
    }

    [Fact]
    public async Task Structured_gemini_honors_configured_model_list_order()
    {
        var handler = new ModelFallbackHandler();
        var service = CreateService(handler, new Dictionary<string, string?>
        {
            ["GEMINI_API_KEY"] = "test-key",
            ["GEMINI_MODELS"] = "gemini-low,gemini-mid,gemini-high"
        });

        var result = await service.GenerateJsonAsync<CandidateJobMatchResultDto>("test", "test");

        Assert.NotNull(result);
        Assert.Equal(["gemini-low", "gemini-mid"], handler.RequestedModels);
    }

    [Fact]
    public async Task Structured_gemini_api_key_provider_does_not_use_vertex_fallback()
    {
        var handler = new AlwaysUnavailableHandler();
        var service = CreateService(handler, new Dictionary<string, string?>
        {
            ["GEMINI_PROVIDER"] = "api-key",
            ["GEMINI_API_KEY"] = "test-key",
            ["VERTEX_AI_PROJECT_ID"] = "test-project"
        });

        var result = await service.GenerateJsonAsync<CandidateJobMatchResultDto>("test", "test");

        Assert.Null(result);
        Assert.All(handler.RequestedHosts, host => Assert.Equal("generativelanguage.googleapis.com", host));
    }

    private static GeminiStructuredService CreateService(HttpMessageHandler handler, Dictionary<string, string?> settings)
    {
        return new GeminiStructuredService(
            new HttpClient(handler),
            new ConfigurationBuilder().AddInMemoryCollection(settings).Build(),
            NullLogger<GeminiStructuredService>.Instance);
    }

    private static Dictionary<string, string?> SettingsWithKey() => new()
    {
        ["GEMINI_API_KEY"] = "test-key",
        ["GEMINI_MODEL"] = "gemini-test"
    };

    private sealed class TimeoutHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            throw new TaskCanceledException("timeout");
        }
    }

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

    private sealed class ModelFallbackHandler : HttpMessageHandler
    {
        public List<string> RequestedModels { get; } = new();

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var segments = request.RequestUri!.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            RequestedModels.Add(segments.Last().Split(':')[0]);

            if (RequestedModels.Count == 1)
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotFound));
            }

            var escaped = System.Text.Json.JsonSerializer.Serialize("""{"overallMatchScore":77}""");
            var payload = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":" + escaped + "}]}}]}";
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(payload)
            });
        }
    }

    private sealed class AlwaysUnavailableHandler : HttpMessageHandler
    {
        public List<string> RequestedHosts { get; } = new();

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            RequestedHosts.Add(request.RequestUri!.Host);
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotFound));
        }
    }
}

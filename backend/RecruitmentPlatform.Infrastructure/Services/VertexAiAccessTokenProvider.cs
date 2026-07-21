using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;

namespace RecruitmentPlatform.Infrastructure.Services;

internal sealed class VertexAiAccessTokenProvider
{
    private static readonly string[] Scopes = ["https://www.googleapis.com/auth/cloud-platform"];

    private readonly string _configuredAccessToken;
    private readonly string _serviceAccountJson;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private GoogleCredential? _credential;

    public VertexAiAccessTokenProvider(IConfiguration configuration)
    {
        _configuredAccessToken = GeminiConfiguration.GetVertexAccessToken(configuration);
        _serviceAccountJson = GeminiConfiguration.GetVertexServiceAccountJson(configuration);
    }

    public async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(_configuredAccessToken))
        {
            return _configuredAccessToken;
        }

        var credential = await GetCredentialAsync(cancellationToken);
        return await credential.GetAccessTokenForRequestAsync(cancellationToken: cancellationToken);
    }

    private async Task<GoogleCredential> GetCredentialAsync(CancellationToken cancellationToken)
    {
        if (_credential != null) return _credential;

        await _lock.WaitAsync(cancellationToken);
        try
        {
            if (_credential != null) return _credential;

            _credential = string.IsNullOrWhiteSpace(_serviceAccountJson)
                ? await GoogleCredential.GetApplicationDefaultAsync(cancellationToken)
                : GoogleCredential.FromJson(_serviceAccountJson);

            if (_credential.IsCreateScopedRequired)
            {
                _credential = _credential.CreateScoped(Scopes);
            }

            return _credential;
        }
        finally
        {
            _lock.Release();
        }
    }
}

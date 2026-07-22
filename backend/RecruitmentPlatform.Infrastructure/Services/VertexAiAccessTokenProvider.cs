using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using System.Text;

namespace RecruitmentPlatform.Infrastructure.Services;

internal sealed class VertexAiAccessTokenProvider
{
    private static readonly string[] Scopes = ["https://www.googleapis.com/auth/cloud-platform"];

    private readonly string _configuredAccessToken;
    private readonly string _serviceAccountJson;
    private readonly string _serviceAccountPath;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private GoogleCredential? _credential;

    public VertexAiAccessTokenProvider(IConfiguration configuration)
    {
        _configuredAccessToken = GeminiConfiguration.GetVertexAccessToken(configuration);
        _serviceAccountJson = GeminiConfiguration.GetVertexServiceAccountJson(configuration);
        _serviceAccountPath = GeminiConfiguration.GetVertexServiceAccountPath(configuration);
    }

    public async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(_configuredAccessToken))
        {
            return _configuredAccessToken;
        }

        var credential = await GetCredentialAsync(cancellationToken);
        return await credential.UnderlyingCredential.GetAccessTokenForRequestAsync(cancellationToken: cancellationToken);
    }

    private async Task<GoogleCredential> GetCredentialAsync(CancellationToken cancellationToken)
    {
        if (_credential != null) return _credential;

        await _lock.WaitAsync(cancellationToken);
        try
        {
            if (_credential != null) return _credential;

            if (!string.IsNullOrWhiteSpace(_serviceAccountJson))
            {
                await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(_serviceAccountJson));
                _credential = (await CredentialFactory.FromStreamAsync<ServiceAccountCredential>(stream, cancellationToken)).ToGoogleCredential();
            }
            else if (!string.IsNullOrWhiteSpace(_serviceAccountPath))
            {
                await using var stream = File.OpenRead(ResolveServiceAccountPath(_serviceAccountPath));
                _credential = (await CredentialFactory.FromStreamAsync<ServiceAccountCredential>(stream, cancellationToken)).ToGoogleCredential();
            }
            else
            {
                _credential = await GoogleCredential.GetApplicationDefaultAsync(cancellationToken);
            }

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

    private static string ResolveServiceAccountPath(string configuredPath)
    {
        var trimmedPath = configuredPath.Trim().Trim('"');
        if (Path.IsPathRooted(trimmedPath) || File.Exists(trimmedPath))
        {
            return trimmedPath;
        }

        var currentDirectoryPath = Path.GetFullPath(trimmedPath, Directory.GetCurrentDirectory());
        if (File.Exists(currentDirectoryPath))
        {
            return currentDirectoryPath;
        }

        var appBasePath = Path.GetFullPath(trimmedPath, AppContext.BaseDirectory);
        return File.Exists(appBasePath) ? appBasePath : trimmedPath;
    }
}

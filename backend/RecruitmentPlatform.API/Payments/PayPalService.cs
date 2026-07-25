using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace RecruitmentPlatform.API.Payments;

public sealed class PayPalService
{
    public const string ProfessionalPlanAmount = "49.00";
    public const string Currency = "USD";

    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public PayPalService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public string ClientId => _configuration["PayPalSettings:ClientId"]?.Trim() ?? "";

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(ClientId) &&
        !string.IsNullOrWhiteSpace(_configuration["PayPalSettings:ClientSecret"]);

    public async Task<string> CreateProfessionalOrderAsync(CancellationToken cancellationToken)
    {
        var accessToken = await GetAccessTokenAsync(cancellationToken);
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{GetBaseUrl()}/v2/checkout/orders");

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        request.Headers.Add("PayPal-Request-Id", Guid.NewGuid().ToString("N"));
        request.Content = JsonContent.Create(new
        {
            intent = "CAPTURE",
            purchase_units = new[]
            {
                new
                {
                    reference_id = "hirely-professional-monthly",
                    description = "Hirely Professional - 1 month",
                    amount = new
                    {
                        currency_code = Currency,
                        value = ProfessionalPlanAmount
                    }
                }
            },
            application_context = new
            {
                brand_name = "Hirely",
                user_action = "PAY_NOW"
            }
        });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        response.EnsureSuccessStatusCode();

        using var payload = JsonDocument.Parse(responseBody);
        return payload.RootElement.GetProperty("id").GetString()
            ?? throw new InvalidOperationException("PayPal did not return an order ID.");
    }

    public async Task<PayPalCaptureResult> CaptureOrderAsync(
        string orderId,
        CancellationToken cancellationToken)
    {
        var accessToken = await GetAccessTokenAsync(cancellationToken);
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{GetBaseUrl()}/v2/checkout/orders/{Uri.EscapeDataString(orderId)}/capture");

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        request.Headers.Add("PayPal-Request-Id", $"capture-{orderId}");
        request.Content = JsonContent.Create(new { });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        response.EnsureSuccessStatusCode();

        using var payload = JsonDocument.Parse(responseBody);
        var root = payload.RootElement;
        var status = root.GetProperty("status").GetString() ?? "UNKNOWN";
        string? captureId = null;

        if (root.TryGetProperty("purchase_units", out var purchaseUnits) &&
            purchaseUnits.GetArrayLength() > 0 &&
            purchaseUnits[0].TryGetProperty("payments", out var payments) &&
            payments.TryGetProperty("captures", out var captures) &&
            captures.GetArrayLength() > 0)
        {
            captureId = captures[0].GetProperty("id").GetString();
        }

        return new PayPalCaptureResult(orderId, status, captureId);
    }

    private async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken)
    {
        var clientSecret = _configuration["PayPalSettings:ClientSecret"]?.Trim();
        if (string.IsNullOrWhiteSpace(ClientId) || string.IsNullOrWhiteSpace(clientSecret))
        {
            throw new InvalidOperationException("PayPal Sandbox credentials are not configured.");
        }

        var basicCredentials = Convert.ToBase64String(
            Encoding.UTF8.GetBytes($"{ClientId}:{clientSecret}"));

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{GetBaseUrl()}/v1/oauth2/token");
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicCredentials);
        request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "client_credentials"
        });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        response.EnsureSuccessStatusCode();

        using var payload = JsonDocument.Parse(responseBody);
        return payload.RootElement.GetProperty("access_token").GetString()
            ?? throw new InvalidOperationException("PayPal did not return an access token.");
    }

    private string GetBaseUrl()
    {
        return (_configuration["PayPalSettings:BaseUrl"]
            ?? "https://api-m.sandbox.paypal.com").TrimEnd('/');
    }
}

public sealed record PayPalCaptureResult(
    string OrderId,
    string Status,
    string? CaptureId);

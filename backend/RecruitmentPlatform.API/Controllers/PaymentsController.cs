using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.API.Payments;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/payments/paypal")]
[AllowAnonymous]
public partial class PaymentsController : ControllerBase
{
    private readonly PayPalService _payPalService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        PayPalService payPalService,
        ILogger<PaymentsController> logger)
    {
        _payPalService = payPalService;
        _logger = logger;
    }

    [HttpGet("config")]
    public IActionResult GetConfig()
    {
        return Ok(new
        {
            enabled = _payPalService.IsConfigured,
            clientId = _payPalService.IsConfigured ? _payPalService.ClientId : "",
            currency = PayPalService.Currency,
            amount = PayPalService.ProfessionalPlanAmount
        });
    }

    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrder(CancellationToken cancellationToken)
    {
        if (!_payPalService.IsConfigured)
        {
            return Problem(
                title: "PayPal Sandbox is not configured.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        try
        {
            var orderId = await _payPalService.CreateProfessionalOrderAsync(cancellationToken);
            return Ok(new { orderId });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "PayPal order creation failed.");
            return Problem(
                title: "PayPal could not create the order.",
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    [HttpPost("orders/{orderId}/capture")]
    public async Task<IActionResult> CaptureOrder(
        string orderId,
        CancellationToken cancellationToken)
    {
        if (!_payPalService.IsConfigured)
        {
            return Problem(
                title: "PayPal Sandbox is not configured.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        if (string.IsNullOrWhiteSpace(orderId) || !PayPalOrderIdPattern().IsMatch(orderId))
        {
            return BadRequest(new { message = "Invalid PayPal order ID." });
        }

        try
        {
            var result = await _payPalService.CaptureOrderAsync(orderId, cancellationToken);
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "PayPal capture failed for order {OrderId}.", orderId);
            return Problem(
                title: "PayPal could not capture the payment.",
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    [GeneratedRegex("^[A-Za-z0-9-]{8,64}$")]
    private static partial Regex PayPalOrderIdPattern();
}

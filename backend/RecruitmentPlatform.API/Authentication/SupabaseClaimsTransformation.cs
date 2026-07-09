using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.API.Authentication;

public class SupabaseClaimsTransformation : IClaimsTransformation
{
    private readonly IUnitOfWork _unitOfWork;

    public SupabaseClaimsTransformation(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        // Avoid adding claims multiple times if TransformAsync is called multiple times
        if (principal.HasClaim(c => c.Type == "app_user_id"))
        {
            return principal;
        }

        // 1. Read the `sub` claim
        var subValue = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? principal.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(subValue) || !Guid.TryParse(subValue, out var supabaseUserId))
        {
            return principal; // Return original principal if no valid sub claim
        }

        // 2. Look up the `users` table via IUnitOfWork where SupabaseUserId == UUID
        var user = await _unitOfWork.Users.FirstOrDefaultAsync(
            u => u.SupabaseUserId == supabaseUserId,
            u => u.Role);

        // 4. If no matching row is found, leave the principal with just its base Supabase claims
        if (user == null)
        {
            return principal;
        }

        // 3. Add custom claims
        var claimsIdentity = new ClaimsIdentity();

        // A claim of type ClaimTypes.Role with the role's Name
        if (user.Role != null)
        {
            claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, user.Role.Name));
        }

        // A custom claim "app_user_id" with the integer Id as its value
        claimsIdentity.AddClaim(new Claim("app_user_id", user.Id.ToString()));

        // A custom claim "company_id" with CompanyId's value (if not null)
        if (user.CompanyId.HasValue)
        {
            claimsIdentity.AddClaim(new Claim("company_id", user.CompanyId.Value.ToString()));
        }

        // A custom claim "department_id" with DepartmentId's value (if not null)
        if (user.DepartmentId.HasValue)
        {
            claimsIdentity.AddClaim(new Claim("department_id", user.DepartmentId.Value.ToString()));
        }

        var clone = principal.Clone();
        clone.AddIdentity(claimsIdentity);

        return clone;
    }
}

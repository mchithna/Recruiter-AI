# RecruitmentPlatform API Local Setup

## Local secrets with .env

1. Copy `.env.example` to `.env` in this folder.
2. Set these values in `.env`:
   - `ConnectionStrings__DefaultConnection`
   - `JwtSettings__SupabaseJwtSecret`
   - `JwtSettings__SupabaseUrl`
   - `GeminiSettings__ApiKey` or `GEMINI_API_KEY`
3. Start the API:

```powershell
dotnet run --launch-profile http
```

The API loads `.env` automatically in development and also accepts user secrets or standard environment variables.

Keep the real Gemini key in local `.env`, user secrets, or deployment secrets only. Do not commit real keys, paste them into frontend files, or log them. The backend accepts either:

```env
GeminiSettings__ApiKey=your-real-key
GEMINI_API_KEY=your-real-key
```

## Chatbot flow

The chat API resolves the active assistant context from trusted route and authenticated role claims, not from a user-supplied dashboard name. Home chat is public and limited to website help. Candidate, Recruiter, Admin, and Hiring Manager chat require authentication and are restricted to authorized backend data for that user, role, company, department, and dashboard.

Requests are validated, rate-limited, checked for prompt-injection and cross-dashboard scope, then supplied with a minimal EF Core data snapshot before calling Gemini. Missing data and out-of-scope questions return configured professional responses without inventing values.

## Deployment

For deployed environments, prefer platform environment variables or a managed secret store.
Use the same keys as the `.env` file:

- `ConnectionStrings__DefaultConnection`
- `JwtSettings__SupabaseJwtSecret`
- `JwtSettings__SupabaseUrl`
- `GeminiSettings__ApiKey` or `GEMINI_API_KEY`

## Swagger

When the API is running, open:

```text
http://localhost:5120/swagger
```

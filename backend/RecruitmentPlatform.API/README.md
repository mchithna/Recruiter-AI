# RecruitmentPlatform API Local Setup

## Local secrets with .env

1. Copy `.env.example` to `.env` in this folder.
2. Set these values in `.env`:
   - `ConnectionStrings__DefaultConnection`
   - `JwtSettings__SupabaseJwtSecret`
   - `JwtSettings__SupabaseUrl`
   - `GEMINI_API_KEY` or `GEMINI_API_KEYS`
   - `GEMINI_MODELS`
3. Start the API:

```powershell
dotnet run --launch-profile http
```

The API loads `.env` automatically in development and also accepts user secrets or standard environment variables.

Keep real Gemini keys, Vertex access tokens, and service credentials in local `.env`, user secrets, or deployment secrets only. Do not commit real secrets, paste them into frontend files, or log them. The backend can use either Gemini API key mode or Vertex AI mode for all AI features.

Gemini API key mode:

```env
GEMINI_PROVIDER=api-key
GEMINI_API_KEY=your-real-key
GEMINI_MODELS=gemini-3.1-flash-lite,gemini-2.5-flash-lite,gemini-2.0-flash-lite,gemini-2.0-flash,gemini-2.5-flash,gemini-3.5-flash
GEMINI_MODEL=gemini-3.1-flash-lite
```

Use `GEMINI_API_KEYS` instead of `GEMINI_API_KEY` when you have multiple AI Studio keys. Separate keys with commas. The backend tries every configured key/model pair before returning an AI unavailable response.

Vertex AI mode:

```env
GEMINI_PROVIDER=vertex
GEMINI_MODEL=gemini-2.5-flash
VERTEX_AI_PROJECT_ID=your-google-cloud-project-id
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_ACCESS_TOKEN=your-gcloud-access-token
```

Hybrid mode tries Gemini API keys first and then Vertex AI if every API-key model is unavailable:

```env
GEMINI_PROVIDER=hybrid
```

For local development, refresh the short-lived Vertex token before starting the API:

```powershell
$env:VERTEX_AI_ACCESS_TOKEN = gcloud auth print-access-token
dotnet run --launch-profile http
```

For deployment, do not use `VERTEX_AI_ACCESS_TOKEN`. Prefer one of these instead:

- Configure workload identity or application default credentials on the host.
- Set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON file path.
- Store the full service account JSON as a secret named `VERTEX_AI_SERVICE_ACCOUNT_JSON`.

The service account needs permission to call Vertex AI, for example `roles/aiplatform.user`.

## Chatbot flow

The chat API resolves the active assistant context from trusted route and authenticated role claims, not from a user-supplied dashboard name. Home chat is public and limited to website help. Candidate, Recruiter, Admin, and Hiring Manager chat require authentication and are restricted to authorized backend data for that user, role, company, department, and dashboard.

Requests are validated, rate-limited, checked for prompt-injection and cross-dashboard scope, then supplied with a minimal EF Core data snapshot before calling Gemini. Missing data and out-of-scope questions return configured professional responses without inventing values.

## Deployment

For deployed environments, prefer platform environment variables or a managed secret store.
Use the same keys as the `.env` file:

- `ConnectionStrings__DefaultConnection`
- `JwtSettings__SupabaseJwtSecret`
- `JwtSettings__SupabaseUrl`
- `GEMINI_API_KEY`
- `GEMINI_API_KEYS`
- `GEMINI_MODELS`
- `GEMINI_MODEL`
- `GEMINI_PROVIDER`
- `VERTEX_AI_PROJECT_ID`
- `VERTEX_AI_LOCATION`
- `VERTEX_AI_ACCESS_TOKEN`
- `VERTEX_AI_SERVICE_ACCOUNT_JSON`

## Swagger

When the API is running, open:

```text
http://localhost:5120/swagger
```

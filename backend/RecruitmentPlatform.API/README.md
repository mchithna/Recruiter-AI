# RecruitmentPlatform API Local Setup

## Local secrets with .env

1. Copy `.env.example` to `.env` in this folder.
2. Set these values in `.env`:
   - `ConnectionStrings__DefaultConnection`
   - `JwtSettings__SupabaseJwtSecret`
3. Start the API:

```powershell
dotnet run --launch-profile http
```

The API loads `.env` automatically in development and also accepts user secrets or standard environment variables.

## Deployment

For deployed environments, prefer platform environment variables or a managed secret store.
Use the same keys as the `.env` file:

- `ConnectionStrings__DefaultConnection`
- `JwtSettings__SupabaseJwtSecret`

## Swagger

When the API is running, open:

```text
http://localhost:5120/swagger
```
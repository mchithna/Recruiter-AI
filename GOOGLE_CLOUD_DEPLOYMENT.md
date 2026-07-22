# Google Cloud Deployment

This app deploys as one Cloud Run service. The React frontend is built into
static files and copied into the ASP.NET Core API `wwwroot`, so the same public
URL serves both the website and `/api/*` backend routes.

## Services

- Cloud Run: runs the unified container.
- Cloud Build: builds the image from this repository.
- Artifact Registry: stores built images.
- Secret Manager: stores backend secrets.
- Cloud Logging: shows startup and request logs.

Supabase remains the hosted database and auth provider.

## Required Cloud Run Variables

Backend secrets should come from Secret Manager:

```text
ConnectionStrings__DefaultConnection
JwtSettings__SupabaseJwtSecret
JwtSettings__SupabaseUrl
AI_PROVIDER
GEMINI_PROVIDER
GEMINI_API_KEY
EmailSettings__AppPassword
```

Public frontend config can be plain Cloud Run environment variables because the
browser must receive these values:

```text
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
FrontendSettings__BaseUrl=https://your-cloud-run-url-or-custom-domain
```

The backend serves these public frontend values from `/config.js` at runtime.
This avoids rebuilding the image just to change Supabase public config.

## Console Deployment

1. In Google Cloud Console, select your project and enable billing.
2. Enable these APIs: Cloud Run, Cloud Build, Artifact Registry, Secret Manager.
3. Add backend secrets in Secret Manager.
4. Open Cloud Run and create a service.
5. Choose continuous deployment from GitHub and select this repository.
6. Use Dockerfile build from the repository root.
7. Set service name to `recruiter-ai`.
8. Select a region near your users, for example `asia-southeast1`.
9. Allow unauthenticated invocations.
10. Set port to `8080`.
11. Attach Secret Manager secrets and public frontend environment variables.
12. Deploy.

After deployment, test:

```text
https://your-service-url/api/health
https://your-service-url/
https://your-service-url/login
```

## CLI Deployment

```powershell
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
gcloud run deploy recruiter-ai --source . --region asia-southeast1 --allow-unauthenticated
```

After the first deploy, configure the Cloud Run revision with the Secret Manager
secrets and public frontend environment variables listed above.

## Local Verification

```powershell
cd frontend
npm run build

cd ..
dotnet test backend\RecruitmentPlatform.Tests\RecruitmentPlatform.Tests.csproj
dotnet publish backend\RecruitmentPlatform.API\RecruitmentPlatform.API.csproj --configuration Release
docker build -t recruiter-ai .
```

Docker requires access to Docker Hub and Microsoft Container Registry to pull
base images.

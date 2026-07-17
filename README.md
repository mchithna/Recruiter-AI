# Recruiter AI

Recruiter AI is a full-stack recruitment platform built for managing hiring workflows across candidate, recruiter, and admin experiences. The app combines role-based dashboards, company management, job and application tracking, interview coordination, messaging, analytics, and AI-assisted recruitment support.

This root README is the main onboarding guide for the project. Backend-specific setup notes are also available in `backend/RecruitmentPlatform.API/README.md`.

## Features

- Role-based authentication with Supabase-backed sessions
- Candidate, recruiter, and admin dashboard areas
- Company profile and organization management tools
- Recruiter job management, application review, interview tracking, and messaging views
- Candidate profile and job search areas
- AI chatbot support powered through a Gemini service integration
- Analytics and activity log screens for administrative visibility
- Shared UI component library for consistent frontend styling
- Swagger-enabled backend API for local development and testing

## Tech Stack

**Frontend**

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- Supabase JavaScript client
- Lucide React icons
- Framer Motion

**Backend**

- ASP.NET Core / .NET 10
- Entity Framework Core
- PostgreSQL with Npgsql
- Supabase JWT authentication
- Swagger / OpenAPI
- Gemini API integration

## Repository Structure

```text
Recruiter-AI/
+-- backend/
|   +-- RecruitmentPlatform.API/             # ASP.NET Core API, controllers, app settings
|   +-- RecruitmentPlatform.Core/            # Entities, DTOs, interfaces, helpers
|   +-- RecruitmentPlatform.Infrastructure/  # EF Core data access, repositories, services
+-- frontend/
|   +-- public/                              # Static assets
|   +-- src/
|       +-- components/                      # Shared UI and layout components
|       +-- contexts/                        # Auth and theme context
|       +-- pages/                           # Public, admin, recruiter, and candidate pages
|       +-- api.js                           # Centralized authenticated API client
|       +-- supabaseClient.js                # Supabase browser client
+-- reference_docs/                          # Planning and design reference docs
+-- context.md                               # Project implementation guidance
+-- database_schema.md                       # Database schema reference
+-- README.md                                # Main project guide
```

## Local Setup

### Prerequisites

- Node.js and npm
- .NET 10 SDK
- PostgreSQL database, typically through Supabase
- Supabase project URL, anon key, and JWT secret
- Gemini API key for AI chat features

### Frontend

1. Go to the frontend folder:

```powershell
cd frontend
```

2. Install dependencies:

```powershell
npm install
```

3. Create a local environment file from the example:

```powershell
Copy-Item .env.example .env
```

4. Fill in the frontend environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

5. Start the frontend dev server:

```powershell
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

### Backend

1. Go to the API project folder:

```powershell
cd backend/RecruitmentPlatform.API
```

2. Restore dependencies:

```powershell
dotnet restore
```

3. Create a local environment file from the example:

```powershell
Copy-Item .env.example .env
```

4. Fill in the backend environment variables:

```env
ConnectionStrings__DefaultConnection=
JwtSettings__SupabaseJwtSecret=
JwtSettings__SupabaseUrl=
GeminiSettings__ApiKey=
EmailSettings__AppPassword=
```

5. Start the backend API:

```powershell
dotnet run --launch-profile http
```

The backend API runs at:

```text
http://localhost:5120
```

Swagger is available at:

```text
http://localhost:5120/swagger
```

## Environment Variables

Environment variables are intentionally kept out of source control. Use local `.env` files for development and platform-managed secrets for deployed environments.

| Area | Variable | Purpose |
| --- | --- | --- |
| Frontend | `VITE_SUPABASE_URL` | Supabase project URL used by the browser app |
| Frontend | `VITE_SUPABASE_ANON_KEY` | Supabase anonymous browser key |
| Backend | `ConnectionStrings__DefaultConnection` | PostgreSQL database connection string |
| Backend | `JwtSettings__SupabaseJwtSecret` | Supabase JWT signing secret |
| Backend | `JwtSettings__SupabaseUrl` | Supabase issuer URL for JWT validation |
| Backend | `GeminiSettings__ApiKey` | Gemini API key for AI chat responses |
| Backend | `EmailSettings__AppPassword` | App password for email notifications |

Never commit `.env` files, API keys, database credentials, JWT secrets, or email passwords.

## Development Notes

- Use the centralized API client in `frontend/src/api.js` for frontend API requests. It automatically attaches the active Supabase access token.
- Use shared UI components from `frontend/src/components/ui` to keep dashboard screens visually consistent.
- Keep API secrets and service credentials in local `.env` files or secure deployment settings.
- Be careful when running the backend against a shared Supabase or PostgreSQL database. Local code changes stay on your machine, but database writes can affect everyone using the same database.
- The backend API is organized around controllers in `backend/RecruitmentPlatform.API/Controllers`, with core entities and DTOs in `RecruitmentPlatform.Core` and data/service implementations in `RecruitmentPlatform.Infrastructure`.

## Useful Local URLs

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5120` |
| Swagger UI | `http://localhost:5120/swagger` |

## Documentation

- `backend/RecruitmentPlatform.API/README.md` contains backend-specific local setup notes.
- `database_schema.md` documents the current database structure.
- `reference_docs/` contains planning, style, and dashboard implementation references.

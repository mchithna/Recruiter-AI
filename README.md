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
- Context-aware chatbot enforcement for Home, Candidate, Recruiter, Admin, and Hiring Manager areas
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
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
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
| Backend | `GEMINI_API_KEY` | Gemini API key used by all backend AI features |
| Backend | `GEMINI_MODEL` | Gemini model used by all backend AI features. Defaults to `gemini-2.5-flash-lite` |
| Backend | `EmailSettings__AppPassword` | App password for email notifications |

Never commit `.env` files, API keys, database credentials, JWT secrets, or email passwords.

### Gemini API key setup

The chatbot and dashboard AI features send Gemini requests only from the ASP.NET backend. Add your real Gemini key and model to `backend/RecruitmentPlatform.API/.env`:

```env
GEMINI_API_KEY=your-real-key
GEMINI_MODEL=gemini-2.5-flash-lite
```

Do not put a real Gemini key in frontend `.env` files, source code, browser requests, logs, or committed examples. The committed `.env.example` files intentionally contain empty placeholders only.

## Chatbot Architecture

The chatbot is split into backend enforcement and frontend display:

- `ChatController` resolves the active page/dashboard, validates auth, rate-limits requests, validates input, rejects out-of-scope questions, retrieves authorized data, builds a scoped prompt, and calls Gemini.
- Assistant configuration is defined separately for Home, Candidate, Recruiter, Admin, and Hiring Manager contexts. Dashboard names/purposes are placeholder values until the final business labels are supplied.
- The backend derives dashboard context from trusted route and authenticated role claims. A user-supplied dashboard name is never trusted as authorization.
- Data snapshots are built from EF Core using current user, role, company, department, and dashboard context. Only scoped data is passed to Gemini.
- The React `ChatBot` component displays server-provided welcome text, example questions, history, loading, error, retry, out-of-scope, and empty-data states.

When a question is outside the active context, the assistant returns a professional scope message instead of asking Gemini. When backend data is unavailable or insufficient, it returns the configured missing-data response and does not invent values.

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

## Tests

Run backend chatbot/security tests:

```powershell
dotnet test backend\RecruitmentPlatform.Tests\RecruitmentPlatform.Tests.csproj
```

Run the frontend production build:

```powershell
cd frontend
npm run build
```

## Documentation

- `backend/RecruitmentPlatform.API/README.md` contains backend-specific local setup notes.
- `database_schema.md` documents the current database structure.
- `reference_docs/` contains planning, style, and dashboard implementation references.

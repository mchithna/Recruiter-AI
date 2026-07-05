# Database Schema: AI-Powered Recruitment & Talent Management Platform

---

## Table of Contents

1. [Identity & Access Management](#1-identity--access-management)
2. [Candidate Profiles & Documents](#2-candidate-profiles--documents)
3. [Jobs & AI Matching](#3-jobs--ai-matching)
4. [Applications & Pipeline Tracking](#4-applications--pipeline-tracking)
5. [Interviews, Scheduling & Calendar Integration](#5-interviews-scheduling--calendar-integration)
6. [Offers & Final Decisions](#6-offers--final-decisions)
7. [Communication & Notifications](#7-communication--notifications)
8. [AI Chatbot Support](#8-ai-chatbot-support)
9. [Audit & System Monitoring](#9-audit--system-monitoring)
10. [Core Relationship Summary](#10-core-relationship-summary)

---

## 1. Identity & Access Management

### `roles`
Defines the four core access levels in the system: Admin, Recruiter, HiringManager, Candidate.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| name | VARCHAR(50) | | NOT NULL, UNIQUE |
| description | VARCHAR(255) | | NULL |

---

### `permissions`
Granular permission definitions for fine-grained RBAC (e.g., `job.create`, `candidate.view`, `report.view`). Decouples what a role *can do* from the role definition itself.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| name | VARCHAR(100) | | NOT NULL, UNIQUE |
| description | VARCHAR(255) | | NULL |

---

### `role_permissions`
Junction table mapping roles to their allowed permissions. Enables the Admin to fine-tune access without changing role definitions.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| role_id | INT | **PK, FK** → roles.id | NOT NULL |
| permission_id | INT | **PK, FK** → permissions.id | NOT NULL |

---

### `companies`
Supports the SaaS multi-tenant architecture. Stores company profile details used in the Admin Portal.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| name | VARCHAR(255) | | NOT NULL |
| industry | VARCHAR(100) | | NULL |
| website_url | VARCHAR(255) | | NULL |
| logo_url | VARCHAR(500) | | NULL |
| address | VARCHAR(255) | | NULL |
| subscription_status | VARCHAR(50) | | NOT NULL, DEFAULT 'Active' (Active, Suspended, Expired) |
| created_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

### `departments`
Maps the internal organisational structure of subscribed companies.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| company_id | INT | **FK** → companies.id | NOT NULL |
|parent_id|INT|FK → departments.id|NULL (NULL = top-level; otherwise child of the referenced department)|
| name | VARCHAR(255) | | NOT NULL |

---

### `users`
Central authentication table for all human users on the platform.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| role_id | INT | **FK** → roles.id | NOT NULL |
| company_id | INT | **FK** → companies.id | NULL (Candidates may not belong to a company) |
|department_id|INT|FK → departments.id|NULL (set when Admin assigns the user to a department)|
| email | VARCHAR(255) | | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | | NOT NULL |
| first_name | VARCHAR(100) | | NOT NULL |
| last_name | VARCHAR(100) | | NOT NULL |
| phone_number | VARCHAR(20) | | NULL |
| profile_picture_url | VARCHAR(500) | | NULL |
| is_active | BOOLEAN | | NOT NULL, DEFAULT TRUE |
| created_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| last_login_at | TIMESTAMP | | NULL |

---

### `user_invitations`
Manages the email invite flow for onboarding Recruiters and Hiring Managers. The Admin enters an email and assigns a role and department; the system sends an invite email containing a time-limited link. The recipient clicks it, sets their password, and their account is created with the pre-assigned role and department already set. Only the token hash is stored — the raw token lives only in the email link.
 
| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| company_id | INT | **FK** → companies.id | NOT NULL |
| invited_by | INT | **FK** → users.id | NOT NULL (the Admin who sent the invite) |
| email | VARCHAR(255) | | NOT NULL |
| role_id | INT | **FK** → roles.id | NOT NULL (pre-assigned role: Recruiter or HiringManager) |
| department_id | INT | **FK** → departments.id | NULL (pre-assigned department from the org chart) |
| invitation_token_hash | VARCHAR(255) | | NOT NULL (only the hash is stored; raw token is in the email link) |
| expires_at | TIMESTAMP | | NOT NULL (typically 48–72 hours from created_at) |
| status | VARCHAR(50) | | NOT NULL, DEFAULT 'Pending' (Pending, Accepted, Expired, Revoked) |
| created_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
 
---

## 2. Candidate Profiles & Documents

### `candidate_profiles`
Stores professional summary and metadata for Candidate users. 1-to-1 relationship with `users`.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| user_id | INT | **PK, FK** → users.id | NOT NULL |
| summary_text | TEXT | | NULL |
| portfolio_url | VARCHAR(255) | | NULL |
| linkedin_url | VARCHAR(255) | | NULL |
| github_url | VARCHAR(255) | | NULL |
| location_city | VARCHAR(100) | | NULL |
| years_of_experience | INT | | NULL |
| resume_parse_status | VARCHAR(50) | | DEFAULT 'Pending' (Pending, Completed, Failed) |
| updated_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

### `candidate_education`
Stores structured education history per candidate. Enables AI matching against job degree requirements and populates the profile education section.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| candidate_id | INT | **FK** → candidate_profiles.user_id | NOT NULL |
| institution_name | VARCHAR(255) | | NOT NULL |
| degree | VARCHAR(100) | | NOT NULL (e.g., B.Sc., M.Sc., Ph.D.) |
| field_of_study | VARCHAR(255) | | NOT NULL |
| start_date | DATE | | NOT NULL |
| end_date | DATE | | NULL (NULL if currently enrolled) |
| is_current | BOOLEAN | | NOT NULL, DEFAULT FALSE |
| grade | VARCHAR(50) | | NULL (e.g., GPA 3.8/4.0, First Class Honours) |

---

### `candidate_work_experience`
Stores chronological work history per candidate. Used for AI experience matching and displayed on the profile reviewed by Recruiters and Hiring Managers.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| candidate_id | INT | **FK** → candidate_profiles.user_id | NOT NULL |
| company_name | VARCHAR(255) | | NOT NULL |
| job_title | VARCHAR(255) | | NOT NULL |
| location | VARCHAR(255) | | NULL |
| start_date | DATE | | NOT NULL |
| end_date | DATE | | NULL (NULL if current role) |
| is_current | BOOLEAN | | NOT NULL, DEFAULT FALSE |
| description | TEXT | | NULL |

---

### `candidate_documents`
Supports multiple document types per candidate (resumes, cover letters, certificates). The `is_primary` flag marks the active default resume used when applying.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| candidate_id | INT | **FK** → candidate_profiles.user_id | NOT NULL |
| document_type | VARCHAR(50) | | NOT NULL (Resume, CoverLetter, Portfolio, Certificate, Other) |
| file_name | VARCHAR(255) | | NOT NULL |
| file_url | VARCHAR(500) | | NOT NULL (Cloud Storage URL) |
| file_size_kb | INT | | NULL |
| is_primary | BOOLEAN | | NOT NULL, DEFAULT FALSE |
| uploaded_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

### `skills`
Master dictionary of all skills, populated by AI extraction and manual entry.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| name | VARCHAR(100) | | NOT NULL, UNIQUE |

---

### `candidate_skills`
Junction table mapping candidates to their skills, with proficiency level and experience years per skill for more granular AI matching.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| candidate_id | INT | **PK, FK** → candidate_profiles.user_id | NOT NULL |
| skill_id | INT | **PK, FK** → skills.id | NOT NULL |
| proficiency_level | VARCHAR(50) | | NULL (Beginner, Intermediate, Advanced, Expert) |
| years_of_experience | INT | | NULL |
| extracted_by_ai | BOOLEAN | | NOT NULL, DEFAULT FALSE |

---

## 3. Jobs & AI Matching

### `jobs`
Vacancies created by Recruiters. Includes employment type, work mode, salary band, application deadline, and a direct hiring manager assignment.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| department_id | INT | **FK** → departments.id | NOT NULL |
| recruiter_id | INT | **FK** → users.id | NOT NULL |
| hiring_manager_id | INT | **FK** → users.id | NULL (pre-assigned manager for this role) |
| title | VARCHAR(255) | | NOT NULL |
| description | TEXT | | NOT NULL |
| requirements | TEXT | | NULL |
| employment_type | VARCHAR(50) | | NULL (Full-Time, Part-Time, Contract, Internship) |
| work_mode | VARCHAR(50) | | NULL (Remote, Hybrid, On-Site) |
| location | VARCHAR(255) | | NULL |
| application_deadline | DATE | | NULL |
| status | VARCHAR(50) | | NOT NULL, DEFAULT 'Draft' (Draft, Open, Paused, Closed) |
| created_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

### `job_skills`
Junction table defining the skills required for a specific job. Used by the AI engine to generate match scores.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| job_id | INT | **PK, FK** → jobs.id | NOT NULL |
| skill_id | INT | **PK, FK** → skills.id | NOT NULL |
| is_mandatory | BOOLEAN | | NOT NULL, DEFAULT TRUE |

---

### `job_recommendations`
Stores AI-generated job recommendations shown on the Candidate Portal homepage. Candidates can dismiss recommendations they are not interested in.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| candidate_id | INT | **FK** → candidate_profiles.user_id | NOT NULL |
| job_id | INT | **FK** → jobs.id | NOT NULL |
| match_score | DECIMAL(5,2) | | NOT NULL (0.00 to 100.00) |
| recommendation_reason | TEXT | | NULL (AI-generated plain-language explanation) |
| is_dismissed | BOOLEAN | | NOT NULL, DEFAULT FALSE |
| generated_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| UNIQUE | | | (candidate_id, job_id) |

---

### `ai_screening_results`
Detailed per-application AI screening breakdown. Stores dimensional scores (skills, experience, education) so Recruiters can understand why a candidate ranked where they did.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| application_id | INT | **FK** → applications.id | NOT NULL, UNIQUE |
| overall_score | DECIMAL(5,2) | | NOT NULL |
| skills_match_score | DECIMAL(5,2) | | NULL |
| experience_match_score | DECIMAL(5,2) | | NULL |
| education_match_score | DECIMAL(5,2) | | NULL |
| screening_summary | TEXT | | NULL (AI-generated narrative summary) |
| ai_rank | INT | | NULL (rank among all applicants for the same job) |
| processed_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

## 4. Applications & Pipeline Tracking

### `applications`
Core transactional table linking a Candidate to a Job. Includes a uniqueness constraint to prevent duplicate applications.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| job_id | INT | **FK** → jobs.id | NOT NULL |
| candidate_id | INT | **FK** → users.id | NOT NULL |
| document_id | INT | **FK** → candidate_documents.id | NULL (the specific resume version submitted) |
| cover_letter_text | TEXT | | NULL |
| status | VARCHAR(50) | | NOT NULL, DEFAULT 'Applied' (Applied, Under Review, Shortlisted, Interview Scheduled, Offer Extended, Hired, Rejected, Withdrawn) |
| ai_match_score | DECIMAL(5,2) | | NULL (populated by AI screening service) |
| recruiter_notes | TEXT | | NULL |
| applied_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| UNIQUE | | | (job_id, candidate_id) |

---

### `application_status_history`
Immutable audit trail recording every status transition on an application: who changed it, when, from what, and to what. This is what powers the Candidate's real-time tracking dashboard.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| application_id | INT | **FK** → applications.id | NOT NULL |
| changed_by | INT | **FK** → users.id | NOT NULL |
| old_status | VARCHAR(50) | | NULL (NULL for the initial 'Applied' entry) |
| new_status | VARCHAR(50) | | NOT NULL |
| notes | TEXT | | NULL |
| changed_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

## 5. Interviews, Scheduling & Calendar Integration

### `calendar_integrations`
Stores encrypted OAuth tokens for Google Calendar and Microsoft Outlook per user. Enables the platform to create, update, and cancel calendar events automatically when interviews are scheduled.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| user_id | INT | **FK** → users.id | NOT NULL |
| provider | VARCHAR(50) | | NOT NULL (Google, Outlook) |
| access_token_encrypted | TEXT | | NOT NULL |
| refresh_token_encrypted | TEXT | | NULL |
| token_expires_at | TIMESTAMP | | NULL |
| calendar_id | VARCHAR(255) | | NULL (the specific calendar to write events to) |
| connected_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| UNIQUE | | | (user_id, provider) |

---

### `interviews`
Scheduled meetings between a shortlisted Candidate and a Hiring Manager. The `calendar_event_id` maintains sync with external calendar providers for updates and cancellations.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| application_id | INT | **FK** → applications.id | NOT NULL |
| interviewer_id | INT | **FK** → users.id | NOT NULL (the Hiring Manager) |
| interview_type | VARCHAR(50) | | NOT NULL, DEFAULT 'Video' (Phone, Video, In-Person, Technical, HR) |
| scheduled_time | TIMESTAMP | | NOT NULL |
| duration_minutes | INT | | NOT NULL, DEFAULT 60 |
| meeting_link | VARCHAR(500) | | NULL (Google Meet / Teams URL) |
| calendar_event_id | VARCHAR(255) | | NULL (external event ID for update/cancel sync) |
| status | VARCHAR(50) | | NOT NULL, DEFAULT 'Scheduled' (Scheduled, Confirmed, Completed, Canceled, Rescheduled) |
| notes | TEXT | | NULL |
| created_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

### `evaluations`
Post-interview feedback submitted by the Hiring Manager. Includes separated strengths and concerns fields alongside the overall score and hire recommendation.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| interview_id | INT | **FK** → interviews.id | NOT NULL, UNIQUE (1-to-1 per interview) |
| evaluated_by | INT | **FK** → users.id | NOT NULL (the Hiring Manager submitting feedback) |
| overall_score | INT | | NOT NULL (1 to 100) |
| feedback_text | TEXT | | NOT NULL |
| strengths_text | TEXT | | NULL |
| concerns_text | TEXT | | NULL |
| hire_recommendation | BOOLEAN | | NOT NULL |
| submitted_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

## 6. Offers & Final Decisions

### `offers`
Tracks the formal job offer lifecycle, initiated by the Hiring Manager and managed by the Recruiter. The `offer_letter_url` points to a signed document in cloud storage.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| application_id | INT | **FK** → applications.id | NOT NULL, UNIQUE (one offer per application) |
| initiated_by | INT | **FK** → users.id | NOT NULL (the Hiring Manager who approved the hire) |
| managed_by | INT | **FK** → users.id | NULL (the Recruiter managing offer delivery) |
| offered_salary | DECIMAL(12,2) | | NULL |
| salary_currency | VARCHAR(10) | | DEFAULT 'USD' |
| proposed_start_date | DATE | | NULL |
| offer_expiry_date | DATE | | NULL |
| offer_letter_url | VARCHAR(500) | | NULL (Cloud Storage link to the signed offer letter) |
| status | VARCHAR(50) | | NOT NULL, DEFAULT 'Pending' (Pending, Sent, Accepted, Declined, Withdrawn, Expired) |
| notes | TEXT | | NULL |
| created_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

## 7. Communication & Notifications

### `notifications`
Unified log for in-app, email, and SMS notifications. The `related_entity_type` and `related_entity_id` fields allow deep-linking from a notification directly to the relevant record.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| recipient_id | INT | **FK** → users.id | NOT NULL |
| type | VARCHAR(100) | | NOT NULL (ApplicationReceived, StatusUpdate, InterviewScheduled, InterviewReminder, OfferExtended, RejectionNotice, SystemAlert) |
| title | VARCHAR(255) | | NOT NULL |
| body | TEXT | | NOT NULL |
| channel | VARCHAR(50) | | NOT NULL, DEFAULT 'InApp' (InApp, Email, SMS) |
| is_read | BOOLEAN | | NOT NULL, DEFAULT FALSE |
| related_entity_type | VARCHAR(50) | | NULL (Application, Interview, Offer) |
| related_entity_id | INT | | NULL |
| sent_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| read_at | TIMESTAMP | | NULL |

---

### `communication_messages`
Direct message thread between a Recruiter and a Candidate, always scoped to a specific application. Supports ongoing communication throughout the recruitment process.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| application_id | INT | **FK** → applications.id | NOT NULL |
| sender_id | INT | **FK** → users.id | NOT NULL |
| recipient_id | INT | **FK** → users.id | NOT NULL |
| subject | VARCHAR(255) | | NULL |
| body | TEXT | | NOT NULL |
| is_read | BOOLEAN | | NOT NULL, DEFAULT FALSE |
| sent_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

## 8. AI Chatbot Support

### `chat_sessions`
Represents a single chatbot conversation initiated by a Candidate. The `session_context` field can hold JSON metadata passed to the AI (e.g., the job currently being viewed) to enable context-aware responses.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| user_id | INT | **FK** → users.id | NOT NULL |
| session_context | TEXT | | NULL (JSON: e.g., current job_id, application stage) |
| started_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| ended_at | TIMESTAMP | | NULL |

---

### `chat_messages`
Individual turns within a chatbot session. The `role` column mirrors the LLM API convention (user / assistant), enabling the full conversation history to be reconstructed and passed back to the AI service on each turn.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | INT | **PK** | NOT NULL, Auto-Increment |
| session_id | INT | **FK** → chat_sessions.id | NOT NULL |
| role | VARCHAR(20) | | NOT NULL (user, assistant) |
| content | TEXT | | NOT NULL |
| sent_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

## 9. Audit & System Monitoring

### `audit_logs`
Immutable, append-only event log for all significant user and system actions across the platform. Powers the Admin Portal's security review and activity monitoring. Uses BIGINT for the PK given expected high write volume.

| Column | Data Type | Keys | Constraints |
|--------|-----------|------|-------------|
| id | BIGINT | **PK** | NOT NULL, Auto-Increment |
| user_id | INT | **FK** → users.id | NULL (NULL indicates an automated system action) |
| action | VARCHAR(100) | | NOT NULL (e.g., USER_LOGIN, JOB_CREATED, APPLICATION_STATUS_CHANGED) |
| entity_type | VARCHAR(100) | | NULL (User, Job, Application, Interview, Offer) |
| entity_id | INT | | NULL |
| old_value | TEXT | | NULL (JSON snapshot of the record before the change) |
| new_value | TEXT | | NULL (JSON snapshot of the record after the change) |
| ip_address | VARCHAR(45) | | NULL (VARCHAR(45) supports both IPv4 and IPv6) |
| user_agent | TEXT | | NULL |
| occurred_at | TIMESTAMP | | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

---

## 10. Core Relationship Summary

### Multi-Tenant Isolation
`companies` sits at the root. `departments` belong to a `company_id`. Internal users (Recruiters, Hiring Managers, Admins) carry a `company_id` on the `users` table. This guarantees complete data isolation between tenants — a Recruiter from Company A can never query jobs, candidates, or reports belonging to Company B.

### RBAC Chain
`users.role_id` → `roles` → `role_permissions` → `permissions`. The backend middleware checks the user's role, loads the associated permissions, and gates every API endpoint against the required permission string.

### Candidate Data Graph
`users` (Candidate role) → `candidate_profiles` (1-to-1) → `candidate_education`, `candidate_work_experience`, `candidate_documents` (1-to-many) → `candidate_skills` (many-to-many via `skills`).

### AI Matching Engine
The `skills` table is the central dictionary. When a resume is uploaded, the AI parser populates `candidate_skills`. When a Recruiter posts a job, they populate `job_skills`. The AI service compares these two junction tables to compute the `ai_match_score` stored on `applications` and the detailed breakdown stored in `ai_screening_results`. The same engine runs in reverse to produce `job_recommendations` for the Candidate Portal homepage.

### Full Hiring Workflow Chain
```
jobs  ──(created by)──►  recruiter_id (users)
  │
  └──► applications  ──(candidate_id)──►  users (Candidate)
            │
            ├──► ai_screening_results
            ├──► application_status_history
            ├──► communication_messages
            │
            └──► interviews  ──(interviewer_id)──►  users (HiringManager)
                      │
                      └──► evaluations
                                │
                                └──► [application status → Hired]
                                            │
                                            └──► offers
```

### Notification Flow
Any status change on `applications`, `interviews`, or `offers` triggers a write to `notifications`. The notification service reads the `channel` field to dispatch via in-app, email, or SMS accordingly.

### Calendar Sync Flow
When an `interviews` record is created or updated, the backend reads `calendar_integrations` for the interviewer's connected provider, creates or updates the event via the external Calendar API, and writes the returned `calendar_event_id` back to the `interviews` row for future updates or cancellations.

### Audit Trail
Every significant write operation appends a row to `audit_logs`, capturing the before and after state as JSON snapshots. `application_status_history` provides a more focused, queryable view of status transitions specifically for the application pipeline.

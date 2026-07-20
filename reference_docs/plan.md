1. Candidate Portal

Page Summary

The job-seeker-facing side of the platform. Covers account creation, profile/resume building, browsing and applying to jobs, an AI-recommended jobs feed, an application tracker, and a support chatbot.

Sub-Features to Build


Auth — register/login, JWT issue & storage (users, roles)
Profile Management — bio, links, location, experience level (candidate_profiles); education history CRUD (candidate_education); work history CRUD (candidate_work_experience)
Resume/Document Uploads — multi-file upload with type tagging and a primary-resume flag (candidate_documents)
Skills — view/edit skill list, distinguish AI-extracted vs. manually added (candidate_skills, skills)
Job Search & Filtering — browse open jobs, filter by employment type / work mode / location (jobs, job_skills)
AI-Powered Recommendations — homepage feed, dismissible cards (job_recommendations)
Apply to Job — submit application with selected resume + cover letter (applications)
Application Tracking Dashboard — status list + timeline (applications, application_status_history)
Messages — thread view per application (communication_messages)
Notifications — bell/inbox (notifications)
AI Chatbot — support widget (chat_sessions, chat_messages)


Step-by-Step Implementation


Auth flow — register/login screens, JWT handling via the shared api instance. Everything else sits behind this.
Profile setup — basic info form first, then education and work experience as repeatable sub-forms.
Resume/document upload — wire to cloud storage, implement the "set as primary" toggle. Trigger the AI resume-parse call here; show resume_parse_status (Pending/Completed/Failed) in the UI.
Skills display — read-only list post-parse, with manual add/edit.
Job search page — list + filter open jobs.
Job detail + Apply flow — block the Apply button until the candidate has at least one is_primary resume uploaded (there's no DB constraint for this — it's a UI/API rule you enforce).
AI recommendations widget — homepage feed reading job_recommendations, with dismiss action.
Application tracker — list view + status timeline per application.
Notifications + messages inbox.
Chatbot widget — build this last; it depends on an external AI API key from the PM.


Notes for This Dev


document_id on applications is nullable at the DB level, but logically every application needs a resume — enforce this in your Apply flow, not just visually.
Resume parsing is asynchronous. Don't assume candidate_skills is populated immediately after upload — poll resume_parse_status or listen for a notification.
Use NotificationFactory (per playbook) any time an action here should trigger a notification (e.g., application submitted).
communication_messages is shared with the Recruiter Portal — confirm the DTO shape with that dev before building your thread UI so you're not reading/writing incompatible formats.
Get the chatbot/resume-parsing AI API key from the PM — don't hardcode it, use environment config.



2. Recruiter Portal

Page Summary

The recruiter's workspace: post jobs, review who applied, screen with AI assistance, shortlist, schedule interviews, sync calendars, and message candidates.

Sub-Features to Build


Job Posting — create/edit/publish/close jobs, tag required skills (jobs, job_skills)
Applicant Review per Job — list of candidates who applied to a specific job (applications)
AI-Powered Screening — view score breakdown and rank per applicant (ai_screening_results)
Shortlisting — update application status through the pipeline (applications.status)
Interview Scheduling — create interviews, assign a Hiring Manager (interviews)
Calendar Integration — connect Google/Outlook, auto-sync interview events (calendar_integrations)
Applicant Communication — message thread per application (communication_messages)
Automated Notifications — status changes, interview confirmations, etc. (notifications)


Step-by-Step Implementation


Job posting CRUD — create/edit/publish/close, with skill tagging. Use the Builder pattern here per the playbook, since a Job is exactly the kind of complex object it's meant for.
Applications inbox — per-job list of applicants.
AI screening display — sortable/filterable by ai_match_score and ai_rank.
Status update actions — shortlist/reject/move-forward, wired through a shared status-update service (see Cross-Cutting Notes — this table is shared with the Hiring Manager dev).
Interview scheduling form — pick application, pick interviewer, set time/type.
Calendar connect flow — OAuth handshake, then auto-create/update/cancel events on interview changes.
Messaging thread UI.
Wire NotificationFactory into every action above that should notify someone (status change, interview scheduled, new message).
Offers view (if time allows) — recruiters manage/send offers that Hiring Managers initiate; coordinate with that dev before building this.


Notes for This Dev


Candidates don't carry a company_id — there's no "browse all candidates" pool. Recruiters only ever see candidates through applications submitted to their own company's jobs. If a general candidate-search feature was expected beyond that, flag it to the PM before building — it doesn't fit the current schema.
Every query must filter by the logged-in recruiter's company_id (from the JWT). Missing this is a data-leak bug across tenants, not just a cosmetic one.
Don't write your own status-history insert logic — see Cross-Cutting Notes on application_status_history.
offers spans your portal and the Hiring Manager's. Agree on shared request/response shapes before either of you starts that controller.
The calendar-connect UI is very likely something the Hiring Manager dev also needs. Consider whether it's worth proposing to the PM as a shared component rather than building it twice.



3. Hiring Manager Dashboard

Page Summary

Where shortlisted candidates get reviewed, interviewed, evaluated, and where the final hire decision gets made.

Sub-Features to Build


Shortlist Review — candidates at Shortlisted/Interview stage for this manager's assigned jobs (applications, interviews)
Candidate Profile View (read-only) — full profile, resume, skills, education, experience
Interview Management — view/confirm/reschedule/cancel interviews they're assigned to (interviews)
Calendar Integration — connect their own Google/Outlook so interviews land on their personal calendar (calendar_integrations)
Feedback Capture & Quantitative Assessment — post-interview evaluation (evaluations)
Offer Initiation — trigger the formal offer once a hire decision is made (offers)


Step-by-Step Implementation


Shortlist/interview queue — list of applications and interviews assigned to this manager.
Candidate detail page — pull the full candidate graph (profile, education, experience, skills, resume link).
Interview detail view — status updates (confirm/cancel/reschedule). Reuse the Recruiter dev's interview-update endpoint rather than duplicating it if it already exists.
Calendar connect — reuse the Recruiter dev's component/flow if already built.
Evaluation form — one submission per completed interview.
Offer initiation form — writes to offers, notifies the recruiter to take it from there.
Notifications inbox.


Notes for This Dev


evaluations.interview_id is UNIQUE — only one evaluation per interview. Your UI needs to prevent duplicate submissions (hide/disable the form after submission, or support edit rather than re-insert).
There's no structured multi-criteria rubric table in this schema version (no per-criterion scoring) — feedback is one overall_score plus free-text strengths_text/concerns_text. Don't build a multi-criteria scorecard UI unless the PM confirms the schema will be extended for it.
offers is shared with the Recruiter Portal (you write initiated_by + terms, they manage delivery via managed_by) — align on the contract before starting.
Don't rebuild calendar OAuth from scratch if the Recruiter dev already has it working — ask first.



4. Administration Portal

Page Summary

This is a per-company admin, not a platform-wide superadmin. Each subscribing company gets one (or more) Admin accounts scoped entirely to their own tenant. This portal covers company profile setup, building that company's org chart, inviting and managing the Recruiters/Hiring Managers who work under it, and viewing analytics for that company only. Admin has no visibility into candidates, resumes, or applications — that data belongs to the Recruiter/Hiring Manager workflow, not to Admin. Admin also does not control platform-wide settings, other companies' data, or the global roles/permissions system — those are fixed, backend-level concerns that sit outside all 4 portals.

Sub-Features to Build


Company Sign-Up (self-registration) — a public form that creates a companies row and its first users row (role = Admin) together in one transaction. No payment gate for now — subscription_status just defaults to Active.
Company Profile — name, industry, branding, subscription status (companies) — Admin can only ever view/edit their own row.
Org Chart Builder — nested department tree via parent_id (departments), scoped to company_id.
Staff Invitations — click a department node, invite by email with a pre-assigned role of Recruiter or Hiring Manager (user_invitations). Note the schema already restricts this correctly — user_invitations.role_id is documented as Recruiter/HiringManager only, never Admin.
Staff Management — this replaces the old "Account Management" idea. It's not a generic users table; it's scoped entirely to the org chart: click a department, see the Recruiters/Hiring Managers assigned there, deactivate or reassign them (users filtered by company_id + department_id).
Recruitment Analytics Dashboard — high-level counts and trends for this company only (aggregated live from jobs, applications, interviews, offers, all filtered down through department_id → company_id).
Company Activity Log (optional, lightweight) — a filtered view of audit_logs joined to users.company_id, showing only this company's own staff actions (invites sent, departments created, profile edits) — not a platform-wide security log.


Explicitly Out of Scope for This Portal


Managing or viewing any Candidate-role user, their profile, resume, or applications.
Editing roles, permissions, or role_permissions — these tables have no company_id scoping, so editing them from any single company's portal would change access rules for every other company on the platform. Keep these tables exactly as they are in the schema; they're seeded once at the backend level and never surfaced in any UI.
Any form of system/infrastructure health monitoring — that's an operations concern for whoever runs the platform, not something a subscribing company's admin needs to see.
Creating other Admin accounts, or accounts for other companies.


Step-by-Step Implementation


Company sign-up (self-registration) — public form: company name + admin's name/email/password. On submit, create the companies row (subscription_status defaults to Active) and the first users row (role = Admin, company_id = the new company, department_id = NULL) in a single transaction, then log the admin straight in.
Company profile page — view/edit the tenant's own companies row.
Org chart builder — CRUD on departments with parent_id, rendered as a tree/node UI, scoped to company_id.
Department detail panel — click a node → see current staff (users where department_id matches) → "Invite" button → form (email + role: Recruiter or Hiring Manager) → writes to user_invitations.
Invite acceptance flow — a public, unauthenticated page: validate the token hash + expiry, create the users row with the pre-assigned role/department, mark the invitation Accepted.
Staff management actions — from the same department panel, deactivate (is_active = false) or reassign (department_id) an existing staff member. No separate global "users" screen needed.
Analytics dashboard — counters/charts from live aggregation queries, all scoped to this company's company_id.
Company activity log (if time allows) — paginated, filtered table over audit_logs.


Notes for This Dev


Every single query on this portal needs a company_id filter tied to the logged-in Admin's own company. This is the most important rule on this page — get it wrong and one company's Admin can see or edit another company's data.
Don't build a generic "all users" or "all candidates" screen anywhere in this portal — if a feature request seems to need one, it's out of scope; flag it to the PM rather than building it.
There's no pre-aggregated metrics table — the analytics dashboard runs live COUNT/GROUP BY queries against the transactional tables, filtered by company. Fine at this scale.
Company sign-up is self-service for now — anyone can register as an Admin and immediately get a company + working account, no payment gate. This is intentional: companies.subscription_status already defaults to Active, so nothing here needs to change structurally when a payment gateway gets added later. That future work will only change when subscription_status flips to Active (e.g., after a payment webhook succeeds, instead of immediately on sign-up) and will add a middleware check on login/dashboard access — it won't touch this table or this flow's basic shape.
The sign-up form and the invite-acceptance form are both public, unauthenticated routes — make sure both live outside the normal JWT-protected route group. Confirm with the PM/backend lead where public routes should sit in the API project structure.
There's no refresh-token table in this schema, so deactivating a staff member (is_active = false) doesn't immediately revoke a token they already hold — it only takes effect on their next login. Flag this to the PM as a decision point: acceptable gap, or does the auth middleware need to check is_active on every request instead of just at login?
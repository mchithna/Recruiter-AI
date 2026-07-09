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


Do NOT write raw SQL. You must use the _unitOfWork provided in the DI container.

Do NOT edit ApplicationDbContext.cs or Entities. If you need a new database column or table for your feature, ask the PM. DO NOT run dotnet ef migrations.

Where you code: You will spend 99% of your backend time inside backend/RecruitmentPlatform.API/Controllers/ creating your endpoints.

Design Patterns: If you are building a complex object (like a Job), use the Builder pattern. If you trigger an email/SMS, use the NotificationFactory.

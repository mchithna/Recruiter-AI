# Recruitment Platform - Dashboard Navigation & Layout Context (Phase 2)

## Architectural & Navigation Framework
The earlier phase established the core pages (job management, applicant review, interview scheduling, evaluations, and offers) but lacked unified wrapping and persistent navigation. This phase adds sidebar, tabs, persistent navigation, and new landing tabs for the dashboards.

- **Hiring Manager Default Landing Page**: The default landing page changes from `/hiring-manager/queue` to the new Home/Overview landing page (`/hiring-manager/home`).
- **Recruiter Default Landing Page**: The default landing page changes from `/recruiter/jobs` to the new Home/Overview landing page (`/recruiter/home`).

---

## Tab Structure

### Hiring Manager
- **Home** (`/hiring-manager/home`) – New landing overview page.
- **Shortlist** (`/hiring-manager/queue`) – Existing shortlisted candidates queue.
- **Interviews** (`/hiring-manager/interviews`) – New global interviews schedule overview.
- **Offers** (`/hiring-manager/offers`) – New global offers tracking view.

### Recruiter
- **Home** (`/recruiter/home`) – New landing overview page.
- **Jobs** (`/recruiter/jobs`) – Existing jobs listing.
- **Interviews** (`/recruiter/interviews`) – New global interviews list.
- **Messages** (`/recruiter/messages`) – Existing recruiter messages.

---

## Backend Development Rules
- **No Raw SQL**: You must use the `_unitOfWork` provided in the DI container.
- **Database Schema Integrity**: Do NOT edit `ApplicationDbContext.cs` or Entities. If you need a new database column or table for your feature, ask the PM. DO NOT run `dotnet ef migrations`.
- **Code Locations**: You will spend 99% of your backend time inside `backend/RecruitmentPlatform.API/Controllers/` creating your endpoints.
- **Design Patterns**:
  - If you are building a complex object (like a Job), use the Builder pattern.
  - If you trigger an email/SMS, use the NotificationFactory.

---

## Frontend Development Rules
- **Shared UI Components**: Do NOT use standard HTML `<button>` or `<input>` tags. You must use the shared components imported from `src/components/ui/`:
  ```javascript
  import Button from '../../components/ui/Button';
  import Input from '../../components/ui/Input';
  ```
  Usage example:
  ```jsx
  <Button variant="primary" type="submit">Save Profile</Button>
  ```
- **Component Modifications**: You can have some tweaks that you want in existing components but don't change the original component. Get a copy and create a library named after your dashboard to store the components that you want.
- **API Calls**: Do not use fetch. Do not import axios directly. You must import our centralized API instance which handles tokens automatically:
  ```javascript
  import api from '../../api';
  ```
  Usage example:
  ```javascript
  const response = await api.get('/jobs');
  ```

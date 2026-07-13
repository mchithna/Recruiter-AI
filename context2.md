# Recruitment Platform - Dashboard Navigation & Layout Context (Phase 2)

## Architectural & Navigation Framework
The earlier phase established the core pages (job management, applicant review, interview scheduling, evaluations, and offers) but lacked unified wrapping and persistent navigation. This phase adds sidebar, tabs, persistent navigation, and new landing tabs for the Hiring Manager dashboard.
- **Default Landing Page**: The default landing page changes from `/hiring-manager/queue` to the new Home/Overview landing page (`/hiring-manager/home`).

---

## Tab Structure

### Hiring Manager
- **Home** (`/hiring-manager/home`) – New landing overview page.
- **Shortlist** (`/hiring-manager/queue`) – Existing shortlisted candidates queue.
- **Interviews** (`/hiring-manager/interviews`) – New global interviews schedule overview.
- **Offers** (`/hiring-manager/offers`) – New global offers tracking view.

---

## Backend Development Rules
- **Clean Architecture**: Follow Clean Architecture boundaries strictly.
- **No Raw SQL**: Write database queries only using the `_unitOfWork` provided in the dependency injection (DI) container.
- **Database Schema Integrity**: Do NOT modify `ApplicationDbContext.cs` or Entities. Do NOT run `dotnet ef migrations`. If a feature requires new tables or columns, consult the PM.
- **Code Locations**: Implement backend endpoints primarily inside: `backend/RecruitmentPlatform.API/Controllers/`.
- **Design Patterns**:
  - Use the **Builder Pattern** for complex objects (such as a `Job`).
  - Use the **NotificationFactory** for triggering emails, SMS, or other notifications.

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
- **Component Modifications**: Do not modify the shared/original UI components directly if you need custom tweaks. Instead, duplicate the component into a separate library named after your specific dashboard.
- **API Calls**: Do NOT use `fetch` or import `axios` directly. Import and use the centralized API instance that handles authorization tokens automatically:
  ```javascript
  import api from '../../api';
  ```
  Usage example:
  ```javascript
  const response = await api.get('/jobs');
  ```

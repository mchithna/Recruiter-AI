# Homepage Implementation Plan
### For: Candidate Dashboard Dev · Scope: Homepage only

---

## Context You Need

This platform serves two separate audiences: **Candidates** (job seekers) and **Companies** (employers looking to hire). The homepage is the single public entry point for both — no login required to view it. From here, a visitor picks one of two paths: register as a Candidate, or register their Company.

The homepage is **not** part of the Candidate Portal itself. It's a shared, public page that sits outside all 4 dashboards. Keep it in its own top-level folder in the frontend structure (e.g. `src/pages/Home/`), not nested inside your Candidate Portal's own folder — it's a different thing living alongside it, not underneath it.

**Auth (backend + the login/register/invite-acceptance pages) is being built separately, in parallel, by someone else.** Those pages don't exist yet. Your job is to build the homepage itself and wire its buttons to the **exact route paths** below — don't build the destination pages, and don't build any login/registration logic. Just link to the routes; they'll resolve once auth work lands.

---

## Route Contract — Wire Your Buttons to These Exact Paths

| Button / Link | Route |
|---|---|
| "Log In" (nav) | `/login` |
| "Find a Job" / Candidate CTA | `/register/candidate` |
| "Hire Talent" / Company CTA | `/register/company` |

Use these literal strings. If the auth dev changes a path later, that's a one-line update on your end — but for now, treat these as fixed.

---

## Page Sections

- **Header/Nav** — logo, a single "Log In" button, and the two entry CTAs from the table above, clearly separated.
- **Hero** — split messaging for the two audiences. Either a two-column layout ("Find Your Next Role" / "Find Top Talent") or a toggle between the two — whichever fits the design system better.
- **Candidate value-prop section** — AI job matching, application tracking, one place to manage your search.
- **Company value-prop section** — AI-powered screening, structured hiring pipeline, org-wide visibility.
- **(Optional) Open jobs preview strip** — a handful of live open jobs, publicly browsable with no login. See the note below — this can reuse work you're likely already doing for your own portal.
- **Footer** — standard links.

## Step-by-Step Implementation
1. Static header/nav — Login button + the two entry CTAs, wired to the routes above.
2. Hero section with the dual-path split.
3. Candidate value-prop section.
4. Company value-prop section.
5. *(Optional)* Open jobs preview strip.
6. Footer.

## What NOT to Build Here
- No login form, no registration form, no invite-acceptance page. Those routes exist as destinations only — someone else owns what's on the other end of them.
- No "Sign up as a Recruiter" or "Sign up as a Hiring Manager" anywhere on this page. Those roles never self-register — they only ever get in through an invite link sent by their company's Admin. There's no homepage path for them at all.
- Nothing here should depend on a logged-in user or a JWT. This page is 100% public.

## Notes
- **The optional open jobs strip has a natural synergy with your own Candidate Portal work.** You're already building "Job Search & Filtering" (browsing open jobs) as part of the Candidate Portal itself — once that API call exists, this homepage strip can reuse the exact same endpoint/service call. Until then, build this section against a few hardcoded/mock job cards so it's not blocking on backend work, and swap in the live call later. If this turns out to be a time sink, it's genuinely optional — cut it without losing anything essential.
- Use the shared UI components from `/src/components/ui/` (Button, Input, etc.) per the team playbook — don't drop in raw `<button>`/`<input>` tags here even though this page has no forms of its own yet.
- Keep this page itself stateless and route-guard-free — it should render identically whether or not someone is logged in. (A "nice to have" for later: if a logged-in user lands here, redirect them straight to their dashboard instead of showing the homepage — but that depends on the shared auth context existing, so leave it out for now and revisit once auth is merged in.)

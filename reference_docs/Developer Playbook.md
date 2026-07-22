# **📖 The Recruitment Platform Developer Playbook**

Welcome to the team\! To ensure we get maximum marks for our Software Architecture coursework and avoid breaking each other's code, **everyone must follow these rules.**

## **🛑 1\. The Golden Git Rules**

1. **NEVER commit directly to main or develop.**  
2. Always pull the latest code before you start working:  
   git checkout develop \-\> git pull origin develop  
3. create a feature branch for your work:  
   git checkout \-b your-name  
4. When you are done, push your branch and open a **Pull Request (PR)** on GitHub. The Project Manager will review it.

## **🏗️ 2\. Backend Rules (C\# ASP.NET)**

Our backend uses Clean Architecture. Do not break the boundaries.

* **Do NOT write raw SQL.** You must use the \_unitOfWork provided in the DI container.  
* **Do NOT edit ApplicationDbContext.cs or Entities.** If you need a new database column or table for your feature, ask the PM. **DO NOT** run dotnet ef migrations.  
* **Where you code:** You will spend 99% of your backend time inside backend/RecruitmentPlatform.API/Controllers/ creating your endpoints.  
* **Design Patterns:** If you are building a complex object (like a Job), use the Builder pattern. If you trigger an email/SMS, use the NotificationFactory.

## **🎨 3\. Frontend Rules (React & Tailwind)**

We have a unified Design System to ensure our UI looks like one cohesive app, not 4 different websites mashed together.

* **Do NOT use standard \<button\> or \<input\> tags.** \* You **MUST** import and use our shared components from /src/components/ui/:  
  import Button from '../../components/ui/Button';  
  import Input from '../../components/ui/Input';

  // Use it like this:  
  \<Button variant="primary" type="submit"\>Save Profile\</Button\>

  You can have some tweaks that you want in existing components but dont change the original component. get a copy and create a library named after your dashboard to store the components that you want.  
* **API Calls:** Do not use fetch. Do not import axios directly. You must import our centralized API instance which handles tokens automatically:  
  import api from '../../api';  
  // Use it like this:  
  const response \= await api.get('/jobs');

## **🔄 4\. How to Structure Your Pull Request**

When you submit your code for review, your PR description must include ,what feature this adds (e.g., "Added Resume Upload API").

Optional:

* A screenshot of the UI (if you worked on the frontend).  
* A screenshot of a successful Swagger test (if you worked on the backend). *(Note: We need these screenshots for the final coursework report anyway, so taking them now saves us time\!)*
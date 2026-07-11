# **🎨 Candidate Frontend Execution Plan (UI-First Strategy)**

**Assigned To:** Member 3 (Candidate Lead)

**Objective:** Build the complete Candidate UI (Profile, Job Search, Application Dashboard) visually using our Design System.

**Constraint:** The Project Manager is currently wiring up the main Auth routing. To avoid Git conflicts, **you will build these screens using Mock Data and you will NOT modify App.jsx or api.js.**

## **🛑 Rule 1: The "No Conflict" Rules**

1. **DO NOT edit src/App.jsx.** (The PM is currently working on this for the Login flow).  
2. **DO NOT edit src/api.js.** 3\. **DO NOT write C\# backend code yet.** We are purely building the React interfaces today.

To test your pages locally while App.jsx is locked, simply render your page temporarily inside the main.jsx file, or just use a dummy route on your local machine that you promise not to commit\!

## **🏗️ Step 1: Prepare Your Environment**

Make sure you are on a fresh branch based on main.

git checkout develop  
git pull origin develop  
git checkout \-b feature/candidate-ui-mockup

Have these files open in your VS Code tabs so your AI knows our Design System:

* CONTRIBUTING.md  
* src/components/ui/Button.jsx  
* src/components/ui/Card.jsx  
* src/components/ui/Input.jsx

## **🤖 Step 2: AI Prompts for UI Generation**

Use your VS Code AI agent to generate these three specific pages. **Feed it these exact prompts.**

### **Phase 1: The Candidate Profile UI**

**File to create:** src/pages/candidate/Profile.jsx

**Prompt for your AI:**

"I need to build the Candidate Profile UI page for our React application.

Please generate src/pages/candidate/Profile.jsx.

**Strict Rules:**

1. Use ONLY our Design System components (import \<Card\>, \<Input\>, \<Button variant="primary"\> from ../../components/ui/).  
2. Do NOT use axios or fetch.  
3. Create a **Mock Data State** using useState at the top of the component. The mock object should contain: fullName, headline, location, yearsOfExperience, and an array of skills.  
4. Build a clean, professional form layout that allows editing this mock data.  
5. Make the 'Save' button simply console.log the current state."

### **Phase 2: The Job Search UI**

**File to create:** src/pages/candidate/JobSearch.jsx

**Prompt for your AI:**

"I need to build the Job Search UI page for candidates.

Please generate src/pages/candidate/JobSearch.jsx.

**Strict Rules:**

1. Use ONLY our Design System components (\<Card\>, \<Button\>, \<Badge\>).  
2. Do NOT use axios.  
3. Create a **Mock Array of Jobs** using useState. Each job should have: id, title, company, location, employmentType.  
4. Display these jobs in a CSS Grid (using Tailwind grid-cols-1 md:grid-cols-2 lg:grid-cols-3).  
5. Each Job Card should have an 'Apply Now' button that triggers a simple JavaScript alert('Applied to Job ' \+ id) for now."

### **Phase 3: The Application Tracking Dashboard**

**File to create:** src/pages/candidate/Dashboard.jsx

**Prompt for your AI:**

"I need to build the Application Tracking Dashboard for candidates.

Please generate src/pages/candidate/Dashboard.jsx.

**Strict Rules:**

1. Use ONLY our Design System components (\<Card\>, \<Badge\>).  
2. Do NOT use axios.  
3. Create a **Mock Array of Applications** using useState. Each application should have: jobTitle, companyName, appliedDate, and status (e.g., 'Pending', 'Interviewing', 'Rejected', 'Hired').  
4. Render this data in a clean Tailwind CSS Table or a list of wide Cards.  
5. Use the \<Badge\> component to color-code the statuses (e.g., 'Hired' \= variant success, 'Pending' \= variant warning)."

## **🔗 Step 3: What happens next? (The Merge Strategy)**

Once you have built these three beautiful screens and they look great on your local machine:

1. Commit your code (git commit \-m "feat: created candidate ui mockups").  
2. Open a Pull Request.

**Once the PM finishes the Auth flow and merges it into develop:**

1. You will pull the latest develop into your branch.  
2. You will then replace your useState mock data with a useEffect that calls api.get('/candidates/profile').  
3. The PM will safely add your pages to the official App.jsx routing map\!
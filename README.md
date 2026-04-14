# Dowinn Project Management Tool - Full Stack Assessment

## 🚀 Project Overview

A Kanban-style management tool designed with scalability and clean code standards. It tracks task movements and automatically generates a change history for audit purposes.

Key Note: Hardcoded Keys are exposed and this is for assessment only. Any Details and Informations are Dummy Data to showcase the System and does not have a protection against cyber attackers.

### 🛠 Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, Axios, @hello-pangea/dnd.
- **Backend:** Node.js (Express), Prisma ORM.
- **Database:** PostgreSQL (Hosted via Supabase).
- **Authentication:** JWT (JSON Web Tokens) with Bcrypt hashing.

---

Step 1: Clone the Repository to your Desktop
Go to your GitHub repository page: https://github.com/Hiderima/dowinn-assessment-project-management.

Click the green <> Code button.
Copy the URL (ending in .git).
Open your VS Code.
Open a New Terminal (Ctrl + ~).

Navigate to your Desktop: cd Desktop

Type this command:
git clone https://github.com/Hiderima/dowinn-assessment-project-management.git
Open the folder in VS Code: File > Open Folder > dowinn-assessment-project-management.

Step 2: Initialize the Data (The Seed)
Open a tool like Postman, or just use your browser.

Go to: http://localhost:5000/api/seed (Use a POST request if using Postman, but we designed it so a simple trigger works).
Verify: You should see {"message": "Database initialized..."}.

Step 3: Set up the Frontend (The "Face")
Open a second terminal tab in VS Code (click the + icon in the terminal panel).

Enter the frontend folder: cd frontend

Install the libraries: npm install

Start the app: npm run dev
Open http://localhost:3000.

Step 4: The "Quality Control" Test
Before you send the link to the recruiter, do these 3 tests:
[ ] Login: Try logging in with 500001 and pass500001.
[ ] Drag & Drop: Move a task from "Todo" to "In Progress."
[ ] Refresh: Refresh the page. If the task stays in "In Progress," your database connection is working perfectly.

Developed by: Cedric E. Rivera
Role: Full Stack Developer & AI Engineer

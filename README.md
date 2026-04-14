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

In terminal again paste this
cd dowinn-assessment-project-management

then this
code .

Step 2: Lets manage the file
on your vs code create two folder named frontend and backend
put all the files that is in the eplorer in the frontend

paste this in your terminal
cd frontend
then
npm install
then
cd .. >> cd backend
then
npm init -y
then
npm install express cors dotenv pg prisma @prisma/client bcryptjs jsonwebtoken
then
npx prisma init

Open a tool like Postman, or just use your browser.

Step 3: Set up the Frontend (The "Face")
In your terminal paste this
cd ../frontend
then
npm run dev

Open http://localhost:8080 or whatever shows up in your terminal

Step 4: The "Quality Control" Test
Before you send the link to the recruiter, do these 3 tests:
[ ] Login: Try logging in with 500001 and pass500001.
[ ] Drag & Drop: Move a task from "Todo" to "In Progress."
[ ] Refresh: Refresh the page. If the task stays in "In Progress," your database connection is working perfectly.

Developed by: Cedric E. Rivera
Role: Full Stack Developer & AI Engineer

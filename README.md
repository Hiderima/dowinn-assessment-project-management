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

Login Details:
Accounts Made

### Admin

- **Employee Number:** 676767
**Password:** Admin676767
**Position:** Admin

### **Management**

- **Employee Number:** 100000
**Password:** pass100000
**Name:** Maria Leonora
**Department:** Management
**Position:** CEO/President

---

### **Operations Department**

- **Employee Number:** 200001
**Password:** pass200001
**Name:** Juan Dela Cruz
**Department:** Operations
**Position:** Chief Operating Officer (COO)
- **Employee Number:** 200002
**Password:** pass200002
**Name:** Elena Rossi
**Department:** Operations
**Position:** VP of Production
- **Employee Number:** 200003
**Password:** pass200003
**Name:** Ricardo Gomez
**Department:** Operations
**Position:** Director of Supply Chain Mgt
- **Employee Number:** 200004
**Password:** pass200004
**Name:** Sarah Jenkins
**Department:** Operations
**Position:** Director of Procurement

---

### **Finance Department**

- **Employee Number:** 300001
**Password:** pass300001
**Name:** Chen Wei
**Department:** Finance
**Position:** Chief Financial Officer (CFO)
- **Employee Number:** 300002
**Password:** pass300002
**Name:** Linda Thompson
**Department:** Finance
**Position:** VP of Accounting
- **Employee Number:** 300003
**Password:** pass300003
**Name:** Marcus Aurelius
**Department:** Finance
**Position:** VP of Human Resources (HR)
- **Employee Number:** 300004
**Password:** pass300004
**Name:** Atty. Sofia Velasco
**Department:** Finance
**Position:** General Counsel (Legal)

---

### **Marketing & Sales Department**

- **Employee Number:** 400001
**Password:** pass400001
**Name:** Jordan Smith
**Department:** Marketing/Sales
**Position:** Chief Revenue Officer (CRO)
- **Employee Number:** 400002
**Password:** pass400002
**Name:** Amara Okafor
**Department:** Marketing/Sales
**Position:** VP of Marketing
- **Employee Number:** 400003
**Password:** pass400003
**Name:** David Miller
**Department:** Marketing/Sales
**Position:** VP of Sales
- **Employee Number:** 400004
**Password:** pass400004
**Name:** Chloe Tan
**Department:** Marketing/Sales
**Position:** Director of Customer Service

---

### **Research & Development (R&D) Department**

- **Employee Number:** 500001
**Password:** pass500001
**Name:** Dr. Aris Thorne
**Department:** R&D
**Position:** Chief Technology Officer (CTO)
- **Employee Number:** 500002
**Password:** pass500002
**Name:** Yuki Tanaka
**Department:** R&D
**Position:** VP of Development
- **Employee Number:** 500003
**Password:** pass500003
**Name:** Cedric Rivera
**Department:** R&D
**Position:** IT Director


Developed by: Cedric E. Rivera
Role: Full Stack Developer & AI Engineer


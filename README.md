# Dowinn Project Management Tool - Full Stack Assessment

## 🚀 Project Overview
A Kanban-style management tool designed with scalability and clean code standards. It tracks task movements and automatically generates a change history for audit purposes.

### 🛠 Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS, Axios, @hello-pangea/dnd.
- **Backend:** Node.js (Express), Prisma ORM.
- **Database:** PostgreSQL (Hosted via Supabase).
- **Authentication:** JWT (JSON Web Tokens) with Bcrypt hashing.

---

## 💻 1. Local Setup Instructions

### Prerequisites
- Node.js v18+ 
- A PostgreSQL database instance

### Folder Structure Setup
Ensure your folders are organized as follows to maintain clear separation of concerns:
/root
├── /frontend  (The Next.js/code)
└── /backend   (The manual Node.js API)



## ⚙️ 2. Backend Implementation (Manual Step-by-Step)

### Terminal Setup
Navigate to the root and run:
mkdir backend
cd backend
npm init -y
npm install express cors dotenv pg prisma @prisma/client bcryptjs jsonwebtoken
npx prisma init
File: backend/prisma/schema.prisma
Replace the content of your schema file with the following:

Code snippet
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Employee {
  id             Int      @id @default(autoincrement())
  employeeNumber String   @unique
  password       String
  name           String
  department     String
  position       String
}

model Task {
  id        Int         @id @default(autoincrement())
  title     String
  status    String      // "Todo", "In Progress", "Done"
  logs      ChangeLog[]
}

model ChangeLog {
  id         Int      @id @default(autoincrement())
  taskId     Int
  task       Task     @relation(fields: [taskId], references: [id])
  oldStatus  String
  newStatus  String
  updatedAt  DateTime @default(now())
}

File: backend/server.js (Core API & Seeding Logic)
Create this file in the /backend folder. It satisfies the requirement for a pre-defined dataset initialization and automatic status logging.

JavaScript
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// REQUIRED: SEEDING ENDPOINT
// Use this to populate the DB after migration
app.post('/api/seed', async (req, res) => {
  try {
    const password = await bcrypt.hash('000000', 10);
    await prisma.changeLog.deleteMany();
    await prisma.task.deleteMany();
    await prisma.employee.deleteMany();

    // Organizational Chart Data
    const employees = [
      { employeeNumber: '100000', name: 'Maria Leonora', department: 'Management', position: 'CEO/President', password },
      { employeeNumber: '500003', name: 'Cedric Rivera', department: 'R&D', position: 'IT Director', password },
      { employeeNumber: '000000', name: 'Test User 0', department: 'Information Technology', position: 'Full Stack Developer', password }
    ];

    await prisma.employee.createMany({ data: employees });
    await prisma.task.createMany({ data: [
      { title: "Initialize Project Structure", status: "Done" },
      { title: "Integrate Backend API", status: "In Progress" },
      { title: "Final Deployment", status: "Todo" }
    ]});

    res.json({ message: "Database initialized with pre-defined dataset." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// TASK UPDATE WITH AUTOMATED CHANGE LOG
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const oldTask = await prisma.task.findUnique({ where: { id: parseInt(id) } });

  const updatedTask = await prisma.task.update({
    where: { id: parseInt(id) },
    data: { status }
  });

  // Automatically record history if status changes
  if (oldTask.status !== status) {
    await prisma.changeLog.create({
      data: { taskId: parseInt(id), oldStatus: oldTask.status, newStatus: status }
    });
  }
  res.json(updatedTask);
});

// GET ALL TASKS
// This allows the frontend to populate the Kanban board columns
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        logs: {
          orderBy: {
            updatedAt: 'desc'
          }
        }
      }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// GET CHANGE LOGS FOR A SPECIFIC TASK
app.get('/api/tasks/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await prisma.changeLog.findMany({
      where: { taskId: parseInt(id) },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
🎨 3. Frontend Implementation
Installation & Run
Bash
cd ../frontend
npm install
npm install axios @hello-pangea/dnd lucide-react
npm run dev
🔑 4. Execution & Testing
Sync Database: In /backend, run npx prisma migrate dev --name init.

Initialize DB: Send a POST request to http://localhost:5000/api/seed using Postman or cURL.

Login: Use Employee Number 000000 and Password 000000.

Drag & Drop: Move tasks on the board; the backend will silently record the history in the ChangeLog table.

📝 Known Issues & Future Enhancements
Incomplete: Real-time multi-user synchronization via Socket.io (currently polling/manual refresh).

AI Readiness: The ChangeLog table is architected to serve as a training/input set for future AI-driven productivity analysis and automated reporting.

Developed by: Cedric E. Rivera
Role: Full Stack Developer & AI Engineer

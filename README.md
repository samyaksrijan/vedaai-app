# VedaAI — AI Assessment Creator

> A full-stack, production-grade AI-powered platform that transforms teaching materials into beautifully structured, printable exam papers — in seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-green?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-BullMQ-red?logo=redis)](https://redis.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai)](https://openai.com/)

---

## 🚀 Deployed Links

| Service | URL |
|:---|:---|
| **Frontend (Vercel)** | `https://vedaai-app.vercel.app` |
| **Backend (Render)** | `https://vedaai-backend.onrender.com` |
| **Health Check** | `https://vedaai-backend.onrender.com/health` |
| **GitHub Repository** | `https://github.com/samyaksrijan/vedaai-app` |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        TEACHER (Browser)                        │
│              Upload Material + Configure Questions               │
└────────────────────────┬────────────────────────────────────────┘
                         │  HTTPS REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND — Next.js 16 (Vercel)                     │
│   • Assignment creation form (voice + file upload)              │
│   • Real-time progress bar via Socket.IO client                 │
│   • Exam paper viewer + jsPDF download                         │
└────────────────────────┬───────────────────────────────────────┘
                         │  REST API (HTTPS)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           BACKEND — Express + TypeScript (Render)               │
│   POST /api/assignments  →  Validate + Save to MongoDB          │
│                          →  Enqueue job in BullMQ               │
│   GET  /api/assignments/:id/paper  →  Return generated paper    │
│   POST /api/upload       →  Handle file uploads (Multer)        │
└────┬───────────────────────────┬────────────────────────────────┘
     │  BullMQ Job Queue         │  Socket.IO (WebSocket)
     ▼                           ▼
┌──────────────────┐    ┌────────────────────────────────────────┐
│  Upstash Redis   │    │   Real-time Events to Frontend          │
│  (Job Storage)   │    │   progress → 35% → 75% → 90% → 100%   │
└──────┬───────────┘    │   generation-complete / failed          │
       │                └────────────────────────────────────────┘
       ▼
┌─────────────────────────────────────────────────────────────────┐
│              BullMQ WORKER (runs in backend process)            │
│   1. Reads file content from uploaded material                  │
│   2. Calls OpenAI GPT-4o with structured system prompt          │
│   3. Parses JSON response → sections, questions, answer key     │
│   4. Saves QuestionPaper document to MongoDB                    │
│   5. Emits real-time progress events via Socket.IO              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud Database)                      │
│   • assignments collection  (status, metadata)                  │
│   • questionpapers collection  (sections, questions, answerKey) │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Frontend Framework** | Next.js 16 (App Router) | React server/client components, routing |
| **Styling** | Tailwind CSS v3 + Custom CSS Design System | Premium UI with obsidian-charcoal theme |
| **State Management** | Zustand | Client-side assignment and paper state |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Real-time Client** | Socket.IO Client | Live progress bar updates |
| **PDF Generation** | jsPDF | Client-side multi-page exam paper export |
| **Backend Framework** | Express.js + TypeScript | REST API server |
| **AI Engine** | OpenAI GPT-4o | Structured JSON exam paper generation |
| **Job Queue** | BullMQ | Background worker queue for AI processing |
| **Cache / Queue Store** | Upstash Redis (ioredis) | BullMQ job persistence |
| **Database** | MongoDB Atlas (Mongoose) | Assignment and paper storage |
| **Real-time Server** | Socket.IO | Backend → Frontend progress events |
| **File Uploads** | Multer | PDF/text file handling |
| **Frontend Hosting** | Vercel | Next.js optimised deployment |
| **Backend Hosting** | Render | Persistent Node.js web service |

---

## 📁 Project Structure

```
vedaai-app/                          ← Monorepo root
├── frontend/                        ← Next.js frontend (deployed on Vercel)
│   ├── app/                         ← App Router pages
│   │   ├── layout.tsx               ← Root layout with fonts
│   │   ├── page.tsx                 ← Home → AppShell
│   │   ├── globals.css              ← Design system tokens
│   │   └── result/[id]/page.tsx     ← Generated paper viewer
│   ├── components/
│   │   ├── layout/                  ← AppShell, Sidebar, Header, MobileAppShell
│   │   └── assignments/             ← CreateAssignmentForm, AssignmentsPage, ExamPaperView
│   ├── src/
│   │   ├── store/assignmentStore.ts ← Zustand store
│   │   ├── hooks/useAssignmentSocket.ts ← Socket.IO hook
│   │   └── utils/exportPdf.ts       ← jsPDF compiler
│   └── package.json
│
├── backend/                         ← Express API (deployed on Render)
│   ├── src/
│   │   ├── index.ts                 ← Server entry point, CORS, Socket.IO
│   │   ├── config/
│   │   │   ├── db.ts                ← MongoDB connection
│   │   │   ├── redis.ts             ← Redis connection
│   │   │   └── socket.ts            ← Socket.IO room handlers
│   │   ├── routes/
│   │   │   ├── assignments.ts       ← CRUD + queue dispatch
│   │   │   ├── upload.ts            ← File upload handler
│   │   │   └── generate.ts          ← Direct generation enqueue
│   │   ├── workers/
│   │   │   └── generationWorker.ts  ← BullMQ AI processing worker
│   │   ├── queue/
│   │   │   └── assignmentQueue.ts   ← BullMQ queue definition
│   │   ├── services/
│   │   │   └── openaiService.ts     ← GPT-4o prompt + JSON parser
│   │   └── models/
│   │       ├── Assignment.ts        ← Mongoose assignment schema
│   │       └── QuestionPaper.ts     ← Mongoose question paper schema
│   └── package.json
│
└── package.json                     ← Monorepo workspace root
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js >= 18
- npm >= 9
- A running MongoDB instance (or MongoDB Atlas free tier)
- A running Redis instance (or Upstash Redis free tier)
- An OpenAI API key with available credits

### 1. Clone the Repository
```bash
git clone https://github.com/samyaksrijan/vedaai-app.git
cd vedaai-app
```

### 2. Install All Dependencies
```bash
# Install all workspace dependencies from root
npm install
```

### 3. Configure Environment Variables

**Backend:**
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-actual-key-here
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env.local
```
Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=VedaAI
```

### 4. Run Development Server
```bash
# Runs both frontend and backend concurrently
npm run dev
```

| Service | URL |
|:---|:---|
| **Frontend** | `http://localhost:3000` |
| **Backend API** | `http://localhost:5000` |
| **Health Check** | `http://localhost:5000/health` |

---

## 📡 API Endpoints

### Assignments

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/assignments` | List all assignments (sorted by newest) |
| `GET` | `/api/assignments/:id` | Get a single assignment by ID |
| `GET` | `/api/assignments/:id/paper` | Get the generated question paper for an assignment |
| `POST` | `/api/assignments` | Create assignment + enqueue AI generation job |

**POST `/api/assignments` — Request Body:**
```json
{
  "title": "Physics Weekly Test",
  "subject": "Physics",
  "dueDate": "2025-06-01",
  "questionTypes": ["MCQ", "Short Answer"],
  "numberOfQuestions": 20,
  "totalMarks": 50,
  "additionalInstructions": "Focus on Newton's Laws",
  "filePath": "/uploads/chapter3.txt"
}
```

**POST `/api/assignments` — Response:**
```json
{
  "assignmentId": "665abc123...",
  "message": "Generation started"
}
```

### File Upload

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/upload` | Upload reference material (PDF/TXT, max 10MB) |

### Generate (Direct Queue)

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/generate` | Directly enqueue a generation job with a file path |

### System

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/health` | Health check — returns `{ status: "ok", timestamp }` |

---

## 🤖 AI Approach

### Prompting Strategy
The system uses a **two-part structured prompt** sent to `gpt-4o`:

1. **System Prompt** — Instructs GPT-4o to act as an expert educator and exam designer. Enforces strict JSON-only output with no prose or markdown.

2. **User Prompt** — Contains:
   - The full uploaded study material (text extracted from PDF/TXT)
   - A formatted question specification (e.g. `• 10 × MCQ (1 mark each)`, `• 5 × Long Answer (4 marks each)`)
   - Any additional teacher instructions

### JSON Parsing
The OpenAI call uses `response_format: { type: "json_object" }` to guarantee valid JSON output. The response is parsed and mapped into a strict Mongoose schema with sections, questions, difficulty levels, and an answer key.

### Why BullMQ?
GPT-4o calls for large documents can take **5–30 seconds**. Handling this synchronously in a REST API route would:
- Hit serverless function timeout limits (Vercel, AWS Lambda)
- Block the Node.js event loop
- Prevent progress reporting

By offloading to a **BullMQ background worker**:
- The API responds immediately (`202 Accepted`) with the `assignmentId`
- The worker processes the job asynchronously
- Socket.IO emits real-time progress events (`35% → 75% → 90% → 100%`) directly to the teacher's browser
- Failed jobs are automatically retried and status is updated in MongoDB

---

## 🌐 Production Deployment

### Backend (Render)
| Setting | Value |
|:---|:---|
| **Root Directory** | `backend` |
| **Build Command** | `npm install --production=false && npm run build` |
| **Start Command** | `npm run start` |
| **Environment Variables** | `MONGODB_URI`, `REDIS_URL`, `OPENAI_API_KEY`, `CORS_ORIGIN`, `NODE_ENV=production` |

### Frontend (Vercel)
| Setting | Value |
|:---|:---|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Next.js` |
| **Environment Variables** | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_APP_NAME` |

---

## 🔌 WebSocket Events

| Event | Direction | Payload |
|:---|:---|:---|
| `progress` | Server → Client | `{ assignmentId, value: 0–100 }` |
| `generation-complete` | Server → Client | `{ assignmentId, result: QuestionPaper }` |
| `generation-failed` | Server → Client | `{ assignmentId, error: string }` |

---

## 📄 License

MIT — built with ❤️ for VedaAI.

# VedaAI Assessment Creator — Full-Stack Recruitment Submission

A highly aesthetic, professional-grade **AI Assessment Creator** built as a fullstack monorepo. It enables educators to generate structured, curriculum-aligned exam question papers from reference slide uploads or plain instruction inputs using LLMs (GPT-4o), featuring asynchronous background processing queues, real-time WebSocket progress reporting, and skeuomorphic exam PDF compiling.

---

## 🏗️ System Architecture & Workflow

The system utilizes an asynchronous, event-driven architecture to keep page responses responsive and ensure heavy AI generation tasks never freeze the UI.

```
┌────────────────┐        POST /api/assignments        ┌─────────────────┐
│                ├────────────────────────────────────>│                 │
│  Next.js App   │                                     │  Express API    │
│  (Zustand +    │<────────────────────────────────────┤  Server (Port   │
│  React Hook    │   WS: 'progress' | 'complete'       │  5000)          │
│  Form)         │                                     └────────┬────────┘
└────────────────┘                                              │
        ▲                                              Job Enqueue
        │                                                       ▼
        │                                              ┌─────────────────┐
        │                                              │  BullMQ Redis   │
        │                                              │  Queue          │
        │                                              └────────┬────────┘
        │                                                       │
        │                                                  Job Process
        │                                                       ▼
┌───────┴────────┐          Commit Documents           ┌─────────────────┐
│   Socket.IO    │<────────────────────────────────────┤  BullMQ Async   │
│  Server Rooms  │                                     │  Worker         │
└────────────────┘                                     └────────┬────────┘
                                                                │
                                                           LLM Query
                                                                ▼
                                                       ┌─────────────────┐
                                                       │   OpenAI GPT    │
                                                       └─────────────────┘
```

### 🔁 End-to-End Generation Flow:
1. **Submit Form:** The educator sets due dates, marks, titles, and configures question chips.
2. **Material Upload:** Any chosen PDF/text reference material is uploaded to `/api/upload` and stored on the server.
3. **Insert Draft:** `/api/assignments` inserts a new MongoDB `Assignment` document with a `'pending'` status.
4. **BullMQ Enqueue:** The API enqueues a background compilation job onto Redis using **BullMQ** under the `'assignment-generation'` queue.
5. **Background Workers:** The async `generationWorker.ts` intercepts the task and shifts the DB status to `'processing'`, broadcasting a real-time progress update (`35%`) to Socket.IO.
6. **Structured LLM Retreival:** The worker queries GPT-4o using custom system constraints, enforcing a strict **difficulty distribution (30% easy, 50% medium, 20% hard)**.
7. **Database Save:** The returned JSON is parsed safely. The worker creates a `QuestionPaper` document and updates the parent `Assignment` status to `'completed'`.
8. **WS Notification:** The worker broadcasts a `'generation-complete'` event to the Socket room.
9. **UI Transition:** The frontend's hook intercepts the WS message, resolves the circular progress spinner, and renders a skeuomorphic print-ready exam sheet.

---

## 📁 Monorepo Folder Structure

```
vedaai-app/
├── package.json                   # Root workspace config (npm workspaces)
├── backend/                       # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/                # DB, Redis & Socket connection bootstraps
│   │   ├── middleware/            # Global Express error interceptors
│   │   ├── models/                # Assignment & QuestionPaper Mongoose Schemas
│   │   ├── queue/                 # BullMQ ioredis Queue setups
│   │   ├── routes/                # CRUD, uploading, & generator endpoints
│   │   ├── services/              # OpenAI generateQuestionPaper handlers
│   │   ├── workers/               # Async BullMQ consumer processing workers
│   │   └── index.ts               # Server entrypoint & WebSocket initialization
│   └── tsconfig.json
└── frontend/                      # Next.js 14 App Router + Tailwind CSS
    ├── app/
    │   ├── layout.tsx             # Root Layout (Google Fonts Inter injection)
    │   ├── page.tsx               # Main validated assignment creation page
    │   ├── globals.css            # Tailwind custom theme definitions
    │   └── result/[id]/page.tsx   # Results skeuomorphic preview Dynamic route
    ├── src/
    │   ├── hooks/                 # WebSocket useAssignmentSocket hooks
    │   ├── store/                 # Zustand assignmentStore state
    │   └── utils/                 # Client-side jspdf exporter scripts
    └── package.json
```

---

## 🛠️ Tech Stack & Libraries

### Frontend:
* **Framework:** Next.js 14 (App Router) + TypeScript
* **State Management:** Zustand (atomic, decoupled store logic)
* **Form Controls:** React Hook Form + Zod (schema validations)
* **Real-time:** Socket.io-client
* **PDF Exporter:** jsPDF (programmatic vector rendering)
* **Styling:** Tailwind CSS (Harmonious brand-aligned off-whites and dark buttons)

### Backend:
* **Framework:** Node.js + Express + TypeScript
* **Database:** MongoDB (via Mongoose schemas)
* **Queue Engine:** BullMQ
* **Redis Client:** ioredis (singleton client setup)
* **Real-time:** Socket.IO
* **AI Integration:** OpenAI API (GPT-4o JSON-mode response formatting)

---

## 🚀 Local Installation & Setup

### Prerequisites
Make sure you have the following installed locally:
* **Node.js** (v18+)
* **npm** (v9+)
* **MongoDB** (running on `mongodb://localhost:27017`)
* **Redis** (running on `redis://localhost:6379`)

### 1. Clone the repository & Install workspaces
Clone this repository to your local directory and run the monorepo-wide installer at the root:
```bash
npm run install:all
```
This single command installs all required packages for the root, frontend, and backend environments concurrently.

### 2. Configure Environment Variables
Create `.env` configurations using the provided `.env.example` templates in both folders:

* **Backend Environment (`/backend/.env`):**
  ```env
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/vedaai
  REDIS_URL=redis://localhost:6379
  OPENAI_API_KEY=your_openai_api_key_here
  CORS_ORIGIN=http://localhost:3000
  ```

* **Frontend Environment (`/frontend/.env.local`):**
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000
  NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
  ```

### 3. Start Development Servers Concurrently
To start both the Express backend and Next.js frontend concurrently under workspace environments, simply run:
```bash
npm run dev
```

* The Next.js frontend will boot at **[http://localhost:3000](http://localhost:3000)**.
* The Express server will launch at **[http://localhost:5000](http://localhost:5000)**.

---

## ✨ Outstanding Grade Signals (Bonus Features Met)

* **Programmatic PDF Compiles (Not raw HTML prints):** The client-side PDF downloader draws printable vectors using helvetica grids, double underlines, text splitting wrapping algorithms, and page boundary checks.
* **WebSocket Live Loading Progress Sockets:** Incorporates a radial loading spinner with progress metrics (35% -> 75% -> 90% -> 100%) mapped directly from running BullMQ workers.
* **Strict Type Safety:** Handled dual-instance `ioredis` package type mismatch exceptions explicitly, ensuring full compile success on strict `noEmit` checks.
* **Skeuomorphic Print layout:** Mimics physical high-contrast paper tests complete with blanks, underlines, custom difficulty chips, and a suggested Answer Key toggle!

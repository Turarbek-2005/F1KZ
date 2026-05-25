<div align="center">

```
███████╗ ██╗    ██╗  ██╗ ███████╗
██╔════╝ ██║    ██║ ██╔╝ ╚════██║
█████╗   ██║    █████╔╝      ██╔╝
██╔══╝   ██║    ██╔═██╗     ██╔╝
██║      ██║    ██║  ██╗    ██║
╚═╝      ╚═╝    ╚═╝  ╚═╝    ╚═╝
```

**Your ultimate Formula 1 companion — live timing, AI insights, race analytics**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=for-the-badge&logo=postgresql)](https://www.prisma.io/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)](https://f1-kz-frontend.vercel.app)

</div>

---

## What is F1KZ?

F1KZ is a **full-stack Formula 1 platform** that brings race data to life. Get live lap-by-lap timing straight from the official F1 feed, compare drivers head-to-head, track championship standings, and let AI generate race previews — all in one slick dark-mode dashboard.

---

## Features

### Live Timing
Real-time telemetry directly from `livetiming.formula1.com` via SignalR WebSocket, streamed to the browser over Server-Sent Events. No third-party delays.

### Race Intelligence
- **Standings** — live driver & constructor championship tables with gap charts
- **Results** — browse every race result by year and round
- **Schedule** — full season calendar with countdown to the next session
- **Driver & Team Profiles** — stats, nationalities, car liveries

### Compare & Predict
- **Driver Comparison** — side-by-side stats, points trajectories, head-to-head records
- **Predictions** — submit and track your own race predictions per session

### AI-Powered Content
Google Gemini integration generates race previews and imagery on demand.

### Auth & Profiles
JWT-based authentication, persistent favourites, and user settings with dark/light mode toggle.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| **UI Components** | Radix UI, shadcn/ui patterns, Recharts, Lucide React |
| **State** | Redux Toolkit |
| **Backend** | Express 5, TypeScript, Node.js |
| **Database** | PostgreSQL + Prisma ORM |
| **Real-time** | WebSocket (ws), SignalR client, Server-Sent Events |
| **AI** | Google Gemini (`@google/genai`) |
| **F1 Data** | `@f1api/sdk` + official F1 live timing |
| **Auth** | JWT + bcryptjs |
| **Infra** | Vercel (frontend + serverless), pnpm workspaces |

---

## Project Structure

```
F1KZ/
├── frontend/                   # Next.js application
│   └── src/
│       ├── app/                # Pages (App Router)
│       │   ├── standings/
│       │   ├── drivers/
│       │   ├── teams/
│       │   ├── schedule/
│       │   ├── results/
│       │   ├── compare/
│       │   ├── predictions/
│       │   ├── news/
│       │   └── (auth)/
│       ├── features/           # Feature modules (live-timing, countdown, charts…)
│       ├── entities/           # Domain models & Redux slices
│       ├── shared/             # Reusable UI, API clients, store
│       └── widget/             # Dashboard widgets
│
└── backend/                    # Express API
    └── src/
        ├── controllers/        # Route handlers
        ├── services/           # Business logic (timing, auth, AI)
        ├── routes/             # Express routers
        ├── middlewares/        # JWT guard
        ├── dto/                # Zod validation schemas
        └── prisma/             # Database schema & migrations
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** 8+
- **PostgreSQL** database (or a Supabase project)

### 1. Clone & install

```bash
git clone https://github.com/turarbek-2005/f1kz.git
cd f1kz
pnpm install
```

### 2. Configure environment variables

**Backend** — create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/f1kz?pgbouncer=true
JWT_SECRET=your-super-secret-key
GOOGLE_API_KEY=your-gemini-api-key
PORT=4000
```

**Frontend** — create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Set up the database

```bash
cd backend
npx prisma migrate dev
```

### 4. Run in development

Open two terminals:

```bash
# Terminal 1 — backend
cd backend && pnpm dev

# Terminal 2 — frontend
cd frontend && pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## API Overview

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login, returns JWT cookie |
| `GET` | `/f1/*` | Proxy to F1API (drivers, teams, standings…) |
| `GET` | `/live/stream` | SSE stream of live timing data |
| `POST` | `/ai/generate-news` | Generate race preview with Gemini |
| `POST` | `/ai/generate-image` | Generate race image with Gemini |
| `GET` | `/user/profile` | Authenticated user profile |

---

## Deployment

The project is deployed on **Vercel**:

- **Frontend**: standard Next.js Vercel deployment
- **Backend**: serverless Express handler exported from `backend/src/server.ts`

Allowed CORS origins: `localhost:3000`, `*.vercel.app`

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

<div align="center">

Built with passion for the sport. Go racing. 🏁

</div>

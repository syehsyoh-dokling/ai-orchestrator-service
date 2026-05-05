# AI Orchestrator Service

Backend and admin frontend for managing AI-provider orchestration, prompts, translation workflows, and social scheduling.

## Repository Layout

```text
backend/
  config/
  controllers/
  services/
  server.js
admin-frontend/
  src/
  public/
  vite.config.js
README-DevOps.md
```

## Backend

The backend is an Express service with SQLite-backed local persistence and controller modules for:

- authentication,
- orchestrator operations,
- prompt management,
- translator workflows.

Configured AI provider dependencies include OpenAI, Anthropic, Google Gemini, Mistral, Cohere, and Axios-backed provider calls.

Run locally:

```bash
cd backend
npm install
copy .env.example .env
npm start
```

Development mode:

```bash
npm run dev
```

## Admin Frontend

The admin frontend is a Vue/Vite app with views for:

- login,
- prompt management,
- social scheduling.

Run locally:

```bash
cd admin-frontend
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Environment

Use `backend/.env.example` as the backend template. Real provider keys, JWT secrets, and database settings must stay out of Git.

## Notes

This repo is for orchestration and admin tooling. Queue workers, deployment configs, and API hub endpoints live in separate repositories.

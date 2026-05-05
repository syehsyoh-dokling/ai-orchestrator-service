# AI Orchestrator - DevOps Deployment Guide

This repository contains the AI First Layer Orchestrator, an API middleware similar to AWS Bedrock that handles prompt templates and routes requests to multiple LLM providers (Gemini, OpenAI, Anthropic, Cohere, Mistral).

## Architecture
- **Backend**: Node.js + Express.js + SQLite.
- **Frontend**: Vue 3 + Vite (Admin Dashboard).

---

## 1. Backend Deployment

### Prerequisites
- Node.js >= 18.x
- PM2 (Recommended for production)

### Steps
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install --production
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required API keys for the AI providers you plan to use.
   - Change `JWT_SECRET` to a strong random string.
   - Set the `PORT` (default is 4000).
4. Run the server:
   ```bash
   pm2 start server.js --name "ai-orchestrator-api"
   ```

### Data Persistence (CRITICAL)
The application uses SQLite as its database (`backend/database.sqlite`). 
- **Docker/VPS:** Ensure the `backend/` directory (or specifically `database.sqlite`) is **persisted** (e.g., mounted as a volume in Docker) so that prompt templates and logs are not lost during redeployments.
- On the first run, the SQLite file is generated automatically along with a default admin user (`admin` / `admin123`).

---

## 2. Frontend Deployment (Admin Dashboard)

The frontend is a Vue SPA built with Vite. It needs to be built and served statically.

### Steps
1. Navigate to the frontend directory:
   ```bash
   cd admin-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the API URL:
   - Create or edit `.env` inside `admin-frontend/`.
   - Set `VITE_API_URL` to the public URL of the backend API deployed in step 1.
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```
4. Build for production:
   ```bash
   npm run build
   ```
5. Serve the `dist/` directory:
   - You can serve the contents of `admin-frontend/dist` using **Nginx**, Apache, or any static hosting service (Vercel, Netlify, Cloudflare Pages).
   - **Nginx configuration example:**
     ```nginx
     server {
         listen 80;
         server_name admin.yourdomain.com;
         root /path/to/admin-frontend/dist;
         index index.html;

         location / {
             try_files $uri $uri/ /index.html;
         }
     }
     ```

---

## Testing the API internally
Once deployed, the main Backend can hit the orchestrator locally or via internal networking:
`POST http://localhost:4000/api/orchestrate`
```json
{
  "issue_type": "profile_matching",
  "variables": {
    "data": "Sample data"
  }
}
```

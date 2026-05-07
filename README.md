# ProspectIQ CRM

A Full-Stack AI-powered CRM Application.

## Tech Stack
- **Frontend:** React, Vite, React Router
- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL)
- **AI Integration:** OpenAI API (GPT-4o mini)
- **Auth:** JWT, OTP via Nodemailer

## Prerequisites
- Node.js (v18+)
- Supabase Account
- Google Account (for email sending via Nodemailer)
- OpenAI API Key

## Setup Instructions

### 1. Database Setup
Create a Supabase project and create the following tables:
- `users`: id (uuid), name, email, password, created_at
- `otps`: id (uuid), email, otp, expires_at, used, created_at
- `leads`: id (uuid), name, company_name, email, phone, lead_source, assigned_to (uuid, foreign key to users.id), status, deal_value, ai_score, ai_reason, created_at, updated_at
- `notes`: id (uuid), lead_id (uuid, fk to leads.id), content, created_by (uuid, fk to users.id), created_at

*Ensure Row Level Security (RLS) is configured or disabled for development testing.*

### 2. Backend Setup
1. Open the terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder with the following variables:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret_key
   OPENAI_API_KEY=your_openai_api_key
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   EMAIL_FROM="ProspectIQ" <your_gmail_address>
   PORT=8000
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Features Complete
✅ User Registration & Login (OTP based)
✅ Lead Management (CRUD, Status updates, filtering)
✅ Note Taking on Leads
✅ AI Lead Scoring & Email Generation
✅ Dashboard Analytics

## Running the Application
Access the app at `http://localhost:5173` (or the port Vite provides, like 5174). Register a new account and test the flow!

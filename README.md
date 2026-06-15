# Flowdesk Team Workspace

A React + Vite team workspace app with task management, email-code authentication, Supabase persistence, notifications, direct messages, task chat, and realtime updates.

## Features

- Dashboard, list, board, calendar, inbox, and team views
- Supabase email OTP login/signup
- Workspace, member, project, task, assignee, role, and permission schema
- Task assignment and task-comment notifications
- Direct messages between team members
- Separate task chat in every task drawer
- Supabase Realtime refresh for tasks, notifications, direct messages, and task chat
- Local demo fallback when Supabase env vars are not configured

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Supabase keys, the app runs in local demo mode. Any email/code works locally so the UI can be tested.

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor and run:

```bash
supabase/migrations/202606150001_initial_schema.sql
```

3. In Supabase Auth, enable email OTP. For code-based emails, configure the email template to include the OTP token.
4. Copy your project URL and anon key into `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Restart the dev server.

## Deploy To Vercel

1. Create a GitHub repo and push this project:

```bash
git init
git add .
git commit -m "Prepare Flowdesk for Supabase production"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/team-management-saas.git
git push -u origin main
```

2. Import the repo in Vercel.
3. Set environment variables in Vercel:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

4. Use Vite defaults:

```bash
Build command: npm run build
Output directory: dist
```

## Useful Commands

```bash
npm run lint
npm run build
```


# Mess Management System

A browser app for managing meal records, shared expenses, deposits, settlements, and household bills. The ledger is saved in Neon Postgres and shared across signed-in devices.

Built with React, TypeScript, Tailwind CSS, Vite, Vercel Functions, and Neon Postgres.

## Deployment

The Vercel project should have these server-side environment variables:

- `DATABASE_URL` from the Neon integration
- `VITE_ADMIN_USER_ID` and `VITE_ADMIN_PASSWORD` for the admin login

Set the admin values in Vercel project settings and keep them server-side. The API reads them through `process.env`; the browser bundle does not include the credentials. The Neon integration supplies `DATABASE_URL` to the Vercel project.

## Local development

Prerequisites: Node.js 20 or newer, npm, and the Vercel CLI.

1. Run `npm install`.
2. Copy `env.example` to `.env.local` and fill in the server-side credentials and Neon connection string.
3. Run `vercel dev` to use the app with its API routes, or `npm run build` to build the frontend.

The ledger starts empty. The first signed-in browser with existing local records uploads those records when the cloud ledger is empty. After that, signed-in devices load and save the shared cloud ledger.


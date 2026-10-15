# Mess Management System

A browser-based app for managing meal records, shared expenses, deposits, settlements, and household bills.

Built with React, TypeScript, Tailwind CSS, and Vite.

## Setup

Prerequisites: Node.js and pnpm.

1. Run `pnpm install`.
2. Copy `env.example` to `.env.local`.
3. Set `VITE_ADMIN_USER_ID` and `VITE_ADMIN_PASSWORD` in `.env.local`.
4. Run `pnpm dev` for local development or `pnpm build` for a production build.

The initial ledger is empty. Enter your own records after launching the app.

The admin login is a browser-side gate. Vite embeds configured values in the client build, so use server-backed authentication to protect sensitive information.
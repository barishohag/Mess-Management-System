/// <reference types="node" />
import { neon } from '@neondatabase/serverless';
import { readAdminSession } from './auth.js';

const STATE_ID = 'main-ledger';

function sendJson(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is missing');
  return neon(connectionString);
}

async function ensureTable(sql: any) {
  await sql`CREATE TABLE IF NOT EXISTS mess_app_state (
    state_id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export default async function handler(req: any, res: any) {
  if (!readAdminSession(req)) return sendJson(res, 401, { message: 'Admin sign-in required.' });
  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT');
    return sendJson(res, 405, { message: 'Method not allowed' });
  }

  try {
    const sql = database();
    await ensureTable(sql);

    if (req.method === 'GET') {
      const rows = await sql`SELECT payload, updated_at FROM mess_app_state WHERE state_id = ${STATE_ID} LIMIT 1`;
      const row = rows[0] as { payload: unknown; updated_at: Date | string } | undefined;
      return sendJson(res, 200, row ? { data: row.payload, updatedAt: new Date(row.updated_at).toISOString() } : { data: null, updatedAt: null });
    }

    const data = req.body?.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return sendJson(res, 400, { message: 'Invalid ledger payload.' });
    const payload = JSON.stringify(data);
    if (payload.length > 1_500_000) return sendJson(res, 413, { message: 'Ledger is too large to save.' });

    const rows = await sql`
      INSERT INTO mess_app_state (state_id, payload, updated_at)
      VALUES (${STATE_ID}, ${payload}::jsonb, NOW())
      ON CONFLICT (state_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
      RETURNING updated_at
    `;
    return sendJson(res, 200, { ok: true, updatedAt: new Date(rows[0].updated_at as Date | string).toISOString() });
  } catch (error) {
    console.error('Ledger persistence failed:', error);
    return sendJson(res, 503, { message: 'Cloud storage is not ready. Connect a Postgres database to this Vercel project.' });
  }
}


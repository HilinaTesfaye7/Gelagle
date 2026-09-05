import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../server/src/app.js';
import { runMigrations } from '../server/src/db/migrate.js';
import { seedDatabase } from '../server/src/db/seed.js';

let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    try {
      runMigrations();
      seedDatabase();
    } catch (e) {
      console.error('[API Init Error]', e);
    }
    initialized = true;
  }
}

const app = createApp();

export default function handler(req: any, res: any) {
  ensureInitialized();
  return app(req, res);
}

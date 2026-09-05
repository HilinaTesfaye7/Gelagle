import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from './database.js';
import { MIGRATION_V1, MIGRATION_V2 } from './schema.js';

export function runMigrations(customDb?: DatabaseSync): void {
  const db = customDb || getDatabase();

  // Ensure migration table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedV1 = db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get(1);

  if (!appliedV1) {
    console.log('[MIGRATION] Applying V1: Initial Phase 1 Core Schema...');
    db.exec(MIGRATION_V1);
    const stmt = db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)');
    stmt.run(1, 'v1_initial_phase1_schema', new Date().toISOString());
    console.log('[MIGRATION] V1 applied successfully.');
  } else {
    console.log('[MIGRATION] V1 already applied.');
  }

  const appliedV2 = db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get(2);

  if (!appliedV2) {
    console.log('[MIGRATION] Applying V2: Daily Updates and Standups Schema...');
    db.exec(MIGRATION_V2);
    const stmt = db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)');
    stmt.run(2, 'v2_daily_updates_schema', new Date().toISOString());
    console.log('[MIGRATION] V2 applied successfully.');
  } else {
    console.log('[MIGRATION] V2 already applied.');
  }
}

// Allow direct execution: `npx tsx server/src/db/migrate.ts`
if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  try {
    runMigrations();
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

import type { SQLiteDatabase } from "expo-sqlite";

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await applyMigration(db, 1, async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS uploads (
        id TEXT PRIMARY KEY,
        uri TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS diary_entries (
        id TEXT PRIMARY KEY,
        upload_id TEXT NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at
        ON diary_entries(created_at DESC);
    `);
  });

  await applyMigration(db, 2, async () => {
    const hasThumbnailUri = await hasColumn(db, "uploads", "thumbnail_uri");

    if (!hasThumbnailUri) {
      await db.execAsync(`
        ALTER TABLE uploads ADD COLUMN thumbnail_uri TEXT;
      `);
    }
  });
}

async function applyMigration(
  db: SQLiteDatabase,
  version: number,
  migration: () => Promise<void>,
): Promise<void> {
  const existing = await db.getFirstAsync<{ version: number }>(
    `SELECT version FROM schema_migrations WHERE version = ?`,
    [version],
  );

  if (existing) return;

  await migration();

  await db.runAsync(
    `INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)`,
    [version],
  );
}

async function hasColumn(
  db: SQLiteDatabase,
  tableName: string,
  columnName: string,
): Promise<boolean> {
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${tableName});`,
  );

  return columns.some((column) => column.name === columnName);
}

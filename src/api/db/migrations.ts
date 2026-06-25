import { File } from "expo-file-system";
import * as VideoThumbnails from "expo-video-thumbnails";
import type { SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

import {
  THUMBNAILS_DIRECTORY,
  createDocumentDirectory,
  getDocumentFileUri,
  getDocumentRelativeMediaPath,
  normalizeStoredMediaPath,
} from "../media-files";

function getFileExtension(uri: string, fallback: string): string {
  const cleanUri = uri.split("?")[0]?.split("#")[0] ?? uri;
  return (cleanUri.match(/\.([a-zA-Z0-9]+)$/)?.[1] ?? fallback).toLowerCase();
}

function recoverThumbnailPath(id: string, uri: string): string | null {
  if (Platform.OS === "web" || !uri.startsWith("file://")) {
    return null;
  }

  try {
    const source = new File(uri);
    if (!source.exists) return null;

    const extension = getFileExtension(uri, "jpg");
    const relativePath = `${THUMBNAILS_DIRECTORY}/${id}.${extension}`;
    const destination = new File(
      createDocumentDirectory(THUMBNAILS_DIRECTORY),
      `${id}.${extension}`,
    );
    source.copy(destination, { overwrite: true });

    return relativePath;
  } catch {
    return null;
  }
}

async function generateThumbnailPath(
  id: string,
  videoPath: string,
): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    const videoUri = getDocumentFileUri(normalizeStoredMediaPath(videoPath));
    const video = new File(videoUri);
    if (!video.exists) return null;

    const thumbnail = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 0,
    });

    return recoverThumbnailPath(id, thumbnail.uri);
  } catch {
    return null;
  }
}

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

  await applyMigration(db, 3, async () => {
    const rows = await db.getAllAsync<{
      id: string;
      uri: string;
      thumbnail_uri: string | null;
    }>(`SELECT id, uri, thumbnail_uri FROM uploads`);

    for (const row of rows) {
      const relativeUri = getDocumentRelativeMediaPath(row.uri);
      const relativeThumbnailUri = row.thumbnail_uri
        ? getDocumentRelativeMediaPath(row.thumbnail_uri)
        : null;
      const recoveredThumbnailUri =
        row.thumbnail_uri && !relativeThumbnailUri
          ? recoverThumbnailPath(row.id, row.thumbnail_uri)
          : null;
      const generatedThumbnailUri =
        !relativeThumbnailUri && !recoveredThumbnailUri
          ? await generateThumbnailPath(row.id, relativeUri ?? row.uri)
          : null;

      if (
        !relativeUri &&
        !relativeThumbnailUri &&
        !recoveredThumbnailUri &&
        !generatedThumbnailUri
      ) {
        continue;
      }

      await db.runAsync(
        `
        UPDATE uploads
        SET uri = ?, thumbnail_uri = ?
        WHERE id = ?
        `,
        [
          relativeUri ?? row.uri,
          relativeThumbnailUri ??
            recoveredThumbnailUri ??
            generatedThumbnailUri ??
            row.thumbnail_uri,
          row.id,
        ],
      );
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

import * as SQLite from 'expo-sqlite';

import { runMigrations } from './migrations';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('video-diary.db').then(async (db) => {
      await runMigrations(db);
      return db;
    });
  }
  return dbPromise;
}

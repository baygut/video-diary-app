import { getDb } from '../db/client';
import { DiaryCreateRequestSchema, Diary } from '../schema';
import { ApiResponse, ok, err } from '../types';

type DiaryRow = {
  id: string;
  upload_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

function rowToDiary(row: DiaryRow): Diary {
  return {
    id: row.id,
    uploadId: row.upload_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function postDiary(input: unknown): Promise<ApiResponse<Diary>> {
  const parsed = DiaryCreateRequestSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.message, 400);
  }

  const { uploadId, name, description } = parsed.data;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    const db = await getDb();

    const upload = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM uploads WHERE id = ?`,
      [uploadId]
    );
    if (!upload) {
      return err(`Upload ${uploadId} not found`, 404);
    }

    await db.runAsync(
      `INSERT INTO diary_entries (id, upload_id, name, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, uploadId, name, description ?? null, now, now]
    );

    const row = await db.getFirstAsync<DiaryRow>(
      `SELECT * FROM diary_entries WHERE id = ?`,
      [id]
    );

    return ok(rowToDiary(row!), 201);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Database error', 500);
  }
}

export async function getDiaryList(): Promise<ApiResponse<Diary[]>> {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<DiaryRow>(
      `SELECT * FROM diary_entries ORDER BY created_at DESC`
    );
    return ok(rows.map(rowToDiary));
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Database error', 500);
  }
}

export async function getDiaryById(id: string): Promise<ApiResponse<Diary>> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<DiaryRow>(
      `SELECT * FROM diary_entries WHERE id = ?`,
      [id]
    );
    if (!row) {
      return err(`Diary entry ${id} not found`, 404);
    }
    return ok(rowToDiary(row));
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Database error', 500);
  }
}

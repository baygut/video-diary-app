import { getDb } from '../db/client';
import { UploadRequestSchema, UploadResponse } from '../schema';
import { ApiResponse, ok, err } from '../types';

export async function postUpload(input: unknown): Promise<ApiResponse<UploadResponse>> {
  const parsed = UploadRequestSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.message, 400);
  }

  const { uri, mimeType } = parsed.data;
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  try {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO uploads (id, uri, mime_type, created_at) VALUES (?, ?, ?, ?)`,
      [id, uri, mimeType, createdAt]
    );
    return ok({ id, uri, mimeType, createdAt }, 201);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Database error', 500);
  }
}

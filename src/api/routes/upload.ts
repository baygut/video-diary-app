import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

import * as VideoThumbnails from "expo-video-thumbnails";
import { getDb } from "../db/client";
import { createId } from "../id";
import { UploadRequestSchema, UploadResponse } from "../schema";
import { ApiResponse, err, ok } from "../types";

const MIME_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
  "video/webm": "webm",
};

function getVideoExtension(uri: string, mimeType: string): string {
  const cleanUri = uri.split("?")[0]?.split("#")[0] ?? uri;
  const uriExtension = cleanUri.match(/\.([a-zA-Z0-9]+)$/)?.[1];
  return (uriExtension ?? MIME_EXTENSIONS[mimeType] ?? "mp4").toLowerCase();
}

async function persistVideo(
  uri: string,
  mimeType: string,
  id: string,
): Promise<string> {
  if (Platform.OS === "web") {
    return uri;
  }

  const uploadsDirectory = new Directory(Paths.document, "uploads");
  uploadsDirectory.create({ intermediates: true, idempotent: true });

  const source = new File(uri);
  const destination = new File(
    uploadsDirectory,
    `${id}.${getVideoExtension(uri, mimeType)}`,
  );
  await source.copy(destination, { overwrite: true });

  return destination.uri;
}

export async function postUpload(
  input: unknown,
): Promise<ApiResponse<UploadResponse>> {
  const parsed = UploadRequestSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.message, 400);
  }

  const { uri, mimeType } = parsed.data;
  const id = createId();
  const createdAt = new Date().toISOString();
  const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
    time: 0,
  });

  try {
    const persistedUri = await persistVideo(uri, mimeType, id);
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO uploads (id, uri, mime_type, created_at, thumbnail_uri) VALUES (?, ?, ?, ?, ?)`,
      [id, persistedUri, mimeType, createdAt, thumbnail.uri],
    );
    return ok(
      {
        id,
        uri: persistedUri,
        mimeType,
        createdAt,
        thumbnailUri: thumbnail.uri,
      },
      201,
    );
  } catch (e) {
    return err(e instanceof Error ? e.message : "Database error", 500);
  }
}

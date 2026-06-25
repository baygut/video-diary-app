import { File } from "expo-file-system";
import { Platform } from "react-native";

import * as VideoThumbnails from "expo-video-thumbnails";
import { getDb } from "../db/client";
import { createId } from "../id";
import {
  THUMBNAILS_DIRECTORY,
  UPLOADS_DIRECTORY,
  createDocumentDirectory,
  getDocumentFileUri,
} from "../media-files";
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

function getFileExtension(uri: string, fallback: string): string {
  const cleanUri = uri.split("?")[0]?.split("#")[0] ?? uri;
  return (cleanUri.match(/\.([a-zA-Z0-9]+)$/)?.[1] ?? fallback).toLowerCase();
}

async function persistVideo(
  uri: string,
  mimeType: string,
  id: string,
): Promise<string> {
  if (Platform.OS === "web") {
    return uri;
  }

  const fileName = `${id}.${getVideoExtension(uri, mimeType)}`;
  const relativePath = `${UPLOADS_DIRECTORY}/${fileName}`;
  const uploadsDirectory = createDocumentDirectory(UPLOADS_DIRECTORY);

  const source = new File(uri);
  const destination = new File(uploadsDirectory, fileName);
  await source.copy(destination, { overwrite: true });

  return relativePath;
}

async function persistThumbnail(uri: string, id: string): Promise<string> {
  if (Platform.OS === "web") {
    return uri;
  }

  const extension = getFileExtension(uri, "jpg");
  const relativePath = `${THUMBNAILS_DIRECTORY}/${id}.${extension}`;
  const thumbnailsDirectory = createDocumentDirectory(THUMBNAILS_DIRECTORY);

  const source = new File(uri);
  const destination = new File(thumbnailsDirectory, `${id}.${extension}`);
  await source.copy(destination, { overwrite: true });

  return relativePath;
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
    const persistedPath = await persistVideo(uri, mimeType, id);
    const persistedThumbnailPath = await persistThumbnail(thumbnail.uri, id);
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO uploads (id, uri, mime_type, created_at, thumbnail_uri) VALUES (?, ?, ?, ?, ?)`,
      [id, persistedPath, mimeType, createdAt, persistedThumbnailPath],
    );
    return ok(
      {
        id,
        uri: getDocumentFileUri(persistedPath),
        mimeType,
        createdAt,
        thumbnailUri: getDocumentFileUri(persistedThumbnailPath),
      },
      201,
    );
  } catch (e) {
    return err(e instanceof Error ? e.message : "Database error", 500);
  }
}

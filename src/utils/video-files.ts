import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

import { createId } from "@/api/id";
import { debugLog } from "@/utils/debug-log";

export type SelectedVideo = {
  durationSeconds: number;
  uri: string;
  mimeType: string;
  playbackUri: string;
  previewUri?: string;
};

const MIME_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
  "video/webm": "webm",
};

function getVideoExtension(
  uri: string,
  mimeType: string,
  fileName?: string | null,
): string {
  const source = fileName || uri.split("?")[0]?.split("#")[0] || uri;
  const extension = source.match(/\.([a-zA-Z0-9]+)$/)?.[1];
  return (extension ?? MIME_EXTENSIONS[mimeType] ?? "mp4").toLowerCase();
}

function getFileInfo(uri: string) {
  try {
    const file = new File(uri);
    return {
      exists: file.exists,
      size: file.size,
      type: file.type,
      uri: file.uri,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      uri,
    };
  }
}

export async function createPreviewVideo(
  asset: ImagePicker.ImagePickerAsset,
): Promise<SelectedVideo> {
  const startedAt = Date.now();
  const mimeType = asset.mimeType ?? "video/mp4";
  const durationSeconds = Math.max(
    5,
    Math.ceil((asset.duration ?? 5000) / 1000),
  );

  debugLog("picker.asset", {
    uri: asset.uri,
    assetId: asset.assetId,
    type: asset.type,
    fileName: asset.fileName,
    fileSize: asset.fileSize,
    mimeType,
    durationSeconds,
    width: asset.width,
    height: asset.height,
  });

  if (Platform.OS === "web") {
    return { uri: asset.uri, mimeType, durationSeconds, playbackUri: asset.uri };
  }

  const previewDirectory = new Directory(Paths.document, "preview-uploads");
  previewDirectory.create({ intermediates: true, idempotent: true });

  const source = new File(asset.uri);
  const preview = new File(
    previewDirectory,
    `${createId()}.${getVideoExtension(asset.uri, mimeType, asset.fileName)}`,
  );
  debugLog("preview.copy.start", {
    source: getFileInfo(asset.uri),
    destination: preview.uri,
  });
  await source.copy(preview, { overwrite: true });
  debugLog("preview.copy.end", {
    elapsedMs: Date.now() - startedAt,
    source: getFileInfo(asset.uri),
    destination: getFileInfo(preview.uri),
  });

  return {
    uri: preview.uri,
    mimeType,
    playbackUri: asset.uri,
    previewUri: preview.uri,
    durationSeconds,
  };
}

export function deleteLocalPreview(video: SelectedVideo | null) {
  if (!video?.previewUri) return;

  deleteLocalFile(video.previewUri);
}

export function deleteLocalFile(uri: string | null | undefined) {
  if (Platform.OS === "web" || !uri?.startsWith("file://")) return;

  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Preview files are disposable; a missing file should not block the UI.
  }
}

export function getCompatiblePickerOptions(): ImagePicker.ImagePickerOptions {
  return {
    mediaTypes: ["videos"],
    preferredAssetRepresentationMode:
      ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    shouldDownloadFromNetwork: true,
    videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
    videoQuality: ImagePicker.UIImagePickerControllerQualityType.IFrame1280x720,
    quality: 1,
  };
}

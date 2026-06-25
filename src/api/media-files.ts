import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

export const UPLOADS_DIRECTORY = "uploads";
export const THUMBNAILS_DIRECTORY = "thumbnails";

const DOCUMENT_MEDIA_DIRECTORIES = [
  UPLOADS_DIRECTORY,
  THUMBNAILS_DIRECTORY,
] as const;

function splitRelativePath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

export function createDocumentDirectory(name: string): Directory {
  const directory = new Directory(Paths.document, name);
  directory.create({ intermediates: true, idempotent: true });
  return directory;
}

export function createDocumentFile(relativePath: string): File {
  return new File(Paths.document, ...splitRelativePath(relativePath));
}

export function getDocumentFileUri(relativePath: string): string {
  if (Platform.OS === "web" || relativePath.includes("://")) {
    return relativePath;
  }

  return createDocumentFile(relativePath).uri;
}

export function getDocumentRelativeMediaPath(uri: string): string | null {
  if (Platform.OS === "web" || !uri.startsWith("file://")) {
    return null;
  }

  for (const directory of DOCUMENT_MEDIA_DIRECTORIES) {
    const marker = `/${directory}/`;
    const markerIndex = uri.indexOf(marker);

    if (markerIndex !== -1) {
      return uri.slice(markerIndex + 1);
    }
  }

  return null;
}

export function normalizeStoredMediaPath(path: string | null | undefined) {
  if (!path) return "";

  return getDocumentRelativeMediaPath(path) ?? path;
}

export function resolveStoredMediaUri(path: string | null | undefined): string {
  if (!path) return "";

  return getDocumentFileUri(normalizeStoredMediaPath(path));
}

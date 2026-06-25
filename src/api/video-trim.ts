import { trimVideo } from "expo-trim-video";
import { err, ok, type ApiResponse } from "./types";

export type TrimVideoRequest = {
  endTime: number;
  startTime: number;
  uri: string;
};

export type TrimVideoResponse = {
  uri: string;
};

export async function trimVideoSegment(
  input: TrimVideoRequest,
): Promise<ApiResponse<TrimVideoResponse>> {
  try {
    const startTime = Math.max(0, input.startTime);
    const endTime = Math.max(startTime, input.endTime);

    let lastError: unknown;

    try {
      const result = await trimVideo({
        end: endTime,
        start: startTime,
        uri: input.uri,
      });
      return ok({ uri: result.uri });
    } catch (error) {
      lastError = error;
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Video trimming failed.");
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Video trimming failed.",
      500,
    );
  }
}

import { z } from 'zod';

export const UploadRequestSchema = z.object({
  uri: z.string().min(1).openapi({ example: 'file:///path/to/video.mp4' }),
  mimeType: z.string().min(1).openapi({ example: 'video/mp4' }),
});

export const UploadResponseSchema = z.object({
  id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  uri: z.string().openapi({ example: 'file:///path/to/video.mp4' }),
  mimeType: z.string().openapi({ example: 'video/mp4' }),
  createdAt: z.string().datetime().openapi({ example: '2026-06-25T12:00:00.000Z' }),
});

export type UploadRequest = z.infer<typeof UploadRequestSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;

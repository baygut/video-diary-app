import { z } from 'zod';

export const UploadRequestSchema = z
  .object({
    uri: z.string().min(1).meta({ description: 'File URI of the video', examples: ['file:///path/to/video.mp4'] }),
    mimeType: z.string().min(1).meta({ description: 'MIME type', examples: ['video/mp4'] }),
  })
  .meta({ id: 'UploadRequest' });

export const UploadResponseSchema = z
  .object({
    id: z.string().uuid().meta({ examples: ['550e8400-e29b-41d4-a716-446655440000'] }),
    uri: z.string().meta({ examples: ['file:///path/to/video.mp4'] }),
    mimeType: z.string().meta({ examples: ['video/mp4'] }),
    createdAt: z.string().datetime().meta({ examples: ['2026-06-25T12:00:00.000Z'] }),
  })
  .meta({ id: 'UploadResponse' });

export type UploadRequest = z.infer<typeof UploadRequestSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;

import { z } from 'zod';

export const DiaryCreateRequestSchema = z.object({
  uploadId: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  name: z.string().min(1).max(50).openapi({ example: 'Sunset at the beach' }),
  description: z.string().max(200).optional().openapi({ example: 'A beautiful evening.' }),
});

export const DiarySchema = z.object({
  id: z.string().uuid().openapi({ example: '660e8400-e29b-41d4-a716-446655440001' }),
  uploadId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const DiaryListSchema = z.array(DiarySchema);

export type DiaryCreateRequest = z.infer<typeof DiaryCreateRequestSchema>;
export type Diary = z.infer<typeof DiarySchema>;

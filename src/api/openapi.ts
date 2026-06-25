import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  DiaryCreateRequestSchema,
  DiaryListSchema,
  DiarySchema,
  UploadRequestSchema,
  UploadResponseSchema,
} from './schema';

export function generateOpenApiSpec() {
  const registry = new OpenAPIRegistry();

  registry.registerPath({
    method: 'post',
    path: '/upload',
    summary: 'Upload a video file reference',
    request: {
      body: {
        content: { 'application/json': { schema: UploadRequestSchema } },
        required: true,
      },
    },
    responses: {
      201: {
        description: 'Upload created',
        content: { 'application/json': { schema: UploadResponseSchema } },
      },
      400: { description: 'Validation error' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/diary',
    summary: 'Create a diary entry',
    request: {
      body: {
        content: { 'application/json': { schema: DiaryCreateRequestSchema } },
        required: true,
      },
    },
    responses: {
      201: {
        description: 'Diary entry created',
        content: { 'application/json': { schema: DiarySchema } },
      },
      400: { description: 'Validation error' },
      404: { description: 'Upload not found' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/diary',
    summary: 'List all diary entries',
    responses: {
      200: {
        description: 'List of diary entries',
        content: { 'application/json': { schema: DiaryListSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/diary/{id}',
    summary: 'Get a diary entry by ID',
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      200: {
        description: 'Diary entry',
        content: { 'application/json': { schema: DiarySchema } },
      },
      404: { description: 'Not found' },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/diary/{id}',
    summary: 'Delete a diary entry and its upload',
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      200: {
        description: 'Diary entry deleted',
        content: {
          'application/json': {
            schema: z.object({ id: z.string().uuid() }),
          },
        },
      },
      404: { description: 'Not found' },
    },
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Video Diary Internal API',
      version: '1.0.0',
      description: 'Internal SQLite-backed API for the Video Diary app',
    },
    servers: [{ url: 'internal://' }],
  });
}

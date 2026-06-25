import { useMutation } from '@tanstack/react-query';

import { trimVideoSegment, type TrimVideoRequest } from '@/api/video-trim';

export function useTrimVideo() {
  return useMutation({
    mutationFn: async (input: TrimVideoRequest) => {
      const result = await trimVideoSegment(input);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
}

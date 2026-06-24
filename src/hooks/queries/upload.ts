import { useMutation } from '@tanstack/react-query';

import { postUpload } from '@/api';
import type { UploadRequest } from '@/api';

export function useUploadVideo() {
  return useMutation({
    mutationFn: async (input: UploadRequest) => {
      const result = await postUpload(input);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
}

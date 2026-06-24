import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getDiaryById, getDiaryList, postDiary } from '@/api';
import type { DiaryCreateRequest } from '@/api';

export const diaryQueryOptions = {
  list: () =>
    queryOptions({
      queryKey: ['/diary'] as const,
      queryFn: async () => {
        const result = await getDiaryList();
        if (!result.ok) throw new Error(result.error);
        return result.data;
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: ['/diary', id] as const,
      queryFn: async () => {
        const result = await getDiaryById(id);
        if (!result.ok) throw new Error(result.error);
        return result.data;
      },
      enabled: Boolean(id),
    }),
};

export function useDiaries() {
  return useQuery(diaryQueryOptions.list());
}

export function useDiary(id: string) {
  return useQuery(diaryQueryOptions.detail(id));
}

export function useCreateDiary() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: DiaryCreateRequest) => {
      const result = await postDiary(input);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['/diary'] });
    },
  });
}

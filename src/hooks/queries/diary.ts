import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteDiaryById,
  getDiaryById,
  getDiaryList,
  postDiary,
  updateDiaryById,
} from '@/api';
import type { DiaryCreateRequest, DiaryUpdateRequest } from '@/api';

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

export function useUpdateDiary() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: DiaryUpdateRequest;
    }) => {
      const result = await updateDiaryById(id, values);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      client.setQueryData(['/diary', data.id], data);
      client.invalidateQueries({ queryKey: ['/diary'] });
    },
  });
}

export function useDeleteDiary() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteDiaryById(id);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ['/diary'] });
      client.removeQueries({ queryKey: ['/diary', id] });
    },
  });
}

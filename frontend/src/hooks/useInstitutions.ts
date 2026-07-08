import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/types/common";
import type { Institution, InstitutionRequest } from "@/types/institution";

const KEY = "institutions";

export function useInstitutions(page: number, size: number) {
  return useQuery({
    queryKey: [KEY, page, size],
    queryFn: async () => {
      const { data } = await api.get<Page<Institution>>("/institutions", {
        params: { page, size, sort: "name" },
      });
      return data;
    },
  });
}

export function useAllInstitutions() {
  return useQuery({
    queryKey: [KEY, "all"],
    queryFn: async () => {
      const { data } = await api.get<Page<Institution>>("/institutions", {
        params: { page: 0, size: 200, sort: "name" },
      });
      return data.content;
    },
  });
}

export function useCreateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: InstitutionRequest) => {
      const { data } = await api.post<Institution>("/institutions", payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: InstitutionRequest }) => {
      const { data } = await api.put<Institution>(`/institutions/${id}`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/institutions/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

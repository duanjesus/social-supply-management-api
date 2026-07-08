import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/types/common";
import type { AppUser } from "@/types/user";
import type { UserRole } from "@/types/auth";

const KEY = "users";

export function useUsers(page: number, size: number) {
  return useQuery({
    queryKey: [KEY, page, size],
    queryFn: async () => {
      const { data } = await api.get<Page<AppUser>>("/users", {
        params: { page, size, sort: "name" },
      });
      return data;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: UserRole }) => {
      const { data } = await api.patch<AppUser>(`/users/${id}/role`, { role });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

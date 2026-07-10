import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/types/common";
import type { Distribution, DistributionRequest } from "@/types/distribution";

const KEY = "distributions";

export function useDistributions(page: number, size: number) {
  return useQuery({
    queryKey: [KEY, page, size],
    queryFn: async () => {
      const { data } = await api.get<Page<Distribution>>("/distributions", {
        params: { page, size, sort: "distributionDate,desc" },
      });
      return data;
    },
  });
}

export function useCreateDistribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DistributionRequest) => {
      const { data } = await api.post<Distribution>("/distributions", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      // A distribution decrements the distributed product's stock balance.
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

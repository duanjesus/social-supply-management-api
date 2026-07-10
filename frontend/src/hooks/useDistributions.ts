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

/**
 * Fetches a large-ish page of distributions for client-side aggregation (top
 * institutions, monthly trend on the dashboard). Same stand-in caveat as
 * useAllDonations — swap for a backend aggregate endpoint if volume grows.
 */
export function useAllDistributions() {
  return useQuery({
    queryKey: [KEY, "all"],
    queryFn: async () => {
      const { data } = await api.get<Page<Distribution>>("/distributions", {
        params: { page: 0, size: 500, sort: "distributionDate,desc" },
      });
      return data.content;
    },
  });
}

export interface DistributionReportFilters {
  startDate?: string;
  endDate?: string;
  institutionId?: number;
}

/** On-demand, server-filtered fetch for the Reports page — see useDonationsReport. */
export function useDistributionsReport() {
  return useMutation({
    mutationFn: async (filters: DistributionReportFilters) => {
      const { data } = await api.get<Page<Distribution>>("/distributions", {
        params: { page: 0, size: 2000, sort: "distributionDate", ...filters },
      });
      return data.content;
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

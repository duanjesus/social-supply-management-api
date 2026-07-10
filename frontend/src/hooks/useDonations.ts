import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/types/common";
import type { Donation, DonationRequest } from "@/types/donation";

const KEY = "donations";

export function useDonations(page: number, size: number) {
  return useQuery({
    queryKey: [KEY, page, size],
    queryFn: async () => {
      const { data } = await api.get<Page<Donation>>("/donations", {
        params: { page, size, sort: "donationDate,desc" },
      });
      return data;
    },
  });
}

/**
 * Fetches a large-ish page of donations for client-side aggregation (e.g. "this
 * month" counts on the dashboard). The API has no date-range filter yet, so this
 * is a pragmatic stand-in — swap for a backend aggregate endpoint if volume grows
 * past a few hundred donations/month.
 */
export function useAllDonations() {
  return useQuery({
    queryKey: [KEY, "all"],
    queryFn: async () => {
      const { data } = await api.get<Page<Donation>>("/donations", {
        params: { page: 0, size: 500, sort: "donationDate,desc" },
      });
      return data.content;
    },
  });
}

export interface ReportDateFilters {
  startDate?: string;
  endDate?: string;
}

/** On-demand, server-filtered fetch for the Reports page — unlike useAllDonations
 * this hits the backend's startDate/endDate query params, so it's not capped by
 * client-side aggregation limits. Call `.mutate(filters)` to (re)generate. */
export function useDonationsReport() {
  return useMutation({
    mutationFn: async (filters: ReportDateFilters) => {
      const { data } = await api.get<Page<Donation>>("/donations", {
        params: { page: 0, size: 2000, sort: "donationDate", ...filters },
      });
      return data.content;
    },
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DonationRequest) => {
      const { data } = await api.post<Donation>("/donations", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      // A donation increments the donated product's stock balance.
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

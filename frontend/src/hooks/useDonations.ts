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

export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DonationRequest) => {
      const { data } = await api.post<Donation>("/donations", payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

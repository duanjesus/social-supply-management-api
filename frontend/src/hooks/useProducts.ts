import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/types/common";
import type { Product, ProductRequest } from "@/types/product";

const KEY = "products";

export function useProducts(page: number, size: number) {
  return useQuery({
    queryKey: [KEY, page, size],
    queryFn: async () => {
      const { data } = await api.get<Page<Product>>("/products", {
        params: { page, size, sort: "name" },
      });
      return data;
    },
  });
}

export function useAllProducts() {
  return useQuery({
    queryKey: [KEY, "all"],
    queryFn: async () => {
      const { data } = await api.get<Page<Product>>("/products", {
        params: { page: 0, size: 200, sort: "name" },
      });
      return data.content;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProductRequest) => {
      const { data } = await api.post<Product>("/products", payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: ProductRequest }) => {
      const { data } = await api.put<Product>(`/products/${id}`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

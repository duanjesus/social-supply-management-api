import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import { usePaginationState } from "@/hooks/usePaginationState";
import { extractErrorMessage } from "@/lib/api";
import type { Product } from "@/types/product";
import { PRODUCT_CATEGORY_LABELS, PRODUCT_UNIT_LABELS } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Pagination } from "@/components/ui/Pagination";
import { ProductFormModal } from "@/pages/products/ProductFormModal";

export function ProductsListPage() {
  const { isAdmin } = useAuth();
  const { page, size, setPage } = usePaginationState();
  const { data, isLoading, isError } = useProducts(page, size);
  const deleteProduct = useDeleteProduct();

  const [modalState, setModalState] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(product: Product) {
    if (!window.confirm(`Excluir o produto "${product.name}"?`)) return;
    setDeleteError(null);
    try {
      await deleteProduct.mutateAsync(product.id);
    } catch (error) {
      setDeleteError(extractErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Produtos</h1>
          <p className="text-sm text-slate-500">Produtos que compõem o estoque do programa.</p>
        </div>
        <Button onClick={() => setModalState({ open: true, product: null })}>+ Novo produto</Button>
      </div>

      <ErrorBanner message={deleteError} />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        )}
        {isError && <ErrorBanner message="Não foi possível carregar os produtos." />}
        {!isLoading && data?.content.length === 0 && (
          <EmptyState message="Nenhum produto cadastrado ainda." />
        )}
        {!isLoading && data && data.content.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Unidade</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                    <td className="px-4 py-3">
                      <Badge tone="blue">{PRODUCT_CATEGORY_LABELS[product.category]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{PRODUCT_UNIT_LABELS[product.unit]}</td>
                    <td className="px-4 py-3 text-slate-600">{product.description ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setModalState({ open: true, product })}>
                          Editar
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(product)}
                            isLoading={deleteProduct.isPending}
                          >
                            Excluir
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
      </div>

      {modalState.open && (
        <ProductFormModal
          product={modalState.product}
          onClose={() => setModalState({ open: false, product: null })}
        />
      )}
    </div>
  );
}

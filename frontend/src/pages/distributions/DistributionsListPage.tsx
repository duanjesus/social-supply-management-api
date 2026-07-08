import { useState } from "react";

import { useDistributions } from "@/hooks/useDistributions";
import { usePaginationState } from "@/hooks/usePaginationState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Pagination } from "@/components/ui/Pagination";
import { PRODUCT_UNIT_LABELS } from "@/types/product";
import { formatDate, formatQuantity } from "@/utils/format";
import { DistributionFormModal } from "@/pages/distributions/DistributionFormModal";

export function DistributionsListPage() {
  const { page, size, setPage } = usePaginationState();
  const { data, isLoading, isError } = useDistributions(page, size);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Distribuições</h1>
          <p className="text-sm text-slate-500">Produtos distribuídos do estoque para instituições.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Registrar distribuição</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        )}
        {isError && <ErrorBanner message="Não foi possível carregar as distribuições." />}
        {!isLoading && data?.content.length === 0 && (
          <EmptyState message="Nenhuma distribuição registrada ainda." />
        )}
        {!isLoading && data && data.content.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Instituição</th>
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Quantidade</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((distribution) => (
                  <tr key={distribution.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {distribution.institution.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="amber">{distribution.product.name}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatQuantity(distribution.quantity)} {PRODUCT_UNIT_LABELS[distribution.product.unit]}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(distribution.distributionDate)}</td>
                    <td className="px-4 py-3 text-slate-600">{distribution.responsibleName ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
      </div>

      {modalOpen && <DistributionFormModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

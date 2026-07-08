import { useState } from "react";

import { useDonations } from "@/hooks/useDonations";
import { usePaginationState } from "@/hooks/usePaginationState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Pagination } from "@/components/ui/Pagination";
import { PRODUCT_UNIT_LABELS } from "@/types/product";
import { formatDate, formatQuantity } from "@/utils/format";
import { DonationFormModal } from "@/pages/donations/DonationFormModal";

export function DonationsListPage() {
  const { page, size, setPage } = usePaginationState();
  const { data, isLoading, isError } = useDonations(page, size);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Doações</h1>
          <p className="text-sm text-slate-500">Doações recebidas para o estoque.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Registrar doação</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        )}
        {isError && <ErrorBanner message="Não foi possível carregar as doações." />}
        {!isLoading && data?.content.length === 0 && (
          <EmptyState message="Nenhuma doação registrada ainda." />
        )}
        {!isLoading && data && data.content.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Doador</th>
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Quantidade</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{donation.donorName}</p>
                      {donation.donorDocument && (
                        <p className="text-xs text-slate-500">{donation.donorDocument}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="amber">{donation.product.name}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatQuantity(donation.quantity)} {PRODUCT_UNIT_LABELS[donation.product.unit]}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(donation.donationDate)}</td>
                    <td className="px-4 py-3 text-slate-600">{donation.description ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
      </div>

      {modalOpen && <DonationFormModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

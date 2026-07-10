import { useState } from "react";

import { useDonationsReport } from "@/hooks/useDonations";
import { useDistributionsReport } from "@/hooks/useDistributions";
import { useAllInstitutions } from "@/hooks/useInstitutions";
import { PRODUCT_UNIT_LABELS } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { formatDate, formatQuantity } from "@/utils/format";
import { extractErrorMessage } from "@/lib/api";

export function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const { data: institutions } = useAllInstitutions();
  const donationsReport = useDonationsReport();
  const distributionsReport = useDistributionsReport();

  const isLoading = donationsReport.isPending || distributionsReport.isPending;
  const error = donationsReport.error || distributionsReport.error;
  const institutionName = institutions?.find((i) => i.id === Number(institutionId))?.name;

  const [isExporting, setIsExporting] = useState(false);

  function handleGenerate() {
    setHasGenerated(true);
    donationsReport.mutate({ startDate: startDate || undefined, endDate: endDate || undefined });
    distributionsReport.mutate({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      institutionId: institutionId ? Number(institutionId) : undefined,
    });
  }

  // jspdf pulls in a heavy dependency (html2canvas) — load it only when the
  // user actually exports, instead of bundling it into the initial page load.
  async function handleExportPdf() {
    setIsExporting(true);
    try {
      const { exportReportToPdf } = await import("@/utils/reportExport");
      exportReportToPdf(donations, distributions, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        institutionName,
      });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportCsv() {
    const { exportReportToCsv } = await import("@/utils/reportExport");
    exportReportToCsv(donations, distributions);
  }

  const donations = donationsReport.data ?? [];
  const distributions = distributionsReport.data ?? [];
  const hasResults = hasGenerated && !isLoading && (donations.length > 0 || distributions.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Relatórios</h1>
        <p className="text-sm text-slate-500">
          Doações e distribuições por período, opcionalmente filtradas por instituição.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Input
            label="Data inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input label="Data final" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Select
            label="Instituição"
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
          >
            <option value="">Todas</option>
            {institutions?.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </Select>
          <div className="flex items-end">
            <Button className="w-full" onClick={handleGenerate} isLoading={isLoading}>
              Gerar relatório
            </Button>
          </div>
        </div>
      </div>

      <ErrorBanner message={error ? extractErrorMessage(error) : null} />

      {!hasGenerated && (
        <EmptyState message="Escolha um período (opcional) e clique em “Gerar relatório”." />
      )}

      {hasGenerated && isLoading && (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      )}

      {hasGenerated && !isLoading && !hasResults && (
        <EmptyState message="Nenhuma doação ou distribuição encontrada para esse filtro." />
      )}

      {hasResults && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-6 text-sm">
              <span>
                <strong className="text-base">{donations.length}</strong> doações
              </span>
              <span>
                <strong className="text-base">{distributions.length}</strong> distribuições
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleExportPdf} isLoading={isExporting}>
                Exportar PDF
              </Button>
              <Button variant="secondary" onClick={handleExportCsv}>
                Exportar Excel (CSV)
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Doações ({donations.length})</h2>
            </div>
            {donations.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Nenhuma doação no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Data</th>
                      <th className="px-4 py-3 font-medium">Doador</th>
                      <th className="px-4 py-3 font-medium">Produto</th>
                      <th className="px-4 py-3 font-medium">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-4 py-3 text-slate-600">{formatDate(donation.donationDate)}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{donation.donorName}</td>
                        <td className="px-4 py-3 text-slate-600">{donation.product.name}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatQuantity(donation.quantity)} {PRODUCT_UNIT_LABELS[donation.product.unit]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Distribuições ({distributions.length})
              </h2>
            </div>
            {distributions.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Nenhuma distribuição no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Data</th>
                      <th className="px-4 py-3 font-medium">Instituição</th>
                      <th className="px-4 py-3 font-medium">Produto</th>
                      <th className="px-4 py-3 font-medium">Quantidade</th>
                      <th className="px-4 py-3 font-medium">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {distributions.map((distribution) => (
                      <tr key={distribution.id}>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(distribution.distributionDate)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {distribution.institution.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{distribution.product.name}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatQuantity(distribution.quantity)}{" "}
                          {PRODUCT_UNIT_LABELS[distribution.product.unit]}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {distribution.responsibleName ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

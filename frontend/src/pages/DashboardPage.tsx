import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "@/lib/api";
import type { Page } from "@/types/common";
import { useAuth } from "@/context/AuthContext";
import { useDonations, useAllDonations } from "@/hooks/useDonations";
import { useDistributions, useAllDistributions } from "@/hooks/useDistributions";
import { useAllInstitutions } from "@/hooks/useInstitutions";
import { useLowStockProducts } from "@/hooks/useProducts";
import { PRODUCT_UNIT_LABELS } from "@/types/product";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { TopBarList } from "@/components/charts/TopBarList";
import { TrendChart } from "@/components/charts/TrendChart";
import { formatCount, formatDate, formatQuantity, isInCurrentMonth } from "@/utils/format";
import { monthlyTrend, topAttendedInstitutions, topDonatedProducts } from "@/utils/aggregate";

function useCount(resource: string) {
  return useQuery({
    queryKey: [resource, "count"],
    queryFn: async () => {
      const { data } = await api.get<Page<unknown>>(`/${resource}`, {
        params: { page: 0, size: 1 },
      });
      return data.totalElements;
    },
  });
}

interface StatRowProps {
  icon: string;
  label: string;
  value?: number;
  isLoading: boolean;
}

function StatRow({ icon, label, value, isLoading }: StatRowProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <span className="text-lg" aria-hidden="true">
          {icon}
        </span>
        {label}
      </span>
      {isLoading ? (
        <Spinner className="h-5 w-5" />
      ) : (
        <span className="text-2xl font-bold tabular-nums text-slate-900">{formatCount(value ?? 0)}</span>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const institutions = useCount("institutions");
  const products = useCount("products");
  const distributions = useCount("distributions");
  const allInstitutions = useAllInstitutions();
  const allDonations = useAllDonations();

  const familiesServed = allInstitutions.data?.reduce(
    (sum, institution) => sum + (institution.familiesServed ?? 0),
    0,
  );
  const donationsThisMonth = allDonations.data?.filter((donation) =>
    isInCurrentMonth(donation.donationDate),
  ).length;

  const recentDonations = useDonations(0, 5);
  const recentDistributions = useDistributions(0, 5);
  const lowStockProducts = useLowStockProducts();
  const allDistributions = useAllDistributions();

  const trendLoading = allDonations.isLoading || allDistributions.isLoading;
  const trendData =
    allDonations.data && allDistributions.data
      ? monthlyTrend(allDonations.data, allDistributions.data)
      : [];

  const topProducts = allDonations.data ? topDonatedProducts(allDonations.data) : [];
  const topInstitutions = allDistributions.data ? topAttendedInstitutions(allDistributions.data) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Olá, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-slate-500">Visão geral do programa de suprimentos sociais.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          <StatRow
            icon="🏢"
            label="Instituições cadastradas"
            value={institutions.data}
            isLoading={institutions.isLoading}
          />
          <StatRow
            icon="👨‍👩‍👧"
            label="Famílias atendidas"
            value={familiesServed}
            isLoading={allInstitutions.isLoading}
          />
          <StatRow
            icon="📦"
            label="Produtos cadastrados"
            value={products.data}
            isLoading={products.isLoading}
          />
          <StatRow
            icon="❤️"
            label="Doações este mês"
            value={donationsThisMonth}
            isLoading={allDonations.isLoading}
          />
          <StatRow
            icon="🚚"
            label="Distribuições realizadas"
            value={distributions.data}
            isLoading={distributions.isLoading}
          />
        </div>
      </div>

      {!lowStockProducts.isLoading && !!lowStockProducts.data?.length && (
        <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50 shadow-sm">
          <div className="border-b border-red-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-red-800">⚠️ Estoque baixo</h2>
          </div>
          <ul className="divide-y divide-red-100">
            {lowStockProducts.data.map((product) => (
              <li key={product.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <Link to="/products" className="font-medium text-red-900 hover:underline">
                  {product.name}
                </Link>
                <Badge tone="red">
                  {formatQuantity(product.currentStock)} / mínimo {formatQuantity(product.minimumStock ?? 0)}{" "}
                  {PRODUCT_UNIT_LABELS[product.unit]}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Doações e distribuições — últimos 6 meses</h2>
        </div>
        {trendLoading ? (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        ) : (
          <TrendChart data={trendData} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Produtos mais doados</h2>
          </div>
          {allDonations.isLoading ? (
            <div className="flex justify-center p-6">
              <Spinner />
            </div>
          ) : topProducts.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Nenhuma doação registrada ainda.</p>
          ) : (
            <TopBarList
              color="#2a78d6"
              items={topProducts.map((product) => ({
                id: product.productId,
                label: product.name,
                value: product.totalQuantity,
                displayValue: `${formatQuantity(product.totalQuantity)} ${PRODUCT_UNIT_LABELS[product.unit]}`,
              }))}
            />
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Instituições mais atendidas</h2>
          </div>
          {allDistributions.isLoading ? (
            <div className="flex justify-center p-6">
              <Spinner />
            </div>
          ) : topInstitutions.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Nenhuma distribuição registrada ainda.</p>
          ) : (
            <TopBarList
              color="#1baf7a"
              items={topInstitutions.map((institution) => ({
                id: institution.institutionId,
                label: institution.name,
                value: institution.distributionCount,
                displayValue: `${institution.distributionCount} entrega${institution.distributionCount === 1 ? "" : "s"}`,
              }))}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Doações recentes</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentDonations.isLoading && (
              <li className="flex justify-center p-6">
                <Spinner />
              </li>
            )}
            {recentDonations.data?.content.length === 0 && (
              <li className="p-4 text-sm text-slate-500">Nenhuma doação registrada ainda.</li>
            )}
            {recentDonations.data?.content.map((donation) => (
              <li key={donation.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{donation.donorName}</p>
                  <p className="text-slate-500">
                    {formatQuantity(donation.quantity)} {donation.product.unit} de {donation.product.name}
                  </p>
                </div>
                <span className="text-slate-400">{formatDate(donation.donationDate)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Distribuições recentes</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentDistributions.isLoading && (
              <li className="flex justify-center p-6">
                <Spinner />
              </li>
            )}
            {recentDistributions.data?.content.length === 0 && (
              <li className="p-4 text-sm text-slate-500">Nenhuma distribuição registrada ainda.</li>
            )}
            {recentDistributions.data?.content.map((distribution) => (
              <li key={distribution.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{distribution.institution.name}</p>
                  <p className="text-slate-500">
                    {formatQuantity(distribution.quantity)} {distribution.product.unit} de{" "}
                    {distribution.product.name}
                  </p>
                </div>
                <span className="text-slate-400">{formatDate(distribution.distributionDate)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

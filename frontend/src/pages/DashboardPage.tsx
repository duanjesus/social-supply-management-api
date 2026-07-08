import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/types/common";
import { useAuth } from "@/context/AuthContext";
import { useDonations } from "@/hooks/useDonations";
import { useDistributions } from "@/hooks/useDistributions";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate, formatQuantity } from "@/utils/format";

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

function StatCard({ label, value, isLoading }: { label: string; value?: number; isLoading: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2 text-2xl font-semibold text-slate-900">
        {isLoading ? <Spinner className="h-5 w-5" /> : (value ?? 0)}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const institutions = useCount("institutions");
  const products = useCount("products");
  const donations = useCount("donations");
  const distributions = useCount("distributions");

  const recentDonations = useDonations(0, 5);
  const recentDistributions = useDistributions(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Olá, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-slate-500">Visão geral do programa de suprimentos sociais.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Instituições" value={institutions.data} isLoading={institutions.isLoading} />
        <StatCard label="Produtos" value={products.data} isLoading={products.isLoading} />
        <StatCard label="Doações" value={donations.data} isLoading={donations.isLoading} />
        <StatCard label="Distribuições" value={distributions.data} isLoading={distributions.isLoading} />
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

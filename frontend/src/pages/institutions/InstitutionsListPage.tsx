import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useDeleteInstitution, useInstitutions } from "@/hooks/useInstitutions";
import { usePaginationState } from "@/hooks/usePaginationState";
import { extractErrorMessage } from "@/lib/api";
import type { Institution } from "@/types/institution";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Pagination } from "@/components/ui/Pagination";
import { InstitutionFormModal } from "@/pages/institutions/InstitutionFormModal";

export function InstitutionsListPage() {
  const { isAdmin } = useAuth();
  const { page, size, setPage } = usePaginationState();
  const { data, isLoading, isError } = useInstitutions(page, size);
  const deleteInstitution = useDeleteInstitution();

  const [modalState, setModalState] = useState<{ open: boolean; institution: Institution | null }>({
    open: false,
    institution: null,
  });
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(institution: Institution) {
    if (!window.confirm(`Excluir a instituição "${institution.name}"?`)) return;
    setDeleteError(null);
    try {
      await deleteInstitution.mutateAsync(institution.id);
    } catch (error) {
      setDeleteError(extractErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Instituições</h1>
          <p className="text-sm text-slate-500">Instituições atendidas pelo programa social.</p>
        </div>
        <Button onClick={() => setModalState({ open: true, institution: null })}>+ Nova instituição</Button>
      </div>

      <ErrorBanner message={deleteError} />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        )}
        {isError && <ErrorBanner message="Não foi possível carregar as instituições." />}
        {!isLoading && data?.content.length === 0 && (
          <EmptyState message="Nenhuma instituição cadastrada ainda." />
        )}
        {!isLoading && data && data.content.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">CNPJ</th>
                  <th className="px-4 py-3 font-medium">Responsável</th>
                  <th className="px-4 py-3 font-medium">Famílias</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((institution) => (
                  <tr key={institution.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{institution.name}</td>
                    <td className="px-4 py-3 text-slate-600">{institution.cnpj}</td>
                    <td className="px-4 py-3 text-slate-600">{institution.responsibleName ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{institution.familiesServed ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={institution.active ? "green" : "slate"}>
                        {institution.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setModalState({ open: true, institution })}
                        >
                          Editar
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(institution)}
                            isLoading={deleteInstitution.isPending}
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
        <InstitutionFormModal
          institution={modalState.institution}
          onClose={() => setModalState({ open: false, institution: null })}
        />
      )}
    </div>
  );
}

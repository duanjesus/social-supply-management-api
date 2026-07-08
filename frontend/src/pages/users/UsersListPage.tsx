import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useUpdateUserRole, useUsers } from "@/hooks/useUsers";
import { usePaginationState } from "@/hooks/usePaginationState";
import { extractErrorMessage } from "@/lib/api";
import type { AppUser } from "@/types/user";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Pagination } from "@/components/ui/Pagination";

export function UsersListPage() {
  const { user: currentUser } = useAuth();
  const { page, size, setPage } = usePaginationState();
  const { data, isLoading, isError } = useUsers(page, size);
  const updateRole = useUpdateUserRole();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function handleToggleRole(target: AppUser) {
    const nextRole = target.role === "ADMIN" ? "OPERATOR" : "ADMIN";
    const verb = nextRole === "ADMIN" ? "promover" : "rebaixar";
    if (!window.confirm(`Quer ${verb} "${target.name}" para ${nextRole}?`)) return;

    setActionError(null);
    setPendingId(target.id);
    try {
      await updateRole.mutateAsync({ id: target.id, role: nextRole });
    } catch (error) {
      setActionError(extractErrorMessage(error));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Usuários</h1>
        <p className="text-sm text-slate-500">
          Gerencie quem tem acesso de Administrador. Novos cadastros públicos entram sempre como
          Operador — promova alguém aqui quando precisar.
        </p>
      </div>

      <ErrorBanner message={actionError} />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        )}
        {isError && <ErrorBanner message="Não foi possível carregar os usuários." />}
        {!isLoading && data?.content.length === 0 && (
          <EmptyState message="Nenhum usuário cadastrado ainda." />
        )}
        {!isLoading && data && data.content.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Papel</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((appUser) => {
                  const isSelf = appUser.email.toLowerCase() === currentUser?.email.toLowerCase();
                  return (
                    <tr key={appUser.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {appUser.name}
                        {isSelf && <span className="ml-2 text-xs text-slate-400">(você)</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{appUser.email}</td>
                      <td className="px-4 py-3">
                        <Badge tone={appUser.role === "ADMIN" ? "blue" : "slate"}>
                          {appUser.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={appUser.active ? "green" : "slate"}>
                          {appUser.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant="secondary"
                            disabled={isSelf}
                            title={isSelf ? "Você não pode alterar o seu próprio papel" : undefined}
                            isLoading={pendingId === appUser.id}
                            onClick={() => handleToggleRole(appUser)}
                          >
                            {appUser.role === "ADMIN" ? "Rebaixar a Operador" : "Promover a Admin"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
      </div>
    </div>
  );
}

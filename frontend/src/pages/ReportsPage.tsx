export function ReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-24 text-center">
      <span className="text-4xl" aria-hidden="true">
        📊
      </span>
      <h1 className="text-lg font-semibold text-slate-900">Relatórios</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Em breve: relatórios exportáveis por período e instituição, e métricas como produtos mais
        doados e instituições mais atendidas.
      </p>
    </div>
  );
}

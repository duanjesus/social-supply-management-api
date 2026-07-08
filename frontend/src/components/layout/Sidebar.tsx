import { NavLink } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS: { to: string; label: string; end?: boolean; adminOnly?: boolean }[] = [
  { to: "/", label: "Visão geral", end: true },
  { to: "/institutions", label: "Instituições" },
  { to: "/products", label: "Produtos" },
  { to: "/donations", label: "Doações" },
  { to: "/distributions", label: "Distribuições" },
  { to: "/reports", label: "📊 Relatórios" },
  { to: "/users", label: "Usuários", adminOnly: true },
];

export function Sidebar() {
  const { isAdmin } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          SS
        </span>
        <span className="text-sm font-semibold text-slate-900">Social Supply</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

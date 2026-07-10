interface TopBarListItem {
  id: number | string;
  label: string;
  value: number;
  displayValue: string;
}

interface TopBarListProps {
  items: TopBarListItem[];
  color: string;
}

/**
 * Compact ranked-bar "leaderboard" — one categorical hue per chart (never a
 * value-ramp per bar), value shown as text beside the bar rather than color.
 */
export function TopBarList({ items, color }: TopBarListProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="flex flex-col gap-3 px-4 py-4">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-medium text-slate-700">{item.label}</span>
            <span className="shrink-0 tabular-nums text-slate-500">{item.displayValue}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

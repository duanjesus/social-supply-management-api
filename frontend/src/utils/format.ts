export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function formatQuantity(quantity: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(quantity);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function isInCurrentMonth(isoDate: string): boolean {
  const currentPrefix = todayIsoDate().slice(0, 7);
  return isoDate.startsWith(currentPrefix);
}

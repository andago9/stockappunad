import type { Sale } from "./sales";

export function inDateRange(date: string, from: string, to: string) {
  const day = date.slice(0, 10);
  return (!from || day >= from) && (!to || day <= to);
}

export function salesSummary(sales: Sale[]) {
  const revenue = sales.reduce((s, sale) => s + sale.total, 0);
  const units = sales.reduce((s, sale) => s + sale.items.reduce((n, i) => n + i.qty, 0), 0);
  return { revenue, units, count: sales.length, average: sales.length ? revenue / sales.length : 0 };
}

export function dailySales(sales: Sale[]) {
  const days = new Map<string, number>();
  sales.forEach((sale) => { const day = sale.date.slice(0, 10); days.set(day, (days.get(day) ?? 0) + sale.total); });
  return [...days].sort(([a], [b]) => a.localeCompare(b)).map(([date, total]) => ({ date, total }));
}

// Neutralize spreadsheet formulas while preserving numeric cells and accents.
export function csvText(headers: string[], rows: (string | number)[][]) {
  const cell = (value: string | number) => {
    const text = typeof value === "string" && /^[\s]*[=+@-]/.test(value) ? `'${value}` : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  return "\uFEFF" + [headers, ...rows].map((row) => row.map(cell).join(";")).join("\r\n");
}

export function downloadCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const url = URL.createObjectURL(new Blob([csvText(headers, rows)], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
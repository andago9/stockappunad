import { useSyncExternalStore } from "react";

export type MovementType = "Entrada" | "Salida" | "Venta";

export type Movement = {
  id: string;
  date: string;
  productId: string | null;
  product: string;
  type: MovementType;
  qty: number;
  note: string;
  user: string;
};

export const SEED_MOVEMENTS: Movement[] = [
  { id: "m1", date: "2026-10-22 08:10", productId: "1", product: "Resma papel carta", type: "Entrada", qty: 20, note: "", user: "Andrés González" },
  { id: "m2", date: "2026-10-21 16:42", productId: "3", product: "Mouse inalámbrico", type: "Venta", qty: 2, note: "", user: "Angie Quiroga" },
  { id: "m3", date: "2026-10-21 11:05", productId: "5", product: "Jabón líquido 1L", type: "Salida", qty: 5, note: "", user: "Andrés González" },
  { id: "m4", date: "2026-10-20 15:30", productId: "4", product: "Teclado USB", type: "Venta", qty: 4, note: "", user: "Angie Quiroga" },
  { id: "m5", date: "2026-10-20 09:12", productId: "6", product: "Toallas de papel", type: "Entrada", qty: 15, note: "", user: "Andrés González" },
];

const KEY = "inv_movements";
let cache: Movement[] | null = null;
const listeners = new Set<() => void>();

function load(): Movement[] {
  if (cache) return cache;
  if (typeof window === "undefined") return SEED_MOVEMENTS;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : SEED_MOVEMENTS;
  } catch {
    cache = SEED_MOVEMENTS;
  }
  return cache!;
}

function save(next: Movement[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useMovements() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    load,
    () => SEED_MOVEMENTS,
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
export function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function addMovement(m: Omit<Movement, "id" | "date">) {
  save([{ ...m, id: crypto.randomUUID(), date: formatDate(new Date()) }, ...load()]);
}

export type MovementInput = { productId: string; qty: string; note: string };

export function validateMovement(v: MovementInput, kind: "entrada" | "salida", stock?: number) {
  const e: Partial<Record<keyof MovementInput, string>> = {};
  if (!v.productId) e.productId = "Selecciona un producto.";
  if (v.qty.trim() === "") e.qty = "La cantidad es obligatoria.";
  else if (isNaN(+v.qty) || +v.qty <= 0) e.qty = "La cantidad debe ser mayor que cero.";
  else if (kind === "salida" && stock !== undefined && +v.qty > stock)
    e.qty = `Solo hay ${stock} unidades disponibles.`;
  return e;
}

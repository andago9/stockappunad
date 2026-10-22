// Mock authentication (RF-01 / RF-08). Session stored in localStorage.
const KEY = "inv_session";

export type Session = { name: string; email: string };

export const DEMO_USER = { email: "admin@inventario.com", password: "admin123", name: "Andrés González" };

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function login(user: string, password: string): Session | null {
  const u = user.trim().toLowerCase();
  if ((u === DEMO_USER.email || u === "admin") && password === DEMO_USER.password) {
    const s = { name: DEMO_USER.name, email: DEMO_USER.email };
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  return null;
}

export function logout() {
  localStorage.removeItem(KEY);
}

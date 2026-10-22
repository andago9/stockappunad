import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Boxes, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_USER, getSession, login } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · Stocka Inventario" },
      { name: "description", content: "Accede al sistema de gestión de inventario para pequeñas empresas." },
      { property: "og:title", content: "Iniciar sesión · Stocka Inventario" },
      { property: "og:description", content: "Accede al sistema de gestión de inventario para pequeñas empresas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState<{ user?: string; pass?: string; form?: string }>({});

  useEffect(() => {
    if (getSession()) navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!user.trim()) next.user = "Ingresa tu correo o usuario.";
    if (!pass) next.pass = "Ingresa tu contraseña.";
    if (!next.user && !next.pass && !login(user, pass)) next.form = "Credenciales incorrectas. Verifica e inténtalo de nuevo.";
    setErrors(next);
    if (Object.keys(next).length === 0) navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-bold"><Boxes className="h-6 w-6 text-sidebar-primary" /> Stocka</div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">Tu inventario,<br />claro y en orden.</h1>
          <p className="mt-4 max-w-sm text-sidebar-foreground/70">Productos, existencias, movimientos y ventas en un solo lugar.</p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">RF-01 · Autenticar usuarios autorizados</p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sidebar-primary/20 blur-3xl" />
      </aside>
      <main className="flex items-center justify-center p-6">
        <form onSubmit={submit} noValidate className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ingresa tus credenciales para continuar.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="user">Correo electrónico o usuario</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="user" className="pl-9" value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin@inventario.com" />
            </div>
            {errors.user && <p className="text-sm text-destructive">{errors.user}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="pass" type="password" className="pl-9" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
            </div>
            {errors.pass && <p className="text-sm text-destructive">{errors.pass}</p>}
          </div>
          {errors.form && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errors.form}</p>}
          <Button type="submit" className="w-full">Iniciar sesión</Button>
          <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Demo: <b>{DEMO_USER.email}</b> (o <b>admin</b>) / <b>{DEMO_USER.password}</b>
          </p>
        </form>
      </main>
    </div>
  );
}

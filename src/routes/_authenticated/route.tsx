import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownToLine, ArrowUpFromLine, BarChart3, Boxes, ChevronDown, History, LayoutDashboard, LogOut, Menu, Package, ShoppingCart, Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getSession, logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    const session = getSession();
    if (!session) throw redirect({ to: "/" });
    return { session };
  },
  component: AppLayout,
});

const inventory = [
  { to: "/entradas", label: "Entradas", icon: ArrowDownToLine },
  { to: "/salidas", label: "Salidas", icon: ArrowUpFromLine },
  { to: "/movimientos", label: "Movimientos", icon: History },
] as const;

function NavItem({ to, label, icon: Icon, path, onNav, nested }: { to: string; label: string; icon: typeof Package; path: string; onNav: () => void; nested?: boolean }) {
  const active = path === to || path.startsWith(to + "/");
  return (
    <Link to={to} onClick={onNav} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", nested && "pl-9",
      active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

function SidebarBody({ path, name, onNav, onLogout }: { path: string; name: string; onNav: () => void; onLogout: () => void }) {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <div className="flex h-full flex-col bg-sidebar p-4 text-sidebar-foreground">
      <div className="mb-8 flex items-center gap-2 px-2 text-lg font-bold"><Boxes className="h-6 w-6 text-sidebar-primary" /> Stocka</div>
      <nav className="flex-1 space-y-1">
        <NavItem to="/dashboard" label="Dashboard" icon={LayoutDashboard} path={path} onNav={onNav} />
        <NavItem to="/productos" label="Productos" icon={Package} path={path} onNav={onNav} />
        <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent">
          <Warehouse className="h-4 w-4" /> Inventario <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
        {open && inventory.map((i) => <NavItem key={i.to} {...i} path={path} onNav={onNav} nested />)}
        <NavItem to="/ventas" label="Ventas" icon={ShoppingCart} path={path} onNav={onNav} />
        <NavItem to="/reportes" label="Reportes" icon={BarChart3} path={path} onNav={onNav} />
      </nav>
      <div className="mt-4 border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">{name.charAt(0)}</div>
          <div className="min-w-0 text-sm"><p className="truncate font-semibold">{name}</p><p className="text-xs text-sidebar-foreground/60">Administrador</p></div>
        </div>
        <button onClick={onLogout} className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function AppLayout() {
  const { session } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const askLogout = () => { setMobile(false); setConfirm(true); };

  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 md:block">
        <SidebarBody path={path} name={session.name} onNav={() => {}} onLogout={askLogout} />
      </aside>
      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="w-64 border-0 p-0">
          <SheetTitle className="sr-only">Menú</SheetTitle>
          <SidebarBody path={path} name={session.name} onNav={() => setMobile(false)} onLogout={askLogout} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobile(true)} aria-label="Abrir menú"><Menu className="h-5 w-5" /></Button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">Hola, <b className="text-foreground">{session.name}</b></span>
            <Button variant="outline" size="sm" onClick={askLogout}><LogOut className="h-4 w-4" /> Cerrar sesión</Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8"><Outlet /></main>
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>Tendrás que ingresar tus credenciales nuevamente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { logout(); navigate({ to: "/", replace: true }); }}>Cerrar sesión</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

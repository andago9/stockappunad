import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProductForm } from "@/components/app/ProductForm";
import { PageHeader } from "@/components/app/ui-bits";
import { updateProduct, useProducts } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/productos/$id_/editar")({
  head: () => ({ meta: [{ title: "Editar producto · Stocka" }, { name: "description", content: "Editar información del producto." }] }),
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const products = useProducts();
  const navigate = useNavigate();
  const p = products.find((x) => x.id === id);
  if (!p) return <div className="text-muted-foreground">Producto no encontrado. <Link to="/productos" className="text-primary underline">Volver</Link></div>;
  return (
    <div>
      <PageHeader title="Editar producto" subtitle={`${p.code} · ${p.name}`} />
      <ProductForm initial={p} products={products} onSave={(d) => { updateProduct(id, d); toast.success("Producto actualizado"); navigate({ to: "/productos" }); }} />
    </div>
  );
}

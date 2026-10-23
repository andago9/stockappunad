import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProductForm } from "@/components/app/ProductForm";
import { PageHeader } from "@/components/app/ui-bits";
import { createProduct, useProducts } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/productos/nuevo")({
  head: () => ({ meta: [{ title: "Nuevo producto · stockapp UNAD" }, { name: "description", content: "Registrar un nuevo producto." }] }),
  component: NewProduct,
});

function NewProduct() {
  const products = useProducts();
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="Nuevo producto" subtitle="RF-02 · Registrar productos" />
      <ProductForm products={products} onSave={(p) => { createProduct(p); toast.success("Producto creado correctamente"); navigate({ to: "/productos" }); }} />
    </div>
  );
}

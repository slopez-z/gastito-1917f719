import { SEO } from "@/components/SEO";

export default function Gastos() {
  return (
    <div className="space-y-4">
      <SEO title="Gastos — (Próximamente)" description="Sección preparada para futuros registros de gastos." canonical="/gastos" />
      <h1 className="text-2xl font-semibold">Gastos</h1>
      <p className="text-muted-foreground">Próximamente podrás registrar y administrar tus gastos desde aquí.</p>
    </div>
  );
}

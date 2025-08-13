import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

const formatCurrency = (n: number, currency: string) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n || 0);

export default function Historial() {
  const { state } = useAppStore();
  
  // Por ahora mostrar todos los gastos, en el futuro filtrar solo los completados
  const completedExpenses = state.expenses;

  return (
    <div className="space-y-6">
      <SEO title="Historial — Gestor de gastos" description="Historial de gastos completados." canonical="/historial" />
      <h1 className="text-2xl font-semibold">Historial de gastos</h1>
      
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Gastos completados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {completedExpenses.map((e) => {
            const bankName = state.banks.find((b) => b.id === e.bankId)?.name ?? "Sin banco";
            const dateLabel = new Date(e.date).toLocaleDateString("es-AR");
            const cuotasInfo = e.cuotas && e.cuotasCount ? ` • ${e.cuotasCount} cuotas` : "";
            const subscriptionInfo = e.isSubscription ? " (Suscripción)" : "";
            
            // Calcular fecha estimada de última cuota
            let lastPaymentDate = "";
            if (e.cuotas && e.cuotasCount && e.cuotasCount > 1) {
              const baseDate = new Date(e.date);
              baseDate.setMonth(baseDate.getMonth() + e.cuotasCount - 1);
              lastPaymentDate = ` • Última cuota: ${baseDate.toLocaleDateString("es-AR")}`;
            }
            
            return (
              <div key={e.id} className="flex items-center justify-between text-sm border-b pb-2">
                <div className="text-left">
                  <div className="font-medium">
                    {e.description}
                    <span className="text-muted-foreground">{subscriptionInfo}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {bankName}{e.card ? ` • ${e.card}` : ""} • {dateLabel}{cuotasInfo}{lastPaymentDate}
                  </div>
                </div>
                <div className="font-semibold">{formatCurrency(e.amount, "ARS")}</div>
              </div>
            );
          })}
          {completedExpenses.length === 0 && (
            <p className="text-muted-foreground">No hay gastos completados aún.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
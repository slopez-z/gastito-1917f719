import { useMemo, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/store/app-store";
import type { CardBrand } from "@/store/app-store";
import { Plus, Minus, ArrowUpDown } from "lucide-react";

const formatCurrency = (n: number, currency: string) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n || 0);

export default function Index() {
  const { state, addExpense } = useAppStore();
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bankId, setBankId] = useState<string>(state.banks[0]?.id ?? "");
  const [card, setCard] = useState<CardBrand>("Visa");
  const [cuotas, setCuotas] = useState(false);
  const [cuotasCount, setCuotasCount] = useState<number>(1);
  const [isSubscription, setIsSubscription] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  const totalMonth = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return state.expenses
      .filter((e) => e.date.startsWith(ym))
      .reduce((acc, e) => acc + e.amount, 0);
  }, [state.expenses]);

  const totalFixedExpenses = useMemo(() => {
    return state.fixedExpenses.alquiler + state.fixedExpenses.expensas + 
           state.fixedExpenses.internet + state.fixedExpenses.luz;
  }, [state.fixedExpenses]);

  const totalMonthlyExpenses = useMemo(() => {
    return totalMonth + totalFixedExpenses;
  }, [totalMonth, totalFixedExpenses]);

  const salaryUSD = useMemo(() => {
    if (!state.salary) return 0;
    return state.salary.amountUSD;
  }, [state.salary]);

  const salaryARS = useMemo(() => {
    if (!state.salary) return 0;
    return (state.salary.amountUSD * state.salary.rate) + state.salary.amountARS;
  }, [state.salary]);

  const finalSalary = useMemo(() => {
    return salaryARS - totalMonthlyExpenses;
  }, [salaryARS, totalMonthlyExpenses]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || !description || !date || !bankId || !card) return;
    const payload = {
      amount: amt,
      description,
      date,
      bankId,
      cuotas,
      card,
      cuotasCount: cuotas ? Math.max(1, Number(cuotasCount)) : undefined,
      isSubscription,
    };
    addExpense(payload);
    setAmount("");
    setDescription("");
    setCuotas(false);
    setCuotasCount(1);
    setIsSubscription(false);
  };

  return (
    <div className="space-y-8">
      <SEO title="Home — Gestor de gastos" description="Registra gastos y visualiza tu resumen mensual." canonical="/" />
      <h1 className="text-2xl font-semibold">Gestión de gastos y salario</h1>
      
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Salario Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(salaryARS, "ARS")}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatCurrency(salaryUSD * (state.salary?.rate || 0), "ARS")} + {formatCurrency(state.salary?.amountARS || 0, "ARS")}
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Gastos del mes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totalMonth, "ARS")}
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Gastos fijos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totalFixedExpenses, "ARS")}
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Salario final</CardTitle>
          </CardHeader>
          <CardContent className={`text-2xl font-semibold ${finalSalary < 0 ? 'text-destructive' : 'text-primary'}`}>
            {formatCurrency(finalSalary, "ARS")}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Agregar gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Monto (ARS)</Label>
                <Input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Restaurante, supermercado, etc." />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Banco</Label>
                <Select value={bankId} onValueChange={setBankId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.banks.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tarjeta</Label>
                <Select value={card} onValueChange={(v) => setCard(v as CardBrand)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tarjeta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="MasterCard">MasterCard</SelectItem>
                    <SelectItem value="American Express">American Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="cuotas" checked={cuotas} onCheckedChange={(v) => setCuotas(Boolean(v))} />
                <Label htmlFor="cuotas">¿En cuotas?</Label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="subscription" checked={isSubscription} onCheckedChange={(v) => setIsSubscription(Boolean(v))} />
                <Label htmlFor="subscription">¿Es suscripción?</Label>
              </div>
              {cuotas && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cuotasCount">Cantidad de cuotas</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCuotasCount(Math.max(1, cuotasCount - 1))}
                      disabled={cuotasCount <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="cuotasCount"
                      type="number"
                      min={1}
                      value={cuotasCount}
                      onChange={(e) => setCuotasCount(Math.max(1, Number(e.target.value || 1)))}
                      className="text-center w-20"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCuotasCount(cuotasCount + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="sm:col-span-2 flex gap-3 justify-center">
                <Button type="submit" variant="hero">Agregar gasto</Button>
                <Button variant="soft" asChild>
                  <a href="/salario">Configurar salario</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gastos recientes</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === "date" ? "amount" : "date")}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortBy === "date" ? "Por fecha" : "Por monto"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.expenses
              .sort((a, b) => {
                if (sortBy === "date") {
                  return new Date(b.date).getTime() - new Date(a.date).getTime();
                }
                return b.amount - a.amount;
              })
              .slice(0, 6)
              .map((e) => {
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
                <div key={e.id} className="flex items-center justify-between text-sm">
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
            {state.expenses.length === 0 && (
              <p className="text-muted-foreground">Aún no hay gastos.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
import { useMemo, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/store/app-store";

const formatCurrency = (n: number, currency: string) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n || 0);

export default function Index() {
  const { state, addExpense } = useAppStore();
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bankId, setBankId] = useState<string>(state.banks[0]?.id ?? "");
  const [cuotas, setCuotas] = useState(false);

  const totalMonth = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return state.expenses
      .filter((e) => e.date.startsWith(ym))
      .reduce((acc, e) => acc + e.amount, 0);
  }, [state.expenses]);

  const salaryARS = useMemo(() => {
    if (!state.salary) return 0;
    return state.salary.amountUSD * state.salary.rate;
  }, [state.salary]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || !description || !date || !bankId) return;
    addExpense({ amount: amt, description, date, bankId, cuotas });
    setAmount("");
    setDescription("");
    setCuotas(false);
  };

  return (
    <div className="space-y-8">
      <SEO title="Home — Gestor de gastos" description="Registra gastos y visualiza tu resumen mensual." canonical="/" />
      <h1 className="text-2xl font-semibold">Gestión de gastos y salario</h1>
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Salario estimado (ARS)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(salaryARS, "ARS")}
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
            <CardTitle>Bancos configurados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{state.banks.length}</CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3 items-start">
        <Card className="md:col-span-2 card-elevated">
          <CardHeader>
            <CardTitle>Agregar gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Monto (ARS)</Label>
                <Input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
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
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="cuotas" checked={cuotas} onCheckedChange={(v) => setCuotas(Boolean(v))} />
                <Label htmlFor="cuotas">¿En cuotas?</Label>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" variant="hero">Agregar gasto</Button>
                <Button variant="soft" asChild>
                  <a href="/salario">Configurar salario</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Gastos recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.expenses.slice(0, 6).map((e) => {
              const bank = state.banks.find((b) => b.id === e.bankId)?.name ?? "Sin banco";
              return (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <div className="text-left">
                    <div className="font-medium">{e.description}</div>
                    <div className="text-muted-foreground">{bank} • {new Date(e.date).toLocaleDateString()}</div>
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

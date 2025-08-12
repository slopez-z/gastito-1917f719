import { useEffect, useMemo, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";

const formatARS = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n || 0);

export default function Salario() {
  const { state, setSalary } = useAppStore();
  const [usd, setUsd] = useState<string>(state.salary?.amountUSD?.toString() ?? "");
  const [rate, setRate] = useState<string>(state.salary?.rate?.toString() ?? "");

  useEffect(() => {
    setUsd(state.salary?.amountUSD?.toString() ?? "");
    setRate(state.salary?.rate?.toString() ?? "");
  }, [state.salary]);

  const ars = useMemo(() => (parseFloat(usd) || 0) * (parseFloat(rate) || 0), [usd, rate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(usd);
    const r = parseFloat(rate);
    if (!a || !r) return;
    setSalary({ amountUSD: a, rate: r });
  };

  return (
    <div className="space-y-6">
      <SEO title="Salario — Gestor de gastos" description="Configura tu salario en USD y conviértelo a ARS con el dólar del día." canonical="/salario" />
      <h1 className="text-2xl font-semibold">Salario</h1>
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Configurar salario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="usd">Monto en USD</Label>
              <Input id="usd" type="number" min="0" step="0.01" value={usd} onChange={(e) => setUsd(e.target.value)} placeholder="0" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rate">Dólar del día</Label>
              <Input id="rate" type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0" />
            </div>
            <div className="sm:col-span-2">
              <Label>Estimación en ARS</Label>
              <div className="text-2xl font-semibold mt-1">{formatARS(ars)}</div>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="hero">Guardar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

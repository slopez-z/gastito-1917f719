import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";

const formatCurrency = (n: number, currency: string) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n || 0);

export default function Salario() {
  const { state, setSalary } = useAppStore();
  const [amountUSD, setAmountUSD] = useState(state.salary?.amountUSD?.toString() || "");
  const [amountARS, setAmountARS] = useState(state.salary?.amountARS?.toString() || "");
  const [rate, setRate] = useState(state.salary?.rate?.toString() || "");

  const totalSalaryARS = 
    (parseFloat(amountUSD) || 0) * (parseFloat(rate) || 0) + (parseFloat(amountARS) || 0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usd = parseFloat(amountUSD) || 0;
    const ars = parseFloat(amountARS) || 0;
    const exchangeRate = parseFloat(rate) || 0;
    
    if (usd <= 0 && ars <= 0) return;
    
    setSalary({ amountUSD: usd, amountARS: ars, rate: exchangeRate });
  };

  return (
    <div className="space-y-6">
      <SEO title="Salario — Gestor de gastos" description="Configura tu salario en USD y ARS." canonical="/salario" />
      <h1 className="text-2xl font-semibold">Configuración de salario</h1>
      
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Configurar salario mixto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amountUSD">Salario en USD</Label>
              <Input 
                id="amountUSD" 
                type="number" 
                min="0" 
                step="0.01" 
                value={amountUSD} 
                onChange={(e) => setAmountUSD(e.target.value)} 
                placeholder="0,00" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rate">Cotización del dólar</Label>
              <Input 
                id="rate" 
                type="number" 
                min="0" 
                step="0.01" 
                value={rate} 
                onChange={(e) => setRate(e.target.value)} 
                placeholder="0,00" 
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="amountARS">Salario en ARS</Label>
              <Input 
                id="amountARS" 
                type="number" 
                min="0" 
                step="0.01" 
                value={amountARS} 
                onChange={(e) => setAmountARS(e.target.value)} 
                placeholder="0,00" 
              />
            </div>
            <div className="sm:col-span-2 flex justify-center">
              <Button type="submit" variant="hero">Guardar salario</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Resumen salarial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span>Salario en USD:</span>
              <span className="font-medium">{formatCurrency(parseFloat(amountUSD) || 0, "USD")}</span>
            </div>
            <div className="flex justify-between">
              <span>Cotización del dólar:</span>
              <span className="font-medium">{formatCurrency(parseFloat(rate) || 0, "ARS")}</span>
            </div>
            <div className="flex justify-between">
              <span>USD convertido a ARS:</span>
              <span className="font-medium">{formatCurrency((parseFloat(amountUSD) || 0) * (parseFloat(rate) || 0), "ARS")}</span>
            </div>
            <div className="flex justify-between">
              <span>Salario directo en ARS:</span>
              <span className="font-medium">{formatCurrency(parseFloat(amountARS) || 0, "ARS")}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total salario (ARS):</span>
              <span>{formatCurrency(totalSalaryARS, "ARS")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
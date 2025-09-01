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
  const [amountUSD, setAmountUSD] = useState(state.salary?.amountUSD && state.salary.amountUSD > 0 ? state.salary.amountUSD.toString() : "");
  const [amountARS, setAmountARS] = useState(state.salary?.amountARS && state.salary.amountARS > 0 ? state.salary.amountARS.toString() : "");
  const [rate, setRate] = useState(state.salary?.rate && state.salary.rate > 0 ? state.salary.rate.toString() : "");

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
    <div className="space-y-8 animate-fade-in-up">
      <SEO title="Salario — Gestor de gastos" description="Configura tu salario en USD y ARS." canonical="/salario" />
      
      <div className="text-center space-y-2 animate-slide-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Configuración de salario
        </h1>
        <p className="text-muted-foreground">Define tu salario mixto en USD y ARS</p>
      </div>
      
      <Card className="card-modern animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <span className="text-2xl">💰</span>
            Configurar salario mixto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-3 group">
              <Label htmlFor="amountUSD" className="text-sm font-medium flex items-center gap-2">
                <span className="text-green-500">💵</span>
                Salario en USD
              </Label>
              <Input 
                id="amountUSD" 
                type="text" 
                inputMode="decimal" 
                value={amountUSD} 
                onChange={(e) => setAmountUSD(e.target.value)} 
                placeholder="0,00" 
                className="input-modern transition-all duration-300 group-hover:border-primary/30"
              />
            </div>
            <div className="flex flex-col gap-3 group">
              <Label htmlFor="rate" className="text-sm font-medium flex items-center gap-2">
                <span className="text-blue-500">📈</span>
                Cotización del dólar
              </Label>
              <Input 
                id="rate" 
                type="text" 
                inputMode="decimal" 
                value={rate} 
                onChange={(e) => setRate(e.target.value)} 
                placeholder="0,00" 
                className="input-modern transition-all duration-300 group-hover:border-primary/30"
              />
            </div>
            <div className="flex flex-col gap-3 sm:col-span-2 group">
              <Label htmlFor="amountARS" className="text-sm font-medium flex items-center gap-2">
                <span className="text-yellow-500">💸</span>
                Salario en ARS
              </Label>
              <Input 
                id="amountARS" 
                type="text" 
                inputMode="decimal" 
                value={amountARS} 
                onChange={(e) => setAmountARS(e.target.value)} 
                placeholder="0,00" 
                className="input-modern transition-all duration-300 group-hover:border-primary/30"
              />
            </div>
            <div className="sm:col-span-2 flex justify-center mt-4">
              <Button type="submit" variant="hero" className="btn-hero px-8 py-3 text-lg font-semibold">
                <span className="flex items-center gap-2">
                  <span>✨</span>
                  Guardar salario
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="card-modern animate-bounce-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">📊</span>
            Resumen salarial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 text-sm">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20">
              <span className="flex items-center gap-2">
                <span className="text-green-500">💵</span>
                Salario en USD:
              </span>
              <span className="font-semibold text-green-600">{formatCurrency(parseFloat(amountUSD) || 0, "USD")}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <span className="flex items-center gap-2">
                <span className="text-blue-500">📈</span>
                Cotización del dólar:
              </span>
              <span className="font-semibold text-blue-600">{formatCurrency(parseFloat(rate) || 0, "ARS")}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary-glow/5 border border-primary/20">
              <span className="flex items-center gap-2">
                <span className="text-primary">🔄</span>
                USD convertido a ARS:
              </span>
              <span className="font-semibold text-primary">{formatCurrency((parseFloat(amountUSD) || 0) * (parseFloat(rate) || 0), "ARS")}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
              <span className="flex items-center gap-2">
                <span className="text-yellow-500">💸</span>
                Salario directo en ARS:
              </span>
              <span className="font-semibold text-yellow-600">{formatCurrency(parseFloat(amountARS) || 0, "ARS")}</span>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-success/20 to-success-foreground/5 border-2 border-success/30 animate-pulse-glow">
                <span className="flex items-center gap-2 text-lg font-semibold">
                  <span className="text-2xl">🎯</span>
                  Total salario (ARS):
                </span>
                <span className="text-2xl font-bold text-success">{formatCurrency(totalSalaryARS, "ARS")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
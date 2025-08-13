import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";

const formatCurrency = (n: number, currency: string) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n || 0);

export default function Gastos() {
  const { state, setFixedExpenses } = useAppStore();
  const [alquiler, setAlquiler] = useState(state.fixedExpenses.alquiler.toString());
  const [expensas, setExpensas] = useState(state.fixedExpenses.expensas.toString());
  const [internet, setInternet] = useState(state.fixedExpenses.internet.toString());
  const [luz, setLuz] = useState(state.fixedExpenses.luz.toString());

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      alquiler: parseFloat(alquiler) || 0,
      expensas: parseFloat(expensas) || 0,
      internet: parseFloat(internet) || 0,
      luz: parseFloat(luz) || 0,
    };
    setFixedExpenses(payload);
  };

  const totalFixed = 
    (parseFloat(alquiler) || 0) + 
    (parseFloat(expensas) || 0) + 
    (parseFloat(internet) || 0) + 
    (parseFloat(luz) || 0);

  return (
    <div className="space-y-6">
      <SEO title="Gastos Fijos — Gestor de gastos" description="Configura tus gastos fijos mensuales." canonical="/gastos" />
      <h1 className="text-2xl font-semibold">Gastos Fijos</h1>
      
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Configurar gastos fijos mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="alquiler">Alquiler (ARS)</Label>
              <Input 
                id="alquiler" 
                type="number" 
                min="0" 
                step="0.01" 
                value={alquiler} 
                onChange={(e) => setAlquiler(e.target.value)} 
                placeholder="0,00" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expensas">Expensas (ARS)</Label>
              <Input 
                id="expensas" 
                type="number" 
                min="0" 
                step="0.01" 
                value={expensas} 
                onChange={(e) => setExpensas(e.target.value)} 
                placeholder="0,00" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="internet">Internet (ARS)</Label>
              <Input 
                id="internet" 
                type="number" 
                min="0" 
                step="0.01" 
                value={internet} 
                onChange={(e) => setInternet(e.target.value)} 
                placeholder="0,00" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="luz">Luz (ARS)</Label>
              <Input 
                id="luz" 
                type="number" 
                min="0" 
                step="0.01" 
                value={luz} 
                onChange={(e) => setLuz(e.target.value)} 
                placeholder="0,00" 
              />
            </div>
            <div className="sm:col-span-2 flex justify-center">
              <Button type="submit" variant="hero">Guardar gastos fijos</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Resumen de gastos fijos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span>Alquiler:</span>
              <span className="font-medium">{formatCurrency(parseFloat(alquiler) || 0, "ARS")}</span>
            </div>
            <div className="flex justify-between">
              <span>Expensas:</span>
              <span className="font-medium">{formatCurrency(parseFloat(expensas) || 0, "ARS")}</span>
            </div>
            <div className="flex justify-between">
              <span>Internet:</span>
              <span className="font-medium">{formatCurrency(parseFloat(internet) || 0, "ARS")}</span>
            </div>
            <div className="flex justify-between">
              <span>Luz:</span>
              <span className="font-medium">{formatCurrency(parseFloat(luz) || 0, "ARS")}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total mensual:</span>
              <span>{formatCurrency(totalFixed, "ARS")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

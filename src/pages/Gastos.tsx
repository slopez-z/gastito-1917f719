import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { Plus, Trash2 } from "lucide-react";
import { sanitizeFixedExpenseName, sanitizeNumber } from "@/lib/security";

const formatCurrency = (n: number, currency: string) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n || 0);

export default function Gastos() {
  const { state, setFixedExpenses } = useAppStore();
  const [alquiler, setAlquiler] = useState(state.fixedExpenses.alquiler > 0 ? state.fixedExpenses.alquiler.toString() : "");
  const [expensas, setExpensas] = useState(state.fixedExpenses.expensas > 0 ? state.fixedExpenses.expensas.toString() : "");
  const [internet, setInternet] = useState(state.fixedExpenses.internet > 0 ? state.fixedExpenses.internet.toString() : "");
  const [luz, setLuz] = useState(state.fixedExpenses.luz > 0 ? state.fixedExpenses.luz.toString() : "");
  const [customExpenses, setCustomExpenses] = useState<Array<{id: string, name: string, value: string}>>([]);

  const addCustomExpense = () => {
    setCustomExpenses([...customExpenses, { id: crypto.randomUUID(), name: "", value: "" }]);
  };

  const removeCustomExpense = (id: string) => {
    setCustomExpenses(customExpenses.filter(exp => exp.id !== id));
  };

  const updateCustomExpense = (id: string, field: 'name' | 'value', newValue: string) => {
    setCustomExpenses(customExpenses.map(exp => {
      if (exp.id === id) {
        if (field === 'name') {
          return { ...exp, [field]: sanitizeFixedExpenseName(newValue) };
        } else {
          return { ...exp, [field]: newValue }; // Value will be sanitized when saving
        }
      }
      return exp;
    }));
  };

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

  const totalCustom = customExpenses.reduce((sum, exp) => sum + (parseFloat(exp.value) || 0), 0);

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
              <Label htmlFor="alquiler">Alquiler</Label>
              <Input id="alquiler" type="text" inputMode="decimal" value={alquiler} onChange={(e) => setAlquiler(e.target.value)} placeholder="0,00" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expensas">Expensas</Label>
              <Input id="expensas" type="text" inputMode="decimal" value={expensas} onChange={(e) => setExpensas(e.target.value)} placeholder="0,00" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="internet">Internet</Label>
              <Input id="internet" type="text" inputMode="decimal" value={internet} onChange={(e) => setInternet(e.target.value)} placeholder="0,00" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="luz">Luz</Label>
              <Input id="luz" type="text" inputMode="decimal" value={luz} onChange={(e) => setLuz(e.target.value)} placeholder="0,00" />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-center">
              <Button type="submit" variant="hero">Guardar</Button>
              <Button type="button" variant="outline" onClick={addCustomExpense}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar gasto fijo personalizado
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {customExpenses.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Gastos personalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customExpenses.map((expense) => (
                <div key={expense.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`custom-name-${expense.id}`}>Nombre</Label>
                    <Input
                      id={`custom-name-${expense.id}`}
                      value={expense.name}
                      onChange={(e) => updateCustomExpense(expense.id, 'name', e.target.value)}
                      placeholder="Nombre del gasto"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`custom-value-${expense.id}`}>Monto</Label>
                    <Input id={`custom-value-${expense.id}`} type="text" inputMode="decimal" value={expense.value} onChange={(e) => updateCustomExpense(expense.id, 'value', e.target.value)} placeholder="0,00" />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeCustomExpense(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


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
            {customExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between">
                <span>{expense.name || "Gasto personalizado"}:</span>
                <span className="font-medium">{formatCurrency(parseFloat(expense.value) || 0, "ARS")}</span>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total mensual:</span>
              <span>{formatCurrency(totalFixed + totalCustom, "ARS")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

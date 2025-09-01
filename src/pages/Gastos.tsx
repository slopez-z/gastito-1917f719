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
    <div className="space-y-8 animate-fade-in-up">
      <SEO title="Gastos Fijos — Gestor de gastos" description="Configura tus gastos fijos mensuales." canonical="/gastos" />
      
      <div className="text-center space-y-2 animate-slide-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Gastos Fijos
        </h1>
        <p className="text-muted-foreground">Administra tus gastos fijos mensuales</p>
      </div>
      
      <Card className="card-modern animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <span className="text-2xl">⚙️</span>
            Configurar gastos fijos mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-3 group">
              <Label htmlFor="alquiler" className="text-sm font-medium flex items-center gap-2">
                <span className="text-blue-500">🏠</span>
                Alquiler
              </Label>
              <Input 
                id="alquiler" 
                type="text" 
                inputMode="decimal" 
                value={alquiler} 
                onChange={(e) => setAlquiler(e.target.value)} 
                placeholder="0,00" 
                className="input-modern transition-all duration-300 group-hover:border-primary/30"
              />
            </div>
            <div className="flex flex-col gap-3 group">
              <Label htmlFor="expensas" className="text-sm font-medium flex items-center gap-2">
                <span className="text-purple-500">🏢</span>
                Expensas
              </Label>
              <Input 
                id="expensas" 
                type="text" 
                inputMode="decimal" 
                value={expensas} 
                onChange={(e) => setExpensas(e.target.value)} 
                placeholder="0,00" 
                className="input-modern transition-all duration-300 group-hover:border-primary/30"
              />
            </div>
            <div className="flex flex-col gap-3 group">
              <Label htmlFor="internet" className="text-sm font-medium flex items-center gap-2">
                <span className="text-green-500">🌐</span>
                Internet
              </Label>
              <Input 
                id="internet" 
                type="text" 
                inputMode="decimal" 
                value={internet} 
                onChange={(e) => setInternet(e.target.value)} 
                placeholder="0,00" 
                className="input-modern transition-all duration-300 group-hover:border-primary/30"
              />
            </div>
            <div className="flex flex-col gap-3 group">
              <Label htmlFor="luz" className="text-sm font-medium flex items-center gap-2">
                <span className="text-yellow-500">⚡</span>
                Luz
              </Label>
              <Input 
                id="luz" 
                type="text" 
                inputMode="decimal" 
                value={luz} 
                onChange={(e) => setLuz(e.target.value)} 
                placeholder="0,00" 
                className="input-modern transition-all duration-300 group-hover:border-primary/30"
              />
            </div>
            <div className="sm:col-span-2 flex gap-4 justify-center mt-4">
              <Button type="submit" variant="hero" className="btn-hero px-6 py-3 font-semibold">
                <span className="flex items-center gap-2">
                  <span>✨</span>
                  Guardar
                </span>
              </Button>
              <Button type="button" variant="outline" className="btn-soft px-6 py-3" onClick={addCustomExpense}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar gasto personalizado
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {customExpenses.length > 0 && (
        <Card className="card-modern animate-bounce-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">🎯</span>
              Gastos personalizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customExpenses.map((expense, index) => (
                <div key={expense.id} className="flex gap-3 items-end p-4 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border border-border/50 animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex-1 group">
                    <Label htmlFor={`custom-name-${expense.id}`} className="text-sm font-medium flex items-center gap-2">
                      <span className="text-orange-500">📝</span>
                      Nombre
                    </Label>
                    <Input
                      id={`custom-name-${expense.id}`}
                      value={expense.name}
                      onChange={(e) => updateCustomExpense(expense.id, 'name', e.target.value)}
                      placeholder="Nombre del gasto"
                      className="input-modern mt-2 transition-all duration-300 group-hover:border-primary/30"
                    />
                  </div>
                  <div className="flex-1 group">
                    <Label htmlFor={`custom-value-${expense.id}`} className="text-sm font-medium flex items-center gap-2">
                      <span className="text-red-500">💰</span>
                      Monto
                    </Label>
                    <Input 
                      id={`custom-value-${expense.id}`} 
                      type="text" 
                      inputMode="decimal" 
                      value={expense.value} 
                      onChange={(e) => updateCustomExpense(expense.id, 'value', e.target.value)} 
                      placeholder="0,00" 
                      className="input-modern mt-2 transition-all duration-300 group-hover:border-primary/30"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeCustomExpense(expense.id)}
                    className="hover:scale-110 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="card-modern animate-bounce-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">📊</span>
            Resumen de gastos fijos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 text-sm">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <span className="flex items-center gap-2">
                <span className="text-blue-500">🏠</span>
                Alquiler:
              </span>
              <span className="font-semibold text-blue-600">{formatCurrency(parseFloat(alquiler) || 0, "ARS")}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <span className="flex items-center gap-2">
                <span className="text-purple-500">🏢</span>
                Expensas:
              </span>
              <span className="font-semibold text-purple-600">{formatCurrency(parseFloat(expensas) || 0, "ARS")}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20">
              <span className="flex items-center gap-2">
                <span className="text-green-500">🌐</span>
                Internet:
              </span>
              <span className="font-semibold text-green-600">{formatCurrency(parseFloat(internet) || 0, "ARS")}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
              <span className="flex items-center gap-2">
                <span className="text-yellow-500">⚡</span>
                Luz:
              </span>
              <span className="font-semibold text-yellow-600">{formatCurrency(parseFloat(luz) || 0, "ARS")}</span>
            </div>
            {customExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20">
                <span className="flex items-center gap-2">
                  <span className="text-orange-500">🎯</span>
                  {expense.name || "Gasto personalizado"}:
                </span>
                <span className="font-semibold text-orange-600">{formatCurrency(parseFloat(expense.value) || 0, "ARS")}</span>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary-glow/5 border-2 border-primary/30 animate-pulse-glow">
                <span className="flex items-center gap-2 text-lg font-semibold">
                  <span className="text-2xl">💸</span>
                  Total mensual:
                </span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(totalFixed + totalCustom, "ARS")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

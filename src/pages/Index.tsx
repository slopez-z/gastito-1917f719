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

  const clearForm = () => {
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setBankId(state.banks[0]?.id ?? "");
    setCard("Visa");
    setCuotas(false);
    setCuotasCount(1);
    setIsSubscription(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <SEO title="Home — Gestor de gastos" description="Registra gastos y visualiza tu resumen mensual." canonical="/" />
      
      <div className="text-center space-y-2 animate-slide-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
          📊 Resumen Financiero
        </h1>
        <p className="text-lg text-muted-foreground">Controla tus finanzas de manera inteligente</p>
      </div>
      
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="card-modern animate-scale-in group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-lg">
              <span className="text-3xl">💰</span>
              <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                Salario Total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {state.salary && (salaryUSD > 0 || state.salary.amountARS > 0) ? (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-success">{formatCurrency(salaryARS, "ARS")}</div>
                <div className="text-sm text-muted-foreground p-2 rounded-lg bg-success/5 border border-success/20">
                  💵 {formatCurrency(salaryUSD, "USD")} + 💸 {formatCurrency(state.salary?.amountARS || 0, "ARS")}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xl font-semibold text-muted-foreground">No configurado</div>
                <Button variant="soft" asChild size="sm" className="btn-soft">
                  <a href="/salario">Configurar salario</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern animate-scale-in group hover:shadow-lg hover:border-primary/30 transition-all duration-300" style={{animationDelay: '0.1s'}}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-lg">
              <span className="text-3xl">💳</span>
              <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                Gastos Totales
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-destructive">
                {formatCurrency(totalMonthlyExpenses, "ARS")}
              </div>
              <div className="space-y-1">
                <div className="text-sm p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-yellow-600">
                  📈 Variables: {formatCurrency(totalMonth, "ARS")}
                </div>
                <div className="text-sm p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 text-blue-600">
                  🏠 Fijos: {formatCurrency(totalFixedExpenses, "ARS")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern animate-scale-in group hover:shadow-lg hover:border-primary/30 transition-all duration-300" style={{animationDelay: '0.2s'}}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-lg">
              <span className="text-3xl">🎯</span>
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Salario Final
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {state.salary && (salaryUSD > 0 || state.salary.amountARS > 0) ? (
              <div className="space-y-2">
                <div className={`text-3xl font-bold transition-colors duration-300 ${
                  finalSalary < 0 
                    ? 'text-destructive animate-pulse' 
                    : 'text-success'
                }`}>
                  {formatCurrency(finalSalary, "ARS")}
                </div>
                <div className={`text-sm px-3 py-2 rounded-full font-medium ${
                  finalSalary < 0 
                    ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                    : 'bg-success/10 text-success border border-success/20'
                }`}>
                  {finalSalary < 0 ? '⚠️ En números rojos' : '✅ Todo en orden'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xl font-semibold text-muted-foreground">Sin datos</div>
                <div className="text-sm text-muted-foreground">Configurá tu salario primero</div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <Card className="card-modern animate-bounce-in">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-xl">
              <span className="text-2xl">➕</span>
              Agregar gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-3 group">
                <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                  <span className="text-green-500">💰</span>
                  Monto
                </Label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  placeholder="0,00" 
                  className="input-modern transition-all duration-300 group-hover:border-primary/30"
                />
              </div>
              <div className="flex flex-col gap-3 group">
                <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                  <span className="text-blue-500">📅</span>
                  Fecha
                </Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="input-modern transition-all duration-300 group-hover:border-primary/30"
                />
              </div>
              <div className="flex flex-col gap-3 sm:col-span-2 group">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                  <span className="text-purple-500">📝</span>
                  Descripción
                </Label>
                <Input 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Restaurante, supermercado, etc." 
                  className="input-modern transition-all duration-300 group-hover:border-primary/30"
                />
              </div>
              <div className="flex flex-col gap-3 group">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-orange-500">🏦</span>
                  Banco
                </Label>
                <Select value={bankId} onValueChange={setBankId}>
                  <SelectTrigger className="input-modern transition-all duration-300 group-hover:border-primary/30">
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
              <div className="flex flex-col gap-3 group">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-pink-500">💳</span>
                  Tarjeta
                </Label>
                <Select value={card} onValueChange={(v) => setCard(v as CardBrand)}>
                  <SelectTrigger className="input-modern transition-all duration-300 group-hover:border-primary/30">
                    <SelectValue placeholder="Selecciona una tarjeta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="MasterCard">MasterCard</SelectItem>
                    <SelectItem value="American Express">American Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:col-span-2 space-y-4">
                <div className="flex items-center gap-6 flex-wrap p-4 rounded-lg bg-gradient-to-r from-muted/30 to-transparent border border-border/50">
                  <div className="flex items-center gap-3">
                    <Checkbox id="cuotas" checked={cuotas} onCheckedChange={(v) => setCuotas(Boolean(v))} />
                    <Label htmlFor="cuotas" className="flex items-center gap-2 font-medium">
                      <span className="text-yellow-500">🔢</span>
                      ¿En cuotas?
                    </Label>
                  </div>
                  {cuotas && (
                    <div className="flex items-center gap-3 animate-slide-in">
                      <Label htmlFor="cuotasCount" className="text-sm font-medium">Cantidad:</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setCuotasCount(Math.max(1, cuotasCount - 1))}
                          disabled={cuotasCount <= 1}
                          className="h-8 w-8 hover:scale-110 transition-transform"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          id="cuotasCount"
                          type="number"
                          min={1}
                          value={cuotasCount}
                          readOnly
                          className="text-center w-16 h-8 input-modern"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setCuotasCount(cuotasCount + 1)}
                          className="h-8 w-8 hover:scale-110 transition-transform"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-muted/30 to-transparent border border-border/50">
                  <Checkbox id="subscription" checked={isSubscription} onCheckedChange={(v) => setIsSubscription(Boolean(v))} />
                  <Label htmlFor="subscription" className="flex items-center gap-2 font-medium">
                    <span className="text-red-500">🔄</span>
                    ¿Es suscripción?
                  </Label>
                </div>
              </div>
              
              <div className="sm:col-span-2 flex gap-4 justify-center mt-6">
                <Button type="submit" variant="hero" className="btn-hero px-8 py-3 text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    Agregar gasto
                  </span>
                </Button>
                <Button type="button" variant="outline" className="btn-soft px-6 py-3" onClick={clearForm}>
                  🗑️ Limpiar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="card-modern animate-bounce-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="text-2xl">📋</span>
              Gastos recientes
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === "date" ? "amount" : "date")}
              className="btn-soft hover:scale-105 transition-transform"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortBy === "date" ? "Por fecha" : "Por monto"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.expenses
              .sort((a, b) => {
                if (sortBy === "date") {
                  return new Date(b.date).getTime() - new Date(a.date).getTime();
                }
                return b.amount - a.amount;
              })
              .slice(0, 6)
              .map((e, index) => {
              const bankName = state.banks.find((b) => b.id === e.bankId)?.name ?? "Sin banco";
              const dateLabel = new Date(e.date).toLocaleDateString("es-AR");
              // Calcular monto de cuota individual
              const installmentAmount = e.cuotas && e.cuotasCount ? e.amount / e.cuotasCount : e.amount;
              const cuotasInfo = e.cuotas && e.cuotasCount ? ` • ${e.cuotasCount} cuotas` : "";
              const subscriptionInfo = e.isSubscription ? " 🔄" : "";
              
              // Calcular fecha estimada de última cuota
              let lastPaymentDate = "";
              if (e.cuotas && e.cuotasCount && e.cuotasCount > 1) {
                const baseDate = new Date(e.date);
                baseDate.setMonth(baseDate.getMonth() + e.cuotasCount - 1);
                lastPaymentDate = ` • Última cuota: ${baseDate.toLocaleDateString("es-AR")}`;
              }
              
              return (
                <div 
                  key={e.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-card/50 to-transparent border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-in" 
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="text-left space-y-1">
                    <div className="font-semibold flex items-center gap-2">
                      <span className="text-primary">💸</span>
                      {e.description}
                      <span className="text-sm">{subscriptionInfo}</span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-blue-500">🏦</span>
                      {bankName}{e.card ? ` • ${e.card}` : ""} • 📅 {dateLabel}{cuotasInfo}{lastPaymentDate}
                    </div>
                    {e.cuotas && e.cuotasCount && (
                      <div className="text-xs text-muted-foreground/80 flex items-center gap-1">
                        <span className="text-orange-500">💰</span>
                        Total: {formatCurrency(e.amount, "ARS")}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-destructive">
                      {formatCurrency(installmentAmount, "ARS")}
                    </div>
                    {e.cuotas && e.cuotasCount && (
                      <div className="text-xs text-muted-foreground">
                        por cuota
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {state.expenses.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <div className="text-6xl">📝</div>
                <p className="text-lg font-medium text-muted-foreground">Aún no hay gastos registrados</p>
                <p className="text-sm text-muted-foreground">¡Agrega tu primer gasto usando el formulario de arriba!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
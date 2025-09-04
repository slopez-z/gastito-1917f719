import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAppStore } from "@/store/app-store";
import type { CardBrand, Expense } from "@/store/app-store";
import { Edit, Trash2 } from "lucide-react";

const formatCurrency = (n: number, currency: string) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n || 0);

export default function Historial() {
  const { state, editExpense, removeExpense } = useAppStore();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [bankId, setBankId] = useState<string>("");
  const [card, setCard] = useState<CardBrand>("Visa");
  const [cuotas, setCuotas] = useState(false);
  const [cuotasCount, setCuotasCount] = useState<number>(1);
  const [isSubscription, setIsSubscription] = useState(false);
  
  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setDate(expense.date);
    setBankId(expense.bankId);
    setCard(expense.card);
    setCuotas(expense.cuotas);
    setCuotasCount(expense.cuotasCount || 1);
    setIsSubscription(expense.isSubscription);
  };

  const handleSaveEdit = () => {
    if (!editingExpense) return;
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

    editExpense(editingExpense.id, payload);
    setEditingExpense(null);
  };

  const handleDelete = (expenseId: string) => {
    removeExpense(expenseId);
  };
  
  // Por ahora mostrar todos los gastos, en el futuro filtrar solo los completados
  const completedExpenses = state.expenses;

  return (
    <div className="space-y-6">
      <SEO title="Historial — Gestor de gastos" description="Historial de gastos completados." canonical="/historial" />
      
      <div className="text-center space-y-2 animate-slide-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
          📜 Historial de Gastos
        </h1>
        <p className="text-lg text-muted-foreground">Gestiona y edita tus gastos anteriores</p>
      </div>
      
      <Card className="card-modern animate-bounce-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <span className="text-2xl">📋</span>
            Gastos completados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {completedExpenses.map((e, index) => {
            const bankName = state.banks.find((b) => b.id === e.bankId)?.name ?? "Sin banco";
            const dateLabel = new Date(e.date).toLocaleDateString("es-AR");
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
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-card/50 to-transparent border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg animate-slide-in" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-left flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    <span className="text-primary">💸</span>
                    {e.description}
                    <span className="text-sm">{subscriptionInfo}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-blue-500">🏦</span>
                    {bankName}{e.card ? ` • ${e.card}` : ""} • 📅 {dateLabel}{cuotasInfo}{lastPaymentDate}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg text-destructive">
                      {formatCurrency(e.amount, "ARS")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(e)}
                          className="hover:bg-primary/10 hover:border-primary transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Editar gasto</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="edit-amount">Monto</Label>
                            <Input
                              id="edit-amount"
                              type="number"
                              min="0"
                              step="0.01"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="edit-description">Descripción</Label>
                            <Input
                              id="edit-description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="edit-date">Fecha</Label>
                            <Input
                              id="edit-date"
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label>Banco</Label>
                            <Select value={bankId} onValueChange={setBankId}>
                              <SelectTrigger>
                                <SelectValue />
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
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Visa">Visa</SelectItem>
                                <SelectItem value="MasterCard">MasterCard</SelectItem>
                                <SelectItem value="American Express">American Express</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id="edit-cuotas" 
                                checked={cuotas} 
                                onCheckedChange={(v) => setCuotas(Boolean(v))} 
                              />
                              <Label htmlFor="edit-cuotas">¿En cuotas?</Label>
                            </div>
                            {cuotas && (
                              <div className="flex items-center gap-2">
                                <Label htmlFor="edit-cuotasCount">Cantidad:</Label>
                                <Input
                                  id="edit-cuotasCount"
                                  type="number"
                                  min={1}
                                  value={cuotasCount}
                                  onChange={(e) => setCuotasCount(parseInt(e.target.value))}
                                  className="w-20"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id="edit-subscription" 
                              checked={isSubscription} 
                              onCheckedChange={(v) => setIsSubscription(Boolean(v))} 
                            />
                            <Label htmlFor="edit-subscription">¿Es suscripción?</Label>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditingExpense(null)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveEdit}>
                            Guardar cambios
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-destructive/10 hover:border-destructive transition-colors text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el gasto "{e.description}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(e.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
          {completedExpenses.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <div className="text-6xl">📝</div>
              <p className="text-lg font-medium text-muted-foreground">No hay gastos completados aún</p>
              <p className="text-sm text-muted-foreground">Los gastos aparecerán aquí una vez que los agregues</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
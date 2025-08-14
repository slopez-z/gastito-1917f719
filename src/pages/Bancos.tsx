import { useState, useRef, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { Landmark, Plus, Pencil, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function Bancos() {
  const { state, addBank, editBank, removeBank } = useAppStore();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditingName(current);
  };

  const bankExpenses = useMemo(() => {
    const expensesByBank = state.expenses.reduce((acc, expense) => {
      const bankName = state.banks.find(b => b.id === expense.bankId)?.name || "Sin banco";
      acc[bankName] = (acc[bankName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(expensesByBank).map(([name, value]) => ({
      name,
      value,
    }));
  }, [state.expenses, state.banks]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n || 0);

  return (
    <div className="space-y-6">
      <SEO title="Bancos — Gestor de gastos" description="Agrega, edita o elimina bancos para asociar tus gastos." canonical="/bancos" />
      <h1 className="text-2xl font-semibold">Administración de Bancos</h1>
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Agregar Nuevo Banco</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addBank(name);
              setName("");
            }}
            className="flex gap-3"
          >
            <div className="flex-1">
              <Label htmlFor="bank">Nombre</Label>
              <Input id="bank" ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del banco" />
            </div>
            <div className="flex gap-2 justify-center">
              <Button type="submit" variant="hero"><Plus className="mr-1" />Agregar</Button>
              <Button type="button" variant="destructive" onClick={() => setName("")}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Lista de Bancos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.banks.map((b) => (
            <div key={b.id} className="flex items-center gap-3">
              {editingId === b.id ? (
                <>
                  <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                  <Button variant="soft" onClick={() => { editBank(b.id, editingName); setEditingId(null); }}>Guardar</Button>
                  <Button variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                </>
              ) : (
                <>
                  <div className="flex-1 flex items-center gap-2"><Landmark className="h-4 w-4 text-muted-foreground" /> {b.name}</div>
                  <Button variant="soft" size="icon" aria-label="Editar" onClick={() => startEdit(b.id, b.name)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" aria-label="Eliminar" onClick={() => {
                    if (confirm("¿Eliminar banco? Se eliminarán gastos asociados.")) removeBank(b.id);
                  }}><Trash2 className="h-4 w-4" /></Button>
                </>
              )}
            </div>
          ))}
          {state.banks.length === 0 && (
            <p className="text-muted-foreground">No hay bancos agregados aún.</p>
          )}
        </CardContent>
      </Card>

      {bankExpenses.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Desglose por bancos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bankExpenses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bankExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

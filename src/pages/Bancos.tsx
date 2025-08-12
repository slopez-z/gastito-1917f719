import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";

export default function Bancos() {
  const { state, addBank, editBank, removeBank } = useAppStore();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditingName(current);
  };

  return (
    <div className="space-y-6">
      <SEO title="Bancos — Gestor de gastos" description="Agrega, edita o elimina bancos para asociar tus gastos." canonical="/bancos" />
      <h1 className="text-2xl font-semibold">Bancos</h1>
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Agregar banco</CardTitle>
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
              <Input id="bank" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Banco Nación" />
            </div>
            <Button type="submit" variant="hero">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Listado de bancos</CardTitle>
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
                  <div className="flex-1">{b.name}</div>
                  <Button variant="soft" onClick={() => startEdit(b.id, b.name)}>Editar</Button>
                  <Button variant="destructive" onClick={() => {
                    if (confirm("¿Eliminar banco? Se eliminarán gastos asociados.")) removeBank(b.id);
                  }}>Eliminar</Button>
                </>
              )}
            </div>
          ))}
          {state.banks.length === 0 && (
            <p className="text-muted-foreground">No hay bancos agregados aún.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

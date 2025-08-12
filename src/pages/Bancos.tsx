import { useState, useRef } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { Landmark, Plus, Pencil, Trash2 } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <SEO title="Bancos — Gestor de gastos" description="Agrega, edita o elimina bancos para asociar tus gastos." canonical="/bancos" />
      <h1 className="text-2xl font-semibold">Administración de Bancos</h1>
      <div>
        <Button variant="hero" onClick={() => inputRef.current?.focus()}>
          <Plus className="h-4 w-4" /> Agregar Banco
        </Button>
      </div>
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
            <div className="flex gap-2">
              <Button type="submit" variant="hero"><Plus className="mr-1" />Agregar</Button>
              <Button type="button" variant="ghost" onClick={() => setName("")}>Cancelar</Button>
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
    </div>
  );
}

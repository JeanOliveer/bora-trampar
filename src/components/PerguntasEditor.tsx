import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export type PerguntaTipo = "texto_curto" | "texto_longo" | "multipla_escolha";

export type PerguntaDraft = {
  texto: string;
  tipo: PerguntaTipo;
  opcoes: string[];
  obrigatoria: boolean;
};

type Props = {
  perguntas: PerguntaDraft[];
  onChange: (p: PerguntaDraft[]) => void;
};

const empty: PerguntaDraft = { texto: "", tipo: "texto_curto", opcoes: [], obrigatoria: true };

const PerguntasEditor = ({ perguntas, onChange }: Props) => {
  const [draft, setDraft] = useState<PerguntaDraft>(empty);
  const [opcoesText, setOpcoesText] = useState("");

  const addPergunta = () => {
    if (!draft.texto.trim()) return;
    const opcoes =
      draft.tipo === "multipla_escolha"
        ? opcoesText.split("\n").map((s) => s.trim()).filter(Boolean)
        : [];
    if (draft.tipo === "multipla_escolha" && opcoes.length < 2) return;
    onChange([...perguntas, { ...draft, texto: draft.texto.trim(), opcoes }]);
    setDraft(empty);
    setOpcoesText("");
  };

  const remove = (i: number) => onChange(perguntas.filter((_, idx) => idx !== i));

  const updateExisting = (i: number, patch: Partial<PerguntaDraft>) => {
    onChange(perguntas.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };

  return (
    <div className="space-y-4">
      {perguntas.length > 0 && (
        <div className="space-y-2">
          {perguntas.map((p, i) => (
            <Card key={i} className="border-dashed">
              <CardContent className="flex items-start gap-3 p-3">
                <GripVertical className="mt-1 h-4 w-4 text-muted-foreground" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={p.texto}
                    onChange={(e) => updateExisting(i, { texto: e.target.value })}
                    className="text-sm"
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-muted px-2 py-0.5">
                      {p.tipo === "texto_curto" ? "Texto curto" : p.tipo === "texto_longo" ? "Texto longo" : "Múltipla escolha"}
                    </span>
                    {p.obrigatoria && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Obrigatória</span>}
                    {p.tipo === "multipla_escolha" && (
                      <span className="text-muted-foreground">{p.opcoes.length} opções</span>
                    )}
                  </div>
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="space-y-2">
            <Label className="text-xs">Nova pergunta</Label>
            <Input
              placeholder="Ex.: Você tem experiência com mudanças?"
              value={draft.texto}
              onChange={(e) => setDraft({ ...draft, texto: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={draft.tipo}
                onValueChange={(v) => setDraft({ ...draft, tipo: v as PerguntaTipo })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="texto_curto">Texto curto</SelectItem>
                  <SelectItem value="texto_longo">Texto longo</SelectItem>
                  <SelectItem value="multipla_escolha">Múltipla escolha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={draft.obrigatoria}
                  onCheckedChange={(c) => setDraft({ ...draft, obrigatoria: c })}
                />
                <Label className="text-xs">Obrigatória</Label>
              </div>
            </div>
          </div>
          {draft.tipo === "multipla_escolha" && (
            <div className="space-y-2">
              <Label className="text-xs">Opções (uma por linha)</Label>
              <Textarea
                rows={3}
                value={opcoesText}
                onChange={(e) => setOpcoesText(e.target.value)}
                placeholder={"Sim\nNão\nTalvez"}
              />
            </div>
          )}
          <Button type="button" onClick={addPergunta} className="w-full" variant="secondary">
            <Plus className="mr-2 h-4 w-4" /> Adicionar pergunta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerguntasEditor;

import { useMemo, useState } from "react";
import { Search, MapPinCheck, Clock, CheckCircle2, AlertTriangle, FileCheck2, Star, Briefcase, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RankedAvatar from "@/components/RankedAvatar";
import { getNivel } from "@/lib/career";
import { cn } from "@/lib/utils";

export type ChegadaCandidato = {
  candidatura_id: string;
  nome_completo: string | null;
  pontuacao: number;
  aprovada_pela_empresa: boolean;
  checkin_em: string | null;
  presenca_confirmada_em: string | null;
  estrelas?: number | null;
  documento_verificado?: boolean;
};

export type ChegadaStatus =
  | "aguardando"
  | "cheguei"
  | "confirmada"
  | "em_servico"
  | "finalizado"
  | "ausente";

const statusMeta: Record<ChegadaStatus, { label: string; className: string; icon: React.ElementType }> = {
  aguardando:   { label: "Aguardando chegada",   className: "bg-muted text-muted-foreground",            icon: Clock },
  cheguei:      { label: "Cheguei - aguardando", className: "bg-amber-500 text-white hover:bg-amber-600", icon: AlertTriangle },
  confirmada:   { label: "Presença confirmada",  className: "bg-emerald-600 text-white hover:bg-emerald-700", icon: MapPinCheck },
  em_servico:   { label: "Em serviço",           className: "bg-primary text-primary-foreground",        icon: Briefcase },
  finalizado:   { label: "Finalizado",           className: "bg-slate-700 text-white hover:bg-slate-800", icon: CheckCircle2 },
  ausente:      { label: "Ausente",              className: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
};

export const computarStatus = (c: ChegadaCandidato): ChegadaStatus => {
  if (c.estrelas != null) return "finalizado";
  if (c.presenca_confirmada_em) return "em_servico";
  if (c.checkin_em) return "cheguei";
  return "aguardando";
};

type Props = {
  candidatos: ChegadaCandidato[];
  servicoTitulo: string;
  empresaNome: string | null;
  horario: string | null;
  onConfirmarChegada: (c: ChegadaCandidato) => void;
};

const ControleChegada = ({ candidatos, servicoTitulo, empresaNome, horario, onConfirmarChegada }: Props) => {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<ChegadaStatus | "todos">("todos");

  // Apenas trabalhadores esperados (aprovados pela empresa)
  const esperados = useMemo(
    () => candidatos.filter((c) => c.aprovada_pela_empresa).map((c) => ({ ...c, status: computarStatus(c) })),
    [candidatos]
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return esperados.filter((c) => {
      if (filtro !== "todos" && c.status !== filtro) return false;
      if (q && !(c.nome_completo ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [esperados, busca, filtro]);

  const total = esperados.length;
  const confirmados = esperados.filter((c) => c.presenca_confirmada_em).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPinCheck className="h-5 w-5 text-primary" /> Controle de Chegada
            </CardTitle>
            <CardDescription>
              Confirme presencialmente a chegada dos trabalhadores esperados para o serviço.
            </CardDescription>
          </div>
          <div className="rounded-lg border bg-primary/5 px-4 py-2 text-center">
            <div className="text-2xl font-bold leading-none text-primary">
              {confirmados} <span className="text-muted-foreground">/ {total}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">confirmados</div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar trabalhador pelo nome..."
              className="pl-9"
            />
          </div>
          <Select value={filtro} onValueChange={(v) => setFiltro(v as ChegadaStatus | "todos")}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="aguardando">Aguardando chegada</SelectItem>
              <SelectItem value="cheguei">Cheguei - aguardando</SelectItem>
              <SelectItem value="confirmada">Presença confirmada</SelectItem>
              <SelectItem value="em_servico">Em serviço</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
              <SelectItem value="ausente">Ausente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum trabalhador aprovado ainda. Aprove candidatos para acompanhar a chegada aqui.
          </p>
        ) : filtrados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum trabalhador corresponde ao filtro.</p>
        ) : (
          filtrados.map((c) => {
            const status = c.status;
            const meta = statusMeta[status];
            const Icon = meta.icon;
            const nivel = getNivel(c.pontuacao);
            const podeConfirmar = status === "cheguei";
            const docOk = c.documento_verificado ?? true; // após aprovação, doc é verificado

            return (
              <div
                key={c.candidatura_id}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  status === "cheguei" && "border-amber-400/60 bg-amber-50/50 dark:bg-amber-950/10",
                  status === "confirmada" && "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/10",
                  status === "finalizado" && "border-muted bg-muted/30"
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <RankedAvatar nome={c.nome_completo} pontuacao={c.pontuacao} size="lg" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold truncate">{c.nome_completo ?? "Sem nome"}</span>
                        <Badge className={meta.className}>
                          <Icon className="mr-1 h-3 w-3" /> {meta.label}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="h-3 w-3" /> {servicoTitulo}
                        </span>
                        {horario && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {horario}
                          </span>
                        )}
                        {empresaNome && (
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {empresaNome}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className={nivel.badgeClass}>{nivel.label}</Badge>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {c.pontuacao} pts
                        </span>
                        {docOk && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <FileCheck2 className="h-3 w-3" /> Documento verificado
                          </span>
                        )}
                        {c.checkin_em && (
                          <span className="text-muted-foreground">
                            Chegou às {new Date(c.checkin_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                        {c.presenca_confirmada_em && (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            Confirmado às {new Date(c.presenca_confirmada_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {podeConfirmar ? (
                      <Button size="sm" onClick={() => onConfirmarChegada(c)}>
                        <MapPinCheck className="mr-1 h-4 w-4" /> Confirmar chegada
                      </Button>
                    ) : status === "aguardando" ? (
                      <Button size="sm" variant="outline" disabled>
                        Aguardando "Cheguei"
                      </Button>
                    ) : status === "confirmada" ? (
                      <Badge className="bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Presença OK
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ControleChegada;

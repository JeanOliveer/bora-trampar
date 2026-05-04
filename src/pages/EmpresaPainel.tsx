import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Briefcase, Calendar, MapPin, Users, Star, CheckCircle2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import RankedAvatar from "@/components/RankedAvatar";
import { getNivel } from "@/lib/career";
import { cn } from "@/lib/utils";

type Servico = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  valor: number | null;
  cidade: string | null;
  estado: string | null;
  data_servico: string | null;
  horario: string | null;
  empresa_nome: string | null;
  empresa_token: string;
  empresa_pontuacao: number;
  empresa_total_avaliacoes: number;
};

type Candidato = {
  candidatura_id: string;
  user_id: string;
  telefone: string;
  cidade: string;
  bairro: string;
  status: string;
  aprovada_pela_empresa: boolean;
  nome_completo: string | null;
  pontuacao: number;
  avaliacao_id?: string | null;
  estrelas?: number | null;
  justificativa?: string | null;
};

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrelas`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="rounded p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "h-9 w-9 transition-colors",
                active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

const EmpresaPainel = () => {
  const { token } = useParams<{ token: string }>();
  const [servico, setServico] = useState<Servico | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAval, setOpenAval] = useState(false);
  const [alvo, setAlvo] = useState<Candidato | null>(null);
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [saving, setSaving] = useState(false);
  const [recontratando, setRecontratando] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    const { data: srv, error } = await supabase
      .from("servicos")
      .select("*")
      .eq("empresa_token", token)
      .maybeSingle();
    if (error || !srv) {
      setLoading(false);
      return;
    }
    setServico(srv as Servico);

    const { data: cands } = await supabase
      .from("candidaturas")
      .select("id, user_id, telefone, cidade, bairro, status, aprovada_pela_empresa")
      .eq("servico_id", (srv as Servico).id)
      .order("created_at", { ascending: false });

    const list = (cands as Array<{
      id: string; user_id: string; telefone: string; cidade: string; bairro: string;
      status: string; aprovada_pela_empresa: boolean;
    }> | null) ?? [];

    if (list.length === 0) {
      setCandidatos([]);
      setLoading(false);
      return;
    }

    const userIds = list.map((c) => c.user_id);
    const candIds = list.map((c) => c.id);
    const [{ data: profs }, { data: avals }] = await Promise.all([
      supabase.from("profiles").select("user_id, nome_completo, pontuacao").in("user_id", userIds),
      supabase
        .from("avaliacoes")
        .select("id, candidatura_id, estrelas, justificativa, tipo")
        .in("candidatura_id", candIds)
        .eq("tipo", "empresa_para_trabalhador"),
    ]);
    const profMap = new Map((profs as Array<{ user_id: string; nome_completo: string | null; pontuacao: number }> | null ?? []).map((p) => [p.user_id, p]));
    const avalMap = new Map(((avals as Array<{ id: string; candidatura_id: string; estrelas: number; justificativa: string | null }> | null) ?? []).map((a) => [a.candidatura_id, a]));

    setCandidatos(
      list.map((c) => {
        const p = profMap.get(c.user_id);
        const a = avalMap.get(c.id);
        return {
          candidatura_id: c.id,
          user_id: c.user_id,
          telefone: c.telefone,
          cidade: c.cidade,
          bairro: c.bairro,
          status: c.status,
          aprovada_pela_empresa: c.aprovada_pela_empresa,
          nome_completo: p?.nome_completo ?? null,
          pontuacao: p?.pontuacao ?? 0,
          avaliacao_id: a?.id ?? null,
          estrelas: a?.estrelas ?? null,
          justificativa: a?.justificativa ?? null,
        };
      })
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const aprovar = async (c: Candidato) => {
    const { error } = await supabase
      .from("candidaturas")
      .update({ aprovada_pela_empresa: true, aprovada_em: new Date().toISOString(), status: "aprovada" })
      .eq("id", c.candidatura_id);
    if (error) {
      toast.error("Não foi possível aprovar este candidato.");
      return;
    }
    toast.success(`${c.nome_completo ?? "Candidato"} aprovado!`);
    load();
  };

  const abrirAvaliacao = (c: Candidato) => {
    setAlvo(c);
    setEstrelas(0);
    setComentario("");
    setOpenAval(true);
  };

  const enviarAvaliacao = async () => {
    if (!alvo || !servico) return;
    if (estrelas < 1) {
      toast.error("Selecione de 1 a 5 estrelas.");
      return;
    }
    const justObrigatoria = estrelas <= 3;
    if (justObrigatoria && comentario.trim().length < 5) {
      toast.error("Comentário obrigatório (mín. 5 caracteres) para notas até 3.");
      return;
    }
    setSaving(true);
    // Marca conclusão e insere avaliação. avaliador_id = trabalhador_id (proxy: usamos user_id do trabalhador como avaliador no fluxo público)
    // Para política RLS, INSERT da empresa precisa de admin -> usamos RPC? No nosso caso, o token já validou via SELECT.
    // Solução: criar via RPC seria melhor. Por simplicidade aqui, a tabela exige admin. Vamos via política específica.
    const { error: errCand } = await supabase
      .from("candidaturas")
      .update({ status: "concluida" })
      .eq("id", alvo.candidatura_id);
    if (errCand) {
      setSaving(false);
      toast.error("Erro ao concluir candidatura.");
      return;
    }
    const { error } = await supabase.from("avaliacoes").insert({
      candidatura_id: alvo.candidatura_id,
      servico_id: servico.id,
      trabalhador_id: alvo.user_id,
      avaliador_id: alvo.user_id, // placeholder no fluxo público (sem auth)
      estrelas,
      justificativa: comentario.trim() || null,
      tipo: "empresa_para_trabalhador",
    });
    setSaving(false);
    if (error) {
      toast.error(error.message || "Erro ao enviar avaliação.");
      return;
    }
    toast.success("Avaliação registrada!");
    setOpenAval(false);
    load();
  };

  const recontratar = async (c: Candidato) => {
    if (!servico) return;
    setRecontratando(true);
    const { data: novo, error } = await supabase
      .from("servicos")
      .insert({
        titulo: servico.titulo,
        categoria: servico.categoria,
        descricao: servico.descricao,
        cidade: servico.cidade,
        estado: servico.estado,
        valor: servico.valor,
        horario: servico.horario,
        empresa_nome: servico.empresa_nome,
      })
      .select("empresa_token")
      .single();
    setRecontratando(false);
    if (error || !novo) {
      toast.error("Não foi possível recontratar agora.");
      return;
    }
    const link = `${window.location.origin}/empresa/${(novo as { empresa_token: string }).empresa_token}`;
    await navigator.clipboard.writeText(link);
    toast.success(`Novo serviço criado para ${c.nome_completo}. Link copiado!`);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Carregando painel da empresa...</div>;
  }

  if (!servico) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Link inválido</CardTitle>
            <CardDescription>
              Este link da empresa não foi encontrado. Verifique com o administrador da plataforma.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const aprovados = candidatos.filter((c) => c.aprovada_pela_empresa);
  const pendentes = candidatos.filter((c) => !c.aprovada_pela_empresa);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Painel da Empresa</p>
            <h1 className="text-xl font-bold">{servico.empresa_nome ?? "Empresa contratante"}</h1>
          </div>
          {servico.empresa_total_avaliacoes > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {servico.empresa_pontuacao} pts • {servico.empresa_total_avaliacoes} aval.
            </Badge>
          )}
        </div>
      </header>

      <main className="container space-y-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> {servico.titulo}
                </CardTitle>
                {servico.categoria && (
                  <Badge variant="secondary" className="mt-2">{servico.categoria}</Badge>
                )}
              </div>
              {servico.valor != null && (
                <div className="text-right">
                  <div className="text-xs uppercase text-muted-foreground">Valor</div>
                  <div className="text-2xl font-bold text-primary">R$ {Number(servico.valor).toFixed(2)}</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
            {(servico.cidade || servico.estado) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {[servico.cidade, servico.estado].filter(Boolean).join(" - ")}
              </div>
            )}
            {servico.data_servico && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" /> {new Date(servico.data_servico).toLocaleDateString("pt-BR")}
              </div>
            )}
            {servico.horario && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" /> {servico.horario}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" /> Candidatos ({candidatos.length})
            </CardTitle>
            <CardDescription>
              Aprove um candidato e, ao final do serviço, registre sua avaliação. O comentário é opcional para 4 e 5 estrelas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {candidatos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ainda não há candidatos para este serviço.</p>
            ) : (
              <>
                {[...aprovados, ...pendentes].map((c) => {
                  const nivel = getNivel(c.pontuacao);
                  return (
                    <div
                      key={c.candidatura_id}
                      className={cn(
                        "flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between",
                        c.aprovada_pela_empresa && "border-primary/40 bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <RankedAvatar nome={c.nome_completo} pontuacao={c.pontuacao} size="md" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium truncate">{c.nome_completo ?? "Sem nome"}</span>
                            <Badge className={nivel.badgeClass}>{nivel.label}</Badge>
                            {c.aprovada_pela_empresa && (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Aprovado
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {c.telefone} • {[c.bairro, c.cidade].filter(Boolean).join(", ")}
                          </p>
                          {c.estrelas != null && (
                            <p className="mt-1 text-xs">
                              <Star className="mr-1 inline h-3 w-3 fill-amber-400 text-amber-400" />
                              Avaliado: {c.estrelas} estrelas
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!c.aprovada_pela_empresa && (
                          <Button size="sm" onClick={() => aprovar(c)}>
                            Aprovar
                          </Button>
                        )}
                        {c.aprovada_pela_empresa && c.estrelas == null && (
                          <Button size="sm" onClick={() => abrirAvaliacao(c)}>
                            <Star className="mr-1 h-4 w-4" /> Avaliar trabalhador
                          </Button>
                        )}
                        {c.estrelas != null && (
                          <Button size="sm" variant="outline" disabled={recontratando} onClick={() => recontratar(c)}>
                            <RotateCcw className="mr-1 h-4 w-4" /> Recontratar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={openAval} onOpenChange={setOpenAval}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar {alvo?.nome_completo ?? "trabalhador"}</DialogTitle>
            <DialogDescription>
              Selecione a nota. Comentário é obrigatório para 1, 2 ou 3 estrelas e opcional para 4 e 5.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <StarPicker value={estrelas} onChange={setEstrelas} />
            {estrelas > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {estrelas} {estrelas === 1 ? "estrela" : "estrelas"}
              </p>
            )}
            <div className="space-y-2">
              <Label>
                Comentário{" "}
                <span className="text-xs text-muted-foreground">
                  {estrelas > 0 && estrelas <= 3 ? "(obrigatório)" : "(opcional)"}
                </span>
              </Label>
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Conte como foi o serviço..."
                rows={4}
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAval(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={enviarAvaliacao} disabled={saving || estrelas < 1}>
              {saving ? "Enviando..." : "Enviar avaliação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmpresaPainel;

import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AvaliacaoDialog from "@/components/AvaliacaoDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Conversa = {
  id: string;
  candidatura_id: string;
  servico_id: string;
  contratante_id: string;
  trabalhador_id: string;
  status: string;
};
type Msg = { id: string; autor_id: string; texto: string; created_at: string };

const iniciais = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
const hora = (d: string) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const ChatConversa = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [conv, setConv] = useState<Conversa | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [nome, setNome] = useState("");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [avaliarAberto, setAvaliarAberto] = useState(false);
  const [erro, setErro] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (!id) return;
    let ativo = true;
    (async () => {
      const { data: c } = await supabase
        .from("chat_conversas")
        .select("id, candidatura_id, servico_id, contratante_id, trabalhador_id, status")
        .eq("id", id)
        .maybeSingle();
      if (!ativo) return;
      if (!c) { setErro(true); return; }
      setConv(c);
      const souContratante = c.contratante_id === user.id;
      const outro = souContratante ? c.trabalhador_id : c.contratante_id;
      const [{ data: p }, { data: s }, { data: m }] = await Promise.all([
        supabase.from("profiles").select("nome_completo").eq("user_id", outro).maybeSingle(),
        supabase.from("servicos").select("titulo, empresa_nome").eq("id", c.servico_id).maybeSingle(),
        supabase.from("chat_mensagens").select("id, autor_id, texto, created_at").eq("conversa_id", c.id).order("created_at"),
      ]);
      if (!ativo) return;
      setNome(souContratante ? p?.nome_completo || "Trabalhador" : s?.empresa_nome || p?.nome_completo || "Contratante");
      setTitulo(s?.titulo ?? "Serviço");
      setMsgs(m ?? []);
    })();

    const channel = supabase
      .channel(`chat-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_mensagens", filter: `conversa_id=eq.${id}` },
        (payload) => {
          const nova = payload.new as Msg;
          setMsgs((prev) => (prev.some((x) => x.id === nova.id) ? prev : [...prev, nova]));
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_conversas", filter: `id=eq.${id}` },
        (payload) => setConv((prev) => (prev ? { ...prev, status: (payload.new as Conversa).status } : prev)))
      .subscribe();
    return () => { ativo = false; supabase.removeChannel(channel); };
  }, [id, user, loading, navigate]);

  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const encerrado = conv?.status === "encerrado";
  const podeEncerrar = !!conv && !encerrado && (conv.contratante_id === user?.id || isAdmin);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const t = texto.trim();
    if (!t || !conv || !user || encerrado) return;
    setEnviando(true);
    const { data, error } = await supabase
      .from("chat_mensagens")
      .insert({ conversa_id: conv.id, autor_id: user.id, texto: t.slice(0, 2000) })
      .select("id, autor_id, texto, created_at")
      .single();
    setEnviando(false);
    if (error) { toast.error("Não foi possível enviar a mensagem."); return; }
    setTexto("");
    setMsgs((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data]));
  };

  const encerrarChat = async () => {
    if (!conv) return;
    const { error } = await supabase
      .from("chat_conversas")
      .update({ status: "encerrado", encerrado_em: new Date().toISOString() })
      .eq("id", conv.id);
    if (error) { toast.error("Avaliação salva, mas não foi possível encerrar o chat."); return; }
    setConv({ ...conv, status: "encerrado" });
    toast.success("Serviço concluído e chat encerrado.");
  };

  if (erro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-muted-foreground">Conversa não encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/mensagens")}>Voltar às mensagens</Button>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-muted/40">
      <header className="flex items-center gap-3 border-b bg-card px-3 py-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate("/mensagens")} aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">{iniciais(nome || "?")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">{nome || "Carregando..."}</p>
          <p className="truncate text-xs text-muted-foreground">{titulo}</p>
        </div>
        {podeEncerrar && (
          <Button size="sm" className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setAvaliarAberto(true)}>
            <CheckCircle2 className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Concluir e avaliar serviço</span>
            <span className="sm:hidden">Concluir</span>
          </Button>
        )}
      </header>

      <div className="mx-3 mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>Chat temporário protegido. Esta conversa ficará ativa até a conclusão do serviço.</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {msgs.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted-foreground">Nenhuma mensagem ainda. Diga olá! 👋</p>
        )}
        {msgs.map((m) => {
          const minha = m.autor_id === user?.id;
          return (
            <div key={m.id} className={cn("flex", minha ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                minha ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-card text-foreground",
              )}>
                <p className="whitespace-pre-wrap">{m.texto}</p>
                <p className={cn("mt-0.5 text-right text-[10px]", minha ? "text-primary-foreground/70" : "text-muted-foreground")}>{hora(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>

      {encerrado ? (
        <div className="border-t bg-card px-4 py-4 text-center text-sm text-muted-foreground">
          <Lock className="mx-auto mb-1 h-4 w-4" />
          Este chat foi encerrado porque o serviço foi concluído. Não é possível enviar novas mensagens.
        </div>
      ) : (
        <form onSubmit={enviar} className="flex items-center gap-2 border-t bg-card p-3">
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Digite uma mensagem..."
            maxLength={2000}
            disabled={!conv}
            className="rounded-full bg-muted/60"
          />
          <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={enviando || !texto.trim()} aria-label="Enviar">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      {conv && (
        <AvaliacaoDialog
          open={avaliarAberto}
          onOpenChange={setAvaliarAberto}
          candidaturaId={conv.candidatura_id}
          servicoId={conv.servico_id}
          trabalhadorId={conv.trabalhador_id}
          onSuccess={encerrarChat}
        />
      )}
    </div>
  );
};

export default ChatConversa;

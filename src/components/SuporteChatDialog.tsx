import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Headset, Send } from "lucide-react";

type Mensagem = { de: "suporte" | "voce"; texto: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nome?: string;
};

const SuporteChatDialog = ({ open, onOpenChange, nome }: Props) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [texto, setTexto] = useState("");
  const jaCarregou = useRef(false);
  const fim = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || jaCarregou.current) return;
    jaCarregou.current = true;
    setCarregando(true);

    (async () => {
      const { data, error } = await supabase.functions.invoke("codigo-contratante", {
        body: { acao: "gerar" },
      });
      const codigo = (data as { codigo?: string } | null)?.codigo;

      if (error || !codigo) {
        setMensagens([
          {
            de: "suporte",
            texto:
              "Olá! Não consegui gerar seu código de acesso agora. Feche e abra o chat novamente em alguns instantes.",
          },
        ]);
      } else {
        const validade = (data as { expira_em?: string }).expira_em;
        const validoAte = validade
          ? new Date(validade).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
          : null;
        setMensagens([
          {
            de: "suporte",
            texto: `Olá${nome ? `, ${nome.split(" ")[0]}` : ""}! Bem-vindo(a) ao UaiTrampo. 👋`,
          },
          {
            de: "suporte",
            texto: `Seu código de acesso de contratante é ${codigo}.`,
          },
          {
            de: "suporte",
            texto: validoAte
              ? `Ele é válido até ${validoAte} e pode ser usado uma única vez. Digite-o na tela de cadastro para liberar seu Painel Empresa.`
              : "Ele pode ser usado uma única vez. Digite-o na tela de cadastro para liberar seu Painel Empresa.",
          },
        ]);
      }
      setCarregando(false);
    })();
  }, [open, nome]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor) return;
    setMensagens((atual) => [
      ...atual,
      { de: "voce", texto: valor },
      {
        de: "suporte",
        texto: "Recebemos sua mensagem! Nossa equipe responde por aqui em horário comercial.",
      },
    ]);
    setTexto("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="flex-row items-center gap-3 border-b bg-primary px-4 py-3 text-primary-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15">
            <Headset className="h-4 w-4" />
          </span>
          <div className="text-left">
            <DialogTitle className="text-sm font-bold text-primary-foreground">uaitrampo.suporte</DialogTitle>
            <p className="text-[11px] text-primary-foreground/75">Atendimento oficial</p>
          </div>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto bg-muted/40 px-4 py-4">
          {carregando && <p className="text-xs text-muted-foreground">Carregando atendimento...</p>}
          {mensagens.map((m, i) => (
            <div key={i} className={m.de === "voce" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={
                  m.de === "voce"
                    ? "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-[13px] font-medium text-primary-foreground"
                    : "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm bg-background px-3.5 py-2.5 text-[13px] text-foreground shadow-sm"
                }
              >
                {m.texto}
              </p>
            </div>
          ))}
          <div ref={fim} />
        </div>

        <form onSubmit={enviar} className="flex items-center gap-2 border-t bg-background px-3 py-3">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva uma mensagem"
            className="h-11 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all active:scale-95"
            aria-label="Enviar mensagem"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SuporteChatDialog;

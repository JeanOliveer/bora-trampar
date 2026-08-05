import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  XCircle,
  MessageSquare,
  PlayCircle,
  Flag,
  Star,
  UserCog,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export type NotificacaoTipo =
  | "nova_diaria"
  | "candidatura_aceita"
  | "candidatura_recusada"
  | "mensagem_empresa"
  | "servico_iniciado"
  | "servico_finalizado"
  | "avaliacao_recebida"
  | "conta_atualizada"
  | "aviso_importante";

export type Notificacao = {
  id: string;
  user_id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  descricao: string | null;
  rota: string | null;
  entidade_id: string | null;
  lida: boolean;
  created_at: string;
};

type TipoMeta = { icon: LucideIcon; tint: string; label: string };

export const tipoMeta: Record<NotificacaoTipo, TipoMeta> = {
  nova_diaria: { icon: BriefcaseBusiness, tint: "bg-primary/10 text-primary", label: "Nova diária" },
  candidatura_aceita: { icon: CheckCircle2, tint: "bg-emerald-500/10 text-emerald-600", label: "Candidatura aceita" },
  candidatura_recusada: { icon: XCircle, tint: "bg-destructive/10 text-destructive", label: "Candidatura recusada" },
  mensagem_empresa: { icon: MessageSquare, tint: "bg-blue-500/10 text-blue-600", label: "Mensagem" },
  servico_iniciado: { icon: PlayCircle, tint: "bg-sky-500/10 text-sky-600", label: "Serviço iniciado" },
  servico_finalizado: { icon: Flag, tint: "bg-emerald-500/10 text-emerald-600", label: "Serviço finalizado" },
  avaliacao_recebida: { icon: Star, tint: "bg-amber-500/10 text-amber-600", label: "Avaliação" },
  conta_atualizada: { icon: UserCog, tint: "bg-muted text-muted-foreground", label: "Conta" },
  aviso_importante: { icon: AlertTriangle, tint: "bg-warning/10 text-warning", label: "Aviso" },
};

export const metaDe = (tipo: string): TipoMeta =>
  tipoMeta[tipo as NotificacaoTipo] ?? { icon: Bell, tint: "bg-muted text-muted-foreground", label: "Notificação" };

/** Destino padrão quando a notificação não traz rota (também usado por push). */
export const rotaPadrao = (tipo: string, entidadeId?: string | null): string => {
  switch (tipo as NotificacaoTipo) {
    case "nova_diaria":
      return entidadeId ? `/servicos?servico=${entidadeId}` : "/servicos";
    case "candidatura_aceita":
    case "candidatura_recusada":
    case "servico_iniciado":
    case "servico_finalizado":
    case "mensagem_empresa":
      return entidadeId ? `/servicos?candidatura=${entidadeId}` : "/servicos";
    case "avaliacao_recebida":
      return "/carreira";
    case "conta_atualizada":
      return "/perfil";
    default:
      return "/notificacoes";
  }
};

export type GrupoData = "Hoje" | "Ontem" | "Esta semana" | "Mais antigas";

const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export const grupoDe = (iso: string): GrupoData => {
  const hoje = inicioDoDia(new Date());
  const dia = inicioDoDia(new Date(iso));
  const umDia = 86400000;
  if (dia === hoje) return "Hoje";
  if (dia === hoje - umDia) return "Ontem";
  if (dia > hoje - 7 * umDia) return "Esta semana";
  return "Mais antigas";
};

export const ordemGrupos: GrupoData[] = ["Hoje", "Ontem", "Esta semana", "Mais antigas"];

export const formatarDataHora = (iso: string): string => {
  const d = new Date(iso);
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const grupo = grupoDe(iso);
  if (grupo === "Hoje") return `Hoje às ${hora}`;
  if (grupo === "Ontem") return `Ontem às ${hora}`;
  return `${d.toLocaleDateString("pt-BR")} às ${hora}`;
};

export const badgeTexto = (n: number): string => (n > 99 ? "99+" : String(n));

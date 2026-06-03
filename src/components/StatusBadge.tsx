import { Badge } from "@/components/ui/badge";

export type StatusInfo = { label: string; className: string };

export const statusLabel = (status: string, presenca: boolean, chegada: boolean): StatusInfo => {
  if (status === "concluida") return { label: "Concluído", className: "bg-emerald-600 text-white" };
  if (chegada) return { label: "Chegada Confirmada", className: "bg-emerald-500 text-white" };
  if (presenca) return { label: "Presença Confirmada", className: "bg-blue-500 text-white" };
  if (status === "aprovada") return { label: "Aprovado", className: "bg-primary text-primary-foreground" };
  if (status === "rejeitada") return { label: "Rejeitada", className: "bg-destructive text-destructive-foreground" };
  return { label: "Pendente", className: "bg-amber-500 text-white" };
};

export const StatusBadge = ({ status, presenca, chegada }: { status: string; presenca: boolean; chegada: boolean }) => {
  const info = statusLabel(status, presenca, chegada);
  return <Badge className={info.className}>{info.label}</Badge>;
};

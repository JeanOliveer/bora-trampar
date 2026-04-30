// Sistema de níveis baseado na pontuação do trabalhador.
// Regras de pontos por estrelas: 1->-2, 2->-1, 3->+1, 4->+2, 5->+3
// Níveis:
//   >= +10 Excelente (amarelo dourado)
//   >= +5  Ótimo (azul)
//   >  -3  Padrão (cinza)   (entre -3 (exclusivo) e 5)
//   <= -3 e > -5 Ruim (laranja)
//   <= -5 Péssimo (vermelho)

export type NivelKey = "excelente" | "otimo" | "padrao" | "ruim" | "pessimo";

export type NivelInfo = {
  key: NivelKey;
  label: string;
  // classes de cor para borda (usar com ring-* / border-*)
  ringClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  badgeClass: string;
  // hex aproximado (para casos visuais sem token)
  color: string;
};

export const getNivel = (pontuacao: number): NivelInfo => {
  if (pontuacao >= 10) {
    return {
      key: "excelente",
      label: "Funcionário Excelente",
      ringClass: "ring-amber-400",
      borderClass: "border-amber-400",
      bgClass: "bg-amber-50",
      textClass: "text-amber-700",
      badgeClass: "bg-amber-400 text-amber-950 hover:bg-amber-400",
      color: "#FBBF24",
    };
  }
  if (pontuacao >= 5) {
    return {
      key: "otimo",
      label: "Funcionário Ótimo",
      ringClass: "ring-blue-500",
      borderClass: "border-blue-500",
      bgClass: "bg-blue-50",
      textClass: "text-blue-700",
      badgeClass: "bg-blue-500 text-white hover:bg-blue-500",
      color: "#3B82F6",
    };
  }
  if (pontuacao <= -5) {
    return {
      key: "pessimo",
      label: "Funcionário Péssimo",
      ringClass: "ring-red-600",
      borderClass: "border-red-600",
      bgClass: "bg-red-50",
      textClass: "text-red-700",
      badgeClass: "bg-red-600 text-white hover:bg-red-600",
      color: "#DC2626",
    };
  }
  if (pontuacao <= -3) {
    return {
      key: "ruim",
      label: "Funcionário Ruim",
      ringClass: "ring-orange-500",
      borderClass: "border-orange-500",
      bgClass: "bg-orange-50",
      textClass: "text-orange-700",
      badgeClass: "bg-orange-500 text-white hover:bg-orange-500",
      color: "#F97316",
    };
  }
  return {
    key: "padrao",
    label: "Padrão",
    ringClass: "ring-muted-foreground/40",
    borderClass: "border-muted-foreground/40",
    bgClass: "bg-muted",
    textClass: "text-muted-foreground",
    badgeClass: "bg-muted text-foreground hover:bg-muted",
    color: "#9CA3AF",
  };
};

export const pontosPorEstrelas = (estrelas: number): number => {
  switch (estrelas) {
    case 1: return -2;
    case 2: return -1;
    case 3: return 1;
    case 4: return 2;
    case 5: return 3;
    default: return 0;
  }
};

// Próximo limiar para a UI de progresso
export const proximoLimite = (pontuacao: number): { alvo: number; restante: number } | null => {
  if (pontuacao < 5) return { alvo: 5, restante: 5 - pontuacao };
  if (pontuacao < 10) return { alvo: 10, restante: 10 - pontuacao };
  return null;
};

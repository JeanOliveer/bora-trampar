import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface VoltarButtonProps {
  to: string;
  className?: string;
}

/** Botão "Voltar" com formato mobile (pílula, área de toque ampla). */
const VoltarButton = ({ to, className }: VoltarButtonProps) => (
  <Link
    to={to}
    aria-label="Voltar"
    className={cn(
      "mb-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-card px-5 text-sm font-semibold text-primary shadow-sm transition-all active:scale-[0.97] hover:bg-primary/5",
      className,
    )}
  >
    <ArrowLeft className="h-4 w-4" />
    Voltar
  </Link>
);

export default VoltarButton;

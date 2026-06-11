import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  backTo?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  children?: ReactNode;
};

const AppMobileHeader = ({ title, subtitle, eyebrow, backTo, showBack, onBack, right, children }: Props) => {
  const navigate = useNavigate();
  const hasBack = !!backTo || !!showBack || !!onBack;

  const backButton = hasBack ? (
    backTo ? (
      <Link
        to={backTo}
        aria-label="Voltar"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 active:scale-95 transition-transform"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
    ) : (
      <button
        type="button"
        aria-label="Voltar"
        onClick={() => (onBack ? onBack() : navigate(-1))}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 active:scale-95 transition-transform"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
    )
  ) : null;

  return (
    <header className="md:hidden sticky top-0 z-30 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground pb-6 pt-3 px-5 rounded-b-3xl shadow-[var(--shadow-elevated)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {backButton}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] uppercase tracking-wider opacity-80 truncate">
                {eyebrow}
              </p>
            )}
            <h1 className="text-xl font-bold leading-tight truncate">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-xs opacity-90 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {right}
      </div>
      {children}
    </header>
  );
};

export default AppMobileHeader;

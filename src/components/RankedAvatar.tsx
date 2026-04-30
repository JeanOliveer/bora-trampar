import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getNivel } from "@/lib/career";

type Props = {
  nome?: string | null;
  pontuacao: number;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

const initials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
};

const RankedAvatar = ({ nome, pontuacao, src, size = "md", className }: Props) => {
  const nivel = getNivel(pontuacao);
  return (
    <div className={cn("inline-block rounded-full p-[3px] ring-2 ring-offset-2 ring-offset-background", nivel.ringClass, className)}>
      <Avatar className={sizes[size]}>
        {src ? <AvatarImage src={src} alt={nome ?? "Avatar"} /> : null}
        <AvatarFallback className="bg-primary/10 text-primary">{initials(nome)}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default RankedAvatar;

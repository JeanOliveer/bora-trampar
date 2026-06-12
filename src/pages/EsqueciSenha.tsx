import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!emailRegex.test(trimmed)) {
      toast.error("Digite um e-mail válido.");
      return;
    }
    setLoading(true);
    // Always show generic message to prevent account enumeration
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setLoading(false);
    if (error && !error.message.toLowerCase().includes("not found")) {
      // Only surface real errors (rate limiting, network), not "user not found"
      console.error(error);
    }
    setSent(true);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#005e91] via-[#004a73] to-[#00314d] text-white">
      <Link
        to="/login"
        className="absolute left-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 transition-all active:scale-95"
        aria-label="Voltar"
      >
        <ArrowLeft className="h-4 w-4 text-white" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col items-center justify-center px-8 pt-16"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-md">
          {sent ? (
            <CheckCircle2 className="h-9 w-9 text-white" strokeWidth={1.6} />
          ) : (
            <KeyRound className="h-9 w-9 text-white" strokeWidth={1.6} />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
          {sent ? "Verifique seu e-mail" : "Recuperar senha"}
        </h1>
        <p className="mt-3 max-w-xs text-center text-sm text-white/75">
          {sent
            ? "Se existir uma conta com esse endereço, enviamos um link para redefinir sua senha. Verifique também a caixa de spam."
            : "Informe o e-mail cadastrado para receber um link de redefinição de senha."}
        </p>

        {!sent && (
          <div className="mt-8 w-full max-w-xs space-y-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-11 pr-4 text-sm font-medium text-white placeholder:text-white/50 backdrop-blur-md outline-none transition-all focus:border-white/40 focus:bg-white/15"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#061426] text-sm font-semibold text-white shadow-xl transition-all active:scale-[0.97] hover:bg-[#0a1d3a] disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </div>
        )}

        {sent && (
          <Link
            to="/login"
            className="mt-8 flex h-14 w-full max-w-xs items-center justify-center gap-2.5 rounded-2xl bg-[#061426] text-sm font-semibold text-white shadow-xl transition-all active:scale-[0.97] hover:bg-[#0a1d3a]"
          >
            Voltar para o login
          </Link>
        )}

        <Link
          to="/login"
          className="mt-6 text-[13px] text-white/70 underline-offset-4 hover:underline"
        >
          Lembrou a senha? Fazer login
        </Link>
      </motion.div>
    </div>
  );
};

export default EsqueciSenha;

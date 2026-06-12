import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const RedefinirSenha = () => {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase auto-exchanges the recovery token from the URL into a session.
    // We just need to confirm a session exists; listen for PASSWORD_RECOVERY event.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setValid(true);
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValid(true);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleUpdate = async () => {
    if (senha.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar a senha.");
      return;
    }
    toast.success("Senha redefinida com sucesso!");
    await supabase.auth.signOut();
    navigate("/login");
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
          <ShieldCheck className="h-9 w-9 text-white" strokeWidth={1.6} />
        </div>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Nova senha</h1>

        {!ready ? (
          <p className="mt-6 text-sm text-white/70">Validando link...</p>
        ) : !valid ? (
          <>
            <p className="mt-3 max-w-xs text-center text-sm text-white/75">
              Link inválido ou expirado. Solicite um novo link de recuperação.
            </p>
            <Link
              to="/esqueci-senha"
              className="mt-8 flex h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-[#061426] text-sm font-semibold text-white shadow-xl transition-all active:scale-[0.97] hover:bg-[#0a1d3a]"
            >
              Solicitar novo link
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 max-w-xs text-center text-sm text-white/75">
              Crie uma nova senha com pelo menos 8 caracteres.
            </p>
            <div className="mt-8 w-full max-w-xs space-y-3">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  type="password"
                  placeholder="Nova senha"
                  autoComplete="new-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-11 pr-4 text-sm font-medium text-white placeholder:text-white/50 backdrop-blur-md outline-none transition-all focus:border-white/40 focus:bg-white/15"
                />
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  autoComplete="new-password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-11 pr-4 text-sm font-medium text-white placeholder:text-white/50 backdrop-blur-md outline-none transition-all focus:border-white/40 focus:bg-white/15"
                />
              </div>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#061426] text-sm font-semibold text-white shadow-xl transition-all active:scale-[0.97] hover:bg-[#0a1d3a] disabled:opacity-60"
              >
                {loading ? "Salvando..." : "Atualizar senha"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default RedefinirSenha;

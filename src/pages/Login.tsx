import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, ArrowLeft, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const springTransition = {
  type: "spring" as const,
  stiffness: 120,
  damping: 14,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !senha) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    setLoading(false);

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message,
      );
      return;
    }

    toast.success("Login realizado com sucesso!");
    navigate("/servicos");
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#005e91] via-[#004a73] to-[#00314d] text-white">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/[0.04]" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-white/[0.03]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02]" />

      <Link
        to="/"
        className="absolute left-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 transition-all active:scale-95"
      >
        <ArrowLeft className="h-4 w-4 text-white" />
      </Link>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col items-center justify-center px-8 pt-16"
      >
        <motion.h1 variants={itemVariants} className="text-3xl font-extrabold tracking-tight">
          UaiTrampo
        </motion.h1>

        <motion.div variants={itemVariants} className="mt-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-[1.7rem] bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-md">
            <Briefcase className="h-11 w-11 text-white" strokeWidth={1.4} />
          </div>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-center text-sm font-medium text-white/80"
        >
          Bem-vindo de volta! Entre na sua conta.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-8 w-full max-w-xs space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-11 pr-4 text-sm font-medium text-white placeholder:text-white/50 backdrop-blur-md outline-none ring-0 transition-all focus:border-white/40 focus:bg-white/15"
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-11 pr-4 text-sm font-medium text-white placeholder:text-white/50 backdrop-blur-md outline-none transition-all focus:border-white/40 focus:bg-white/15"
            />
          </div>

          <div className="flex justify-end">
            <Link
              to="/esqueci-senha"
              className="text-[12px] font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#061426] text-sm font-semibold text-white shadow-xl transition-all active:scale-[0.97] hover:bg-[#0a1d3a] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-7 text-center text-[13px] text-white/70"
        >
          Não tem conta?{" "}
          <Link
            to="/cadastro"
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            Cadastre-se
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="px-8 pb-10 pt-4 text-center"
      >
        <p className="text-[10px] leading-relaxed text-white/35">
          Ao continuar, você concorda com nossos{" "}
          <span className="underline hover:text-white/60 cursor-pointer">Termos de Uso</span> e{" "}
          <span className="underline hover:text-white/60 cursor-pointer">Política de Privacidade</span>.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, User, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

const logoVariants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 180, damping: 12, delay: 0.15 },
  },
};

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/inicio", { replace: true });
    }
  }, [user, navigate]);

  const handleVisitor = () => {
    localStorage.setItem("uat_visitor", "1");
    navigate("/inicio");
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#005e91] via-[#004a73] to-[#00314d] text-white">
      {/* Decorative soft circles */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/[0.04]" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-white/[0.03]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col items-center justify-center px-8"
      >
        {/* App name */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl font-extrabold tracking-tight"
        >
          UaiTrampo
        </motion.h1>

        {/* Logo */}
        <motion.div variants={logoVariants} className="mt-10">
          <div className="relative">
            <div className="flex h-36 w-36 items-center justify-center rounded-[2.2rem] bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-md">
              <Briefcase className="h-16 w-16 text-white" strokeWidth={1.4} />
            </div>
            {/* Subtle pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.05, 0.15] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-[2.2rem] bg-white"
            />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="mt-10 max-w-[16rem] text-center text-sm font-medium leading-relaxed text-white/85"
        >
          Encontre oportunidades de trabalho de forma rápida e segura.
        </motion.p>

        {/* Action buttons */}
        <motion.div variants={itemVariants} className="mt-12 w-full max-w-xs space-y-3">
          <Link to="/login" className="block">
            <button className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#061426] text-sm font-semibold text-white shadow-xl transition-all active:scale-[0.97] hover:bg-[#0a1d3a]">
              <User className="h-4 w-4" />
              Já tenho login
            </button>
          </Link>

          <Link to="/cadastro" className="block">
            <button className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-white/80 bg-white text-sm font-semibold text-[#005e91] shadow-xl transition-all active:scale-[0.97] hover:bg-white/95">
              <UserPlus className="h-4 w-4" />
              Registrar-se
            </button>
          </Link>
        </motion.div>

        {/* Visitor link */}
        <motion.button
          variants={itemVariants}
          onClick={handleVisitor}
          className="mt-7 text-[13px] font-medium text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          Continuar como visitante
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="px-8 pb-10 pt-4 text-center"
      >
        <p className="text-[10px] leading-relaxed text-white/35">
          Ao continuar, você concorda com nossos{" "}
          <span className="underline hover:text-white/60 cursor-pointer">Termos de Uso</span>{" "}
          e{" "}
          <span className="underline hover:text-white/60 cursor-pointer">Política de Privacidade</span>.
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;

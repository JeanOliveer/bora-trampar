import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, HardHat, Building2 } from "lucide-react";

const springTransition = { type: "spring" as const, stiffness: 120, damping: 14 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
};

const EscolherTipoConta = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#005e91] via-[#004a73] to-[#00314d] text-white">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/[0.04]" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-white/[0.03]" />

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
        className="flex flex-1 flex-col items-center justify-center px-6 py-16"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-md">
            <Briefcase className="h-9 w-9 text-white" strokeWidth={1.4} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">UaiTrampo</h1>
          <p className="mt-1.5 max-w-[16rem] text-center text-[13px] font-medium text-white/75">
            Qual tipo de conta você deseja criar?
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-10 w-full max-w-sm space-y-3">
          <Link to="/cadastro/trabalhador" className="block">
            <button className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-xl transition-all active:scale-[0.97] hover:bg-white/95">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#005e91]/10">
                <HardHat className="h-5 w-5 text-[#005e91]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#005e91]">Trabalhador</span>
                <span className="block text-[12px] leading-snug text-[#005e91]/70">
                  Candidate-se a diárias e construa sua carreira
                </span>
              </span>
            </button>
          </Link>

          <Link to="/cadastro/contratante" className="block">
            <button className="flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-md shadow-xl transition-all active:scale-[0.97] hover:bg-white/15">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Building2 className="h-5 w-5 text-white" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">Contratante</span>
                <span className="block text-[12px] leading-snug text-white/70">
                  Publique serviços e gerencie contratações
                </span>
              </span>
            </button>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 text-center text-[13px] text-white/70">
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold text-white underline-offset-4 hover:underline">
            Faça login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EscolherTipoConta;

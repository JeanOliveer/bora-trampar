import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const estadosCivis = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"];

const inputClass =
  "h-12 w-full rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-medium text-white placeholder:text-white/50 backdrop-blur-md outline-none transition-all focus:border-white/40 focus:bg-white/15";

const labelClass = "mb-1.5 block text-xs font-semibold text-white/70";

const springTransition = {
  type: "spring" as const,
  stiffness: 120,
  damping: 14,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: springTransition },
};

const Cadastro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          user_type: "trabalhador",
          nome_completo: nome,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        cpf,
        data_nascimento: dataNascimento || null,
        estado_civil: estadoCivil,
        cidade,
        estado,
        chave_pix: chavePix || null,
      }).eq("user_id", user.id);
    }

    setLoading(false);
    toast.success("Conta criada com sucesso!");
    navigate("/servicos");
  };

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
        className="flex flex-1 flex-col items-center px-6 pb-10 pt-16"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-md">
            <Briefcase className="h-9 w-9 text-white" strokeWidth={1.4} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">UaiTrampo</h1>
          <p className="mt-1.5 text-center text-[13px] font-medium text-white/75">
            Crie sua conta de trabalhador
          </p>
        </motion.div>

        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="mt-8 w-full max-w-sm space-y-4"
        >
          <div>
            <label className={labelClass}>Nome completo *</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="João da Silva"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>CPF *</label>
            <input
              required
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nascimento *</label>
              <input
                required
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
            <div>
              <label className={labelClass}>Estado civil *</label>
              <select
                required
                value={estadoCivil}
                onChange={(e) => setEstadoCivil(e.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#004a73]">Selecione</option>
                {estadosCivis.map((ec) => (
                  <option key={ec} value={ec} className="bg-[#004a73]">{ec}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_5rem] gap-3">
            <div>
              <label className={labelClass}>Cidade *</label>
              <input
                required
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Belo Horizonte"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>UF *</label>
              <select
                required
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#004a73]">UF</option>
                {estadosBR.map((uf) => (
                  <option key={uf} value={uf} className="bg-[#004a73]">{uf}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Chave PIX (opcional)</label>
            <input
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
              placeholder="CPF, e-mail, telefone ou aleatória"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>E-mail *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Senha *</label>
            <input
              required
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#061426] text-sm font-semibold text-white shadow-xl transition-all active:scale-[0.97] hover:bg-[#0a1d3a] disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          <div className="pt-1 text-center text-[13px] text-white/70">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              Faça login
            </Link>
          </div>
        </motion.form>

        <motion.p
          variants={itemVariants}
          className="mt-8 max-w-xs px-2 text-center text-[10px] leading-relaxed text-white/35"
        >
          Ao continuar, você concorda com nossos{" "}
          <span className="underline hover:text-white/60 cursor-pointer">Termos de Uso</span> e{" "}
          <span className="underline hover:text-white/60 cursor-pointer">Política de Privacidade</span>.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Cadastro;

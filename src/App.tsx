import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import RootRoute from "@/components/RootRoute";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import EsqueciSenha from "./pages/EsqueciSenha.tsx";
import RedefinirSenha from "./pages/RedefinirSenha.tsx";
import Cadastro from "./pages/Cadastro.tsx";
import ComoFunciona from "./pages/ComoFunciona.tsx";
import Perfil from "./pages/Perfil.tsx";
import Servicos from "./pages/Servicos.tsx";
import Admin from "./pages/Admin.tsx";
import NovoServico from "./pages/NovoServico.tsx";
import AdminCandidatos from "./pages/AdminCandidatos.tsx";
import AdminCandidatoPerfil from "./pages/AdminCandidatoPerfil.tsx";
import AdminContratados from "./pages/AdminContratados.tsx";
import Carreira from "./pages/Carreira.tsx";
import ServicosRealizados from "./pages/ServicosRealizados.tsx";
import MeusPontos from "./pages/MeusPontos.tsx";
import PresencasConfirmadas from "./pages/PresencasConfirmadas.tsx";
import MediaEstrelas from "./pages/MediaEstrelas.tsx";
import MinhasAvaliacoes from "./pages/MinhasAvaliacoes.tsx";
import EmpresaPainel from "./pages/EmpresaPainel.tsx";
import OAuthConsent from "./pages/OAuthConsent.tsx";
import NotFound from "./pages/NotFound.tsx";
import TermosDeUso from "./pages/TermosDeUso.tsx";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade.tsx";
import Notificacoes from "./pages/Notificacoes.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/inicio" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/carreira" element={<Carreira />} />
            <Route path="/carreira/servicos-realizados" element={<ServicosRealizados />} />
            <Route path="/carreira/meus-pontos" element={<MeusPontos />} />
            <Route path="/carreira/presencas-confirmadas" element={<PresencasConfirmadas />} />
            <Route path="/carreira/media-estrelas" element={<MediaEstrelas />} />
            <Route path="/carreira/avaliacoes" element={<MinhasAvaliacoes />} />

            <Route path="/servicos" element={<Servicos />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/novo-servico" element={<NovoServico />} />
            <Route path="/admin/contratados" element={<AdminContratados />} />
            <Route path="/admin/servicos/:id/candidatos" element={<AdminCandidatos />} />
            <Route path="/admin/candidatos/:id" element={<AdminCandidatoPerfil />} />
            <Route path="/empresa/:token" element={<EmpresaPainel />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="/termos-de-uso" element={<TermosDeUso />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

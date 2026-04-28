import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Cadastro from "./pages/Cadastro.tsx";
import ComoFunciona from "./pages/ComoFunciona.tsx";
import Perfil from "./pages/Perfil.tsx";
import Servicos from "./pages/Servicos.tsx";
import Admin from "./pages/Admin.tsx";
import NovoServico from "./pages/NovoServico.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/novo-servico" element={<NovoServico />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

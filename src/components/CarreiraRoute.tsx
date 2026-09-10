import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Libera as páginas de Carreira apenas para perfis de trabalhador.
 * Contratantes (que não são admin) são redirecionados ao painel Empresa.
 */
const CarreiraRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, profileLoading, isAdmin, isContratante } = useAuth();

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isContratante && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default CarreiraRoute;

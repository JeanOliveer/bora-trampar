import { useAuth } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Welcome from "@/pages/Welcome";

const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#2563EA] to-[#16357F]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (user) return <Index />;
  return <Welcome />;
};

export default RootRoute;

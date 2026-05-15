import { useAuth } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Welcome from "@/pages/Welcome";

const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#005e91] to-[#00314d]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (user) return <Index />;
  return <Welcome />;
};

export default RootRoute;

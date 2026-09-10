import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/uaitrampo-symbol.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, isAdmin, isContratante, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-primary bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" aria-label="UaiTrampo" className="flex h-14 items-center">
          <img src={logo} alt="UaiTrampo" className="h-12 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/servicos" className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground">
            Serviços
          </Link>
          <Link to="/como-funciona" className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground">
            Como Funciona
          </Link>
          {user && (!isContratante || isAdmin) && (
            <Link to="/carreira" className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground">
              Carreira
            </Link>
          )}
          {(isAdmin || isContratante) && (
            <Link to="/admin" className="text-sm font-medium text-primary-foreground transition-colors hover:text-primary-foreground/80">
              {isAdmin ? "Admin" : "Empresa"}
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <User className="h-4 w-4" />
                  {profile?.nome_completo || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/perfil">Meu Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">Cadastrar</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="animate-fade-in border-t border-primary-foreground/20 bg-primary px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link to="/servicos" className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setMenuOpen(false)}>
              Serviços
            </Link>
            <Link to="/como-funciona" className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setMenuOpen(false)}>
              Como Funciona
            </Link>
            {user && (!isContratante || isAdmin) && (
              <Link to="/carreira" className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setMenuOpen(false)}>
                Carreira
              </Link>
            )}
            {(isAdmin || isContratante) && (
              <Link to="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setMenuOpen(false)}>
                {isAdmin ? "Admin" : "Empresa"}
              </Link>
            )}
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/perfil" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Meu Perfil</Button>
                  </Link>
                  <Button variant="ghost" className="w-full text-destructive" onClick={() => { signOut(); setMenuOpen(false); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Entrar</Button>
                  </Link>
                  <Link to="/cadastro" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full">Cadastrar</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

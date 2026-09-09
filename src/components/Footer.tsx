import { Link } from "react-router-dom";
import logo from "@/assets/uaitrampo-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link to="/" aria-label="UaiTrampo" className="flex h-12 items-center rounded bg-primary px-2">
            <img src={logo} alt="UaiTrampo" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Diárias</Link>
            <Link to="/como-funciona" className="hover:text-foreground transition-colors">Como Funciona</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 UaiTrampo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

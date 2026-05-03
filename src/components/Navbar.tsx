import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSensoryMode } from "@/contexts/SensoryModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Eye, EyeOff, Menu, X, LogIn, LogOut, Globe, Sun, Moon, Contrast, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { sensoryMode, toggleSensoryMode } = useSensoryMode();
  const { user, signOut } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const { theme, cycleTheme } = useTheme();
  const { isAdmin } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/learning-lab", label: t("nav.learningLab") },
    { to: "/pictogram-board", label: t("nav.pictogramBoard") },
    { to: "/sentence-builder", label: t("nav.sentenceBuilder") },
    { to: "/daily-routine", label: t("nav.dailyRoutine") },
    { to: "/letter-tracing", label: t("nav.letterTracing") },
    { to: "/assessment", label: t("nav.assessment") },
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/early-detection", label: t("nav.earlyDetection") },
    { to: "/community", label: t("nav.community") },
    { to: "/parent-notes", label: t("nav.parentNotes") },
    { to: "/premium", label: "Premium" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const ThemeIcon = theme === "dark" ? Moon : theme === "high-contrast" ? Contrast : Sun;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-3 md:h-16 md:px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/kinftech-logo.png"
            alt="KinfTech logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="text-lg font-extrabold text-foreground">
            ክንፍ<span className="text-primary">Tech</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors hover:bg-muted ${
                location.pathname === link.to
                  ? "bg-muted text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={cycleTheme}
            className="h-8 w-8 border-primary/30 p-0"
            title={theme}
          >
            <ThemeIcon className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="h-8 gap-1 border-primary/30 px-2 text-xs"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{lang === "en" ? "አማ" : "EN"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSensoryMode}
            className="h-8 gap-1.5 border-primary/30 px-2 text-xs"
          >
            {sensoryMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>

          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => { await signOut(); navigate("/"); }}
              className="h-8 gap-1.5 border-destructive/30 px-2 text-xs text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("nav.signOut")}</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 border-primary/30 px-2 text-xs">
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("nav.signIn")}</span>
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 xl:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t bg-card xl:hidden"
          >
            <div className="flex flex-col gap-1 p-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    location.pathname === link.to
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

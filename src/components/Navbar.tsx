import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSensoryMode } from "@/contexts/SensoryModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useTherapist } from "@/hooks/useTherapist";
import { useChildren } from "@/contexts/ChildContext";
import {
  Eye, EyeOff, Menu, X, LogIn, LogOut, Globe, Sun, Moon, Contrast, ChevronDown,
  Home, GraduationCap, Heart, BarChart3, ShieldCheck, Stethoscope, Crown, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem { to: string; label: string; }
interface NavGroup { label: string; icon: typeof Home; items: NavItem[]; }

const Navbar = () => {
  const { sensoryMode, toggleSensoryMode } = useSensoryMode();
  const { user, signOut } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const { theme, cycleTheme } = useTheme();
  const { isAdmin } = useAdmin();
  const { isTherapist } = useTherapist();
  const { children, activeChild, setActiveChildId } = useChildren();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const groups: NavGroup[] = [
    {
      label: "Learn", icon: GraduationCap, items: [
        { to: "/learning-lab", label: t("nav.learningLab") },
        { to: "/letter-tracing", label: t("nav.letterTracing") },
        { to: "/stories", label: "Stories" },
        { to: "/memory-match", label: "Memory Match" },
        { to: "/pictogram-board", label: t("nav.pictogramBoard") },
        { to: "/sentence-builder", label: t("nav.sentenceBuilder") },
      ],
    },
    {
      label: "Wellbeing", icon: Heart, items: [
        { to: "/calm-corner", label: "Calm Corner" },
        { to: "/daily-routine", label: t("nav.dailyRoutine") },
        { to: "/behavior-journal", label: "Behavior Journal" },
      ],
    },
    {
      label: "Parents", icon: BarChart3, items: [
        { to: "/dashboard", label: t("nav.dashboard") },
        { to: "/children", label: "My Children" },
        { to: "/parent-notes", label: t("nav.parentNotes") },
        { to: "/assessment", label: t("nav.assessment") },
        { to: "/early-detection", label: t("nav.earlyDetection") },
        { to: "/community", label: t("nav.community") },
      ],
    },
  ];

  const ThemeIcon = theme === "dark" ? Moon : theme === "high-contrast" ? Contrast : Sun;
  const isInGroup = (g: NavGroup) => g.items.some((i) => i.to === location.pathname);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-3 md:h-16 md:px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/kinftech-logo.png" alt="KinfTech logo" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-lg font-extrabold text-foreground">
            ክንፍ<span className="text-primary">Tech</span>
          </span>
        </Link>

        {/* Desktop grouped nav */}
        <div className="hidden items-center gap-1 lg:flex">
          <Link to="/" className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted ${location.pathname === "/" ? "bg-muted text-primary" : "text-muted-foreground"}`}>
            <Home className="mr-1 inline h-3.5 w-3.5" />{t("nav.home")}
          </Link>

          {groups.map((g) => {
            const Icon = g.icon;
            const active = isInGroup(g);
            return (
              <DropdownMenu key={g.label}>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted ${active ? "bg-muted text-primary" : "text-muted-foreground"}`}>
                    <Icon className="h-3.5 w-3.5" />{g.label}
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {g.items.map((i) => (
                    <DropdownMenuItem key={i.to} asChild>
                      <Link to={i.to} className={location.pathname === i.to ? "bg-muted text-primary" : ""}>{i.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}

          <Link to="/premium" className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${location.pathname === "/premium" ? "bg-primary text-primary-foreground" : "bg-secondary/20 text-secondary hover:bg-secondary/30"}`}>
            <Crown className="h-3.5 w-3.5" />Premium
          </Link>

          {isTherapist && (
            <Link to="/therapist" className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${location.pathname === "/therapist" ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted"}`}>
              <Stethoscope className="mr-1 inline h-3.5 w-3.5" />Therapist
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${location.pathname === "/admin" ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted"}`}>
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1">
          {user && children.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs">
                  <span>{activeChild?.avatar_emoji ?? "🧒"}</span>
                  <span className="hidden max-w-[80px] truncate sm:inline">{activeChild?.name ?? "Child"}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Active child</DropdownMenuLabel>
                {children.map((c) => (
                  <DropdownMenuItem key={c.id} onClick={() => setActiveChildId(c.id)}>
                    <span className="mr-2">{c.avatar_emoji}</span>{c.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/children"><Users className="mr-2 h-4 w-4" />Manage…</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="outline" size="sm" onClick={cycleTheme} className="h-8 w-8 p-0" title={theme}>
            <ThemeIcon className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleLang} className="h-8 gap-1 px-2 text-xs">
            <Globe className="h-3.5 w-3.5" /><span>{lang === "en" ? "አማ" : "EN"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={toggleSensoryMode} className="h-8 px-2" title="Sensory mode">
            {sensoryMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>

          {user ? (
            <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }} className="h-8 gap-1.5 border-destructive/30 px-2 text-xs text-destructive">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("nav.signOut")}</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2 text-xs">
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("nav.signIn")}</span>
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t bg-card lg:hidden">
            <div className="flex flex-col gap-3 p-3">
              <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg bg-muted px-3 py-2 text-sm font-bold">🏠 {t("nav.home")}</Link>
              {groups.map((g) => (
                <div key={g.label}>
                  <p className="mb-1 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{g.label}</p>
                  <div className="flex flex-col gap-0.5">
                    {g.items.map((i) => (
                      <Link key={i.to} to={i.to} onClick={() => setMobileOpen(false)}
                        className={`rounded-lg px-3 py-2 text-sm ${location.pathname === i.to ? "bg-muted text-primary font-semibold" : "text-foreground hover:bg-muted"}`}>
                        {i.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link to="/premium" onClick={() => setMobileOpen(false)} className="rounded-lg bg-secondary/20 px-3 py-2 text-sm font-bold text-secondary">👑 Premium</Link>
              {isTherapist && <Link to="/therapist" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">🩺 Therapist</Link>}
              {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">🛡 Admin</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { BookOpen, LayoutDashboard, Sparkles, WandSparkles, CircleHelp, Network, Layers, Timer, ChartNoAxesCombined, Calculator, Gamepad2, Award, Moon, Sun, Flame, Zap, Bell, ChevronDown, ArrowUpRight, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Fino } from "./fino";
import { toast } from "sonner";

const navigation = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard }, { to: "/tuteur", label: "Tuteur IA", icon: Sparkles, badge: "IA" },
  { to: "/generateur", label: "Générateur", icon: WandSparkles }, { to: "/quiz", label: "Quiz", icon: CircleHelp },
  { to: "/carte-mentale", label: "Carte mentale", icon: Network }, { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/temps", label: "Temps & concentration", icon: Timer }, { to: "/notes", label: "Mes notes", icon: ChartNoAxesCombined },
  { to: "/calculatrice", label: "Calculatrice", icon: Calculator }, { to: "/jeux", label: "Jeux éducatifs", icon: Gamepad2 },
  { to: "/profil", label: "Profil & récompenses", icon: Award },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const path = useLocation({ select: state => state.pathname });
  const [dark, setDark] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState("Lycée");
  const [subjects, setSubjects] = useState(["Mathématiques"]);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  const title = navigation.find(item => item.to === path)?.label ?? "SchoolTools";
  return <>
    <aside className="app-sidebar">
      <Link to="/" className="brand px-7 pt-8 pb-9"><span className="brand-symbol"><BookOpen size={34} strokeWidth={2.5} /></span>SchoolTools<span className="text-primary">.</span></Link>
      <div className="px-7 mb-3 eyebrow">Ton espace</div>
      <nav className="px-4 space-y-1" aria-label="Navigation principale">
        {navigation.map((item, index) => <div key={item.to}>{index === 6 && <div className="eyebrow px-3 mt-6 mb-3">Pour aller plus loin</div>}<Link to={item.to} className={`nav-item ${path === item.to ? "active" : ""}`}><item.icon /><span className="flex-1">{item.label}</span>{"badge" in item && <span className="text-[9px] rounded bg-primary/10 px-1.5 py-0.5">{item.badge}</span>}</Link></div>)}
      </nav>
      <div className="mt-auto px-5 pt-6 pb-5">
        <div className="rounded-xl bg-primary-soft px-4 py-4 mb-5"><div className="flex items-center gap-2 font-semibold text-xs"><Sparkles size={15} className="text-primary" />Un petit pas, chaque jour.</div><p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">De grandes réussites commencent par une petite révision.</p><Button variant="link" className="px-0 h-7 text-[11px] mt-1" onClick={() => { setOnboarding(true); setStep(0); }}>Personnaliser mon parcours <ArrowUpRight size={12} /></Button></div>
        <div className="flex items-center justify-between border-t pt-4"><Button variant="ghost" size="icon" aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"} onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</Button><span className="text-[11px] text-muted-foreground">{dark ? "Mode sombre" : "Mode clair"}</span><Button variant="ghost" size="icon" asChild><Link to="/profil" aria-label="Paramètres"><Settings /></Link></Button></div>
      </div>
    </aside>
    <div className="app-main">
      <header className="app-header"><div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">Mon espace <span className="mx-1 text-border">/</span><span className="font-medium text-foreground">{title}</span></div><Link to="/" className="brand text-xl md:hidden"><BookOpen className="text-primary" />SchoolTools<span className="text-primary">.</span></Link>
        <div className="flex items-center gap-4 sm:gap-6"><span className="flex items-center gap-1.5 text-reward font-semibold text-xs"><Flame size={17} fill="currentColor" />7<span className="hidden sm:inline text-muted-foreground font-normal">jours</span></span><span className="hidden sm:flex items-center gap-1.5 text-primary font-semibold text-xs"><Zap size={17} fill="currentColor" />1 250 XP</span><div className="h-6 w-px bg-border hidden sm:block" /><Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => toast("Tu as 12 flashcards à réviser aujourd’hui.", { description: "Fino t’encourage à continuer ta série !" })}><Bell /></Button><Button variant="ghost" size="icon" className="md:hidden" aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"} onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</Button><Link to="/profil" className="flex items-center gap-2"><span className="rounded-full w-9 h-9 grid place-items-center bg-primary-soft text-primary font-bold text-xs">Y</span><span className="hidden lg:inline text-xs font-semibold">Yacine</span><ChevronDown className="hidden lg:block" size={14} /></Link></div>
      </header>
      <main className="page-content">{children}</main>
    </div>
    <nav className="mobile-nav" aria-label="Navigation mobile">{[navigation[0], navigation[1], navigation[3], navigation[6], navigation[10]].map(item => <Link key={item.to} to={item.to} className={path === item.to ? "active" : ""}><item.icon /><span>{item.to === "/" ? "Accueil" : item.to === "/temps" ? "Temps" : item.to === "/profil" ? "Profil" : item.label}</span></Link>)}</nav>
    <div className="fino-floating">{bubble && <div className="fino-bubble">Un petit effort aujourd’hui,<br /><strong>un grand pas pour demain !</strong> ✨</div>}<Button variant="ghost" className="fino-button" aria-label="Parler à Fino" onClick={() => setBubble(!bubble)}><Fino mood="encouraging" /></Button></div>
    <Dialog open={onboarding} onOpenChange={setOnboarding}><DialogContent><Fino className="w-24 mx-auto" /><DialogTitle>{["Bienvenue dans ton aventure !", "Quelles matières t’intéressent ?", "Ton parcours est prêt !"][step]}</DialogTitle><DialogDescription>{["Choisis ton niveau pour un parcours à ton rythme.", "Fino prépare tes prochaines révisions.", `${level} · ${subjects.join(", ")}. À toi de jouer !`][step]}</DialogDescription>{step === 0 && <div className="grid grid-cols-3 gap-2">{["Collège", "Lycée", "Études supérieures"].map(v => <Button key={v} variant={level === v ? "default" : "outline"} className="whitespace-normal h-14" onClick={() => setLevel(v)}>{v}</Button>)}</div>}{step === 1 && <div className="grid grid-cols-2 gap-2">{["Mathématiques", "Français", "Physique", "Histoire"].map(v => <Button key={v} variant={subjects.includes(v) ? "default" : "outline"} onClick={() => setSubjects(subjects.includes(v) ? subjects.filter(s => s !== v) : [...subjects, v])}>{subjects.includes(v) && <Check />}{v}</Button>)}</div>}<Button onClick={() => step < 2 ? setStep(step + 1) : setOnboarding(false)}>{step === 2 ? "C’est parti !" : "Continuer"}</Button><div className="text-center text-xs text-muted-foreground">{step + 1} / 3</div></DialogContent></Dialog>
  </>;
}
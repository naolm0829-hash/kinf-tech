import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-children.jpg";
import {
  Brain,
  BookOpen,
  MessageSquare,
  BarChart3,
  Sparkles,
  CheckCircle,
  Crown,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Index = () => {
  const { t } = useLanguage();

  const features = [
    { icon: MessageSquare, title: t("features.aiAssessment.title"), description: t("features.aiAssessment.desc"), to: "/assessment", color: "bg-kinf-blue-light text-primary" },
    { icon: Brain, title: t("features.learningLab.title"), description: t("features.learningLab.desc"), to: "/learning-lab", color: "bg-kinf-sage-light text-secondary" },
    { icon: Brain, title: "Early Detection", description: "AI-powered developmental screening with printable reports for doctors.", to: "/early-detection", color: "bg-kinf-warm-light text-accent" },
    { icon: BookOpen, title: t("features.pictogramBoard.title"), description: t("features.pictogramBoard.desc"), to: "/pictogram-board", color: "bg-kinf-blue-light text-primary" },
    { icon: BarChart3, title: t("features.parentDashboard.title"), description: t("features.parentDashboard.desc"), to: "/dashboard", color: "bg-kinf-sage-light text-secondary" },
    { icon: Sparkles, title: "Community Library", description: "Browse and share therapy content created by therapists, teachers, and parents.", to: "/community", color: "bg-kinf-warm-light text-accent" },
  ];

  const premiumPerks = [
    "Full access to every learning module and game",
    "Unlimited AI assessments & weekly progress insights",
    "Early Detection screening with downloadable doctor reports",
    "Priority feature requests directly to the team",
    "Cancel anytime — pay via Telebirr",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <img src={heroImage} alt="Diverse Ethiopian children learning together" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <img
              src="/kinftech-logo.png"
              alt="KinfTech wings logo"
              width={96}
              height={96}
              className="mx-auto mb-6 h-24 w-24 object-contain drop-shadow-xl"
            />
            <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-6xl">
              <span className="text-gradient-kinf">ክንፍTech</span>
            </h1>
            <p className="mx-auto mb-3 max-w-2xl text-lg font-semibold text-foreground md:text-xl">{t("hero.subtitle")}</p>
            <p className="mx-auto mb-8 max-w-xl text-sm text-muted-foreground">{t("hero.description")}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/assessment">
                <Button size="lg" className="gap-2 bg-gradient-kinf shadow-kinf hover:opacity-90">
                  <Sparkles className="h-4 w-4" />
                  {t("hero.startAssessment")}
                </Button>
              </Link>
              <Link to="/learning-lab">
                <Button variant="outline" size="lg" className="gap-2 border-primary/30 bg-card/60 backdrop-blur-sm">
                  <BookOpen className="h-4 w-4" />
                  {t("hero.exploreLab")}
                </Button>
              </Link>
            </div>
          </motion.div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {["Autism", "Dyslexia", "ADHD"].map((label, i) => (
              <motion.span key={label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }} className="rounded-full bg-card/80 px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
                {label}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-extrabold text-foreground">{t("features.title")}</h2>
            <p className="text-muted-foreground">{t("features.subtitle")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={f.to}>
                  <Card className="group h-full cursor-pointer border-transparent shadow-kinf transition-all hover:-translate-y-1 hover:shadow-kinf-lg">
                    <CardContent className="p-6">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                        <f.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-foreground">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.description}</p>
                      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        {t("features.explore")} <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-lg px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="overflow-hidden shadow-kinf-lg">
              <div className="bg-gradient-kinf p-6 text-center">
                <Crown className="mx-auto mb-2 h-8 w-8 text-primary-foreground" />
                <h2 className="text-2xl font-extrabold text-primary-foreground">KinfTech Premium</h2>
                <p className="mt-1 text-sm text-primary-foreground/90">
                  Full access — only 140 ETB / month
                </p>
              </div>
              <CardContent className="p-6">
                <ul className="mb-6 space-y-3">
                  {premiumPerks.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/premium">
                  <Button className="w-full gap-2 bg-gradient-kinf hover:opacity-90">
                    <Crown className="h-4 w-4" /> Get Premium
                  </Button>
                </Link>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Pay via Telebirr · Activated within 24h
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Founder */}
      <section className="border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-muted-foreground">{t("footer.founder")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("founder.empowering")}</p>
        </div>
      </section>
    </div>
  );
};

export default Index;

import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-card py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-foreground">
          ክንፍ<span className="text-primary">Tech</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("footer.founder")}
        </p>
        <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          {t("footer.madeWith")} <Heart className="h-3 w-3 text-destructive" /> {t("footer.forEveryChild")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;

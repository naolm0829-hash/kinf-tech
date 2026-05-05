import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !parentName.trim()) {
      toast({ title: "Name required", description: "Please enter your name.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = isSignUp
      ? await signUp(email, password, {
          parent_name: parentName.trim(),
          child_name: childName.trim(),
          child_age: childAge.trim(),
        })
      : await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (isSignUp) {
      toast({ title: "Welcome!", description: "Account created. Signing you in…" });
      // Auto-confirm is enabled — sign in immediately
      await signIn(email, password);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-kinf">
            <span className="text-2xl font-bold text-primary-foreground">ክ</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {isSignUp ? t("auth.createAccount") : t("auth.welcomeBack")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignUp ? t("auth.signUpDesc") : t("auth.signInDesc")}
          </p>
        </div>
        <Card className="shadow-kinf-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Your name *</Label>
                    <Input id="parentName" type="text" placeholder="Naol Mesfin" value={parentName} onChange={(e) => setParentName(e.target.value)} required maxLength={80} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="childName">Child's name</Label>
                      <Input id="childName" type="text" placeholder="Hana" value={childName} onChange={(e) => setChildName(e.target.value)} maxLength={80} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childAge">Child's age</Label>
                      <Input id="childAge" type="number" min={1} max={18} placeholder="6" value={childAge} onChange={(e) => setChildAge(e.target.value)} />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" type="email" placeholder="parent@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full gap-2 bg-gradient-kinf hover:opacity-90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                {isSignUp ? t("auth.signUp") : t("auth.signIn")}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-primary hover:underline">
                {isSignUp ? t("auth.hasAccount") : t("auth.noAccount")}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;

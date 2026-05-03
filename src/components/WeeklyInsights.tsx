import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Insight {
  summary: string;
  strengths: string;
  focus_areas: string;
  week_start: string;
}

const WeeklyInsights = () => {
  const { user } = useAuth();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCached = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("weekly_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setInsight(data as any);
  };

  useEffect(() => { loadCached(); }, [user]);

  const generate = async () => {
    setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekly-insights`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sess.session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setInsight(data);
      toast.success("Weekly insight ready!");
    } catch (e: any) {
      toast.error("Could not generate insight: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-kinf-lg">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Weekly Insights
          </h2>
          <Button size="sm" onClick={generate} disabled={loading} className="gap-1 bg-gradient-kinf hover:opacity-90">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            {insight ? "Refresh" : "Generate"}
          </Button>
        </div>

        {!insight && !loading && (
          <p className="text-sm text-muted-foreground">
            Tap Generate to receive a personalized AI summary of your child's learning patterns this week.
          </p>
        )}

        {insight && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Summary</p>
              <p className="text-foreground">{insight.summary}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Strengths</p>
              <p className="text-foreground">{insight.strengths}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Focus Areas</p>
              <p className="text-foreground">{insight.focus_areas}</p>
            </div>
            <p className="text-xs text-muted-foreground">Week of {insight.week_start}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyInsights;

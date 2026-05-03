import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Crown, Upload, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const TELEBIRR_NUMBER = "+251 911 00 00 00";
const PRICE_ETB = 140;

interface Receipt {
  id: string;
  amount: number;
  transaction_id: string;
  status: string;
  created_at: string;
  notes: string | null;
}
interface Subscription {
  status: string;
  expires_at: string | null;
  activated_at: string | null;
  plan: string;
}

const Premium = () => {
  const { user } = useAuth();
  const [txId, setTxId] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);

  const refresh = async () => {
    if (!user) return;
    const [{ data: r }, { data: s }] = await Promise.all([
      supabase.from("payment_receipts").select("id,amount,transaction_id,status,created_at,notes").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("status,expires_at,activated_at,plan").eq("user_id", user.id).maybeSingle(),
    ]);
    setReceipts(r ?? []);
    setSub(s as Subscription | null);
  };

  useEffect(() => { refresh(); }, [user]);

  const isActive = sub?.status === "active" && (!sub.expires_at || new Date(sub.expires_at) > new Date());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in"); return; }
    if (!txId.trim()) { toast.error("Transaction ID is required"); return; }
    setUploading(true);
    try {
      let path: string | null = null;
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5MB");
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const filePath = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("receipts").upload(filePath, file, { upsert: false });
        if (upErr) throw upErr;
        path = filePath;
      }
      const { error } = await supabase.from("payment_receipts").insert({
        user_id: user.id,
        amount: PRICE_ETB,
        transaction_id: txId.trim(),
        sender_phone: phone.trim() || null,
        screenshot_path: path,
      });
      if (error) throw error;
      toast.success("Receipt submitted! Admin will review within 24h.");
      setTxId(""); setPhone(""); setFile(null);
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md text-center"><CardContent className="p-8">
          <Crown className="mx-auto mb-3 h-10 w-10 text-primary" />
          <p className="mb-4">Sign in to subscribe to Premium.</p>
          <Link to="/auth"><Button className="bg-gradient-kinf">Sign in</Button></Link>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-6 text-center">
          <Crown className="mx-auto mb-2 h-10 w-10 text-primary" />
          <h1 className="text-3xl font-extrabold">KinfTech Premium</h1>
          <p className="text-muted-foreground">Full access for {PRICE_ETB} ETB / month</p>
        </div>

        {isActive && (
          <Card className="mb-4 border-secondary/50 bg-secondary/10">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle className="h-6 w-6 text-secondary" />
              <div>
                <p className="font-bold">Premium is active 👑</p>
                {sub?.expires_at && <p className="text-xs text-muted-foreground">Expires {new Date(sub.expires_at).toLocaleDateString()}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-4">
          <CardContent className="p-5">
            <h2 className="mb-2 font-bold">Step 1 — Send {PRICE_ETB} ETB via Telebirr</h2>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p>📱 Send to: <span className="font-mono font-bold">{TELEBIRR_NUMBER}</span></p>
              <p>💵 Amount: <span className="font-bold">{PRICE_ETB} ETB</span></p>
              <p>🏷 Reference: <span className="font-mono">KINF-{user.id.slice(0, 6)}</span></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 font-bold">Step 2 — Submit your receipt</h2>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label htmlFor="tx">Transaction ID *</Label>
                <Input id="tx" value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="ABC123XYZ" required />
              </div>
              <div>
                <Label htmlFor="ph">Sender phone (optional)</Label>
                <Input id="ph" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2519…" />
              </div>
              <div>
                <Label htmlFor="ss">Screenshot (optional, &lt;5MB)</Label>
                <Input id="ss" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <Button type="submit" disabled={uploading} className="w-full gap-2 bg-gradient-kinf">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Submit receipt
              </Button>
            </form>
          </CardContent>
        </Card>

        {receipts.length > 0 && (
          <Card className="mt-4">
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold">Your submissions</h3>
              <div className="space-y-2">
                {receipts.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <p className="font-mono">{r.transaction_id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                      {r.notes && <p className="mt-1 text-xs italic">"{r.notes}"</p>}
                    </div>
                    <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"} className="gap-1">
                      {r.status === "approved" ? <CheckCircle className="h-3 w-3" /> : r.status === "rejected" ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Premium;

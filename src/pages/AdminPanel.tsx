import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, ShieldCheck, Users, BookOpen, MessagesSquare, CreditCard, Sparkles, Search, Crown, X, Check, Megaphone, Ticket, BarChart3, Plus, Stethoscope } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile { id: string; user_id: string; parent_name: string | null; child_name: string | null; child_age: number | null; email: string | null; }
interface Receipt { id: string; user_id: string; amount: number; transaction_id: string; sender_phone: string | null; status: string; created_at: string; screenshot_path: string | null; notes: string | null; }
interface Subscription { user_id: string; status: string; expires_at: string | null; plan: string; }
interface RoleRow { user_id: string; role: string; }

const AdminPanel = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [community, setCommunity] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    const [{ data: p }, { data: pr }, { data: c }, { data: r }, { data: s }, { data: rl }, { data: ins }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("learning_progress").select("*"),
      supabase.from("community_content").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_receipts").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("user_id,status,expires_at,plan"),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("weekly_insights").select("*").order("week_start", { ascending: false }),
    ]);
    setProfiles((p ?? []) as Profile[]);
    setProgress(pr ?? []);
    setCommunity(c ?? []);
    setReceipts((r ?? []) as Receipt[]);
    setSubs((s ?? []) as Subscription[]);
    setRoles((rl ?? []) as RoleRow[]);
    setInsights(ins ?? []);
  };

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  const profileByUser = useMemo(() => {
    const m = new Map<string, Profile>();
    profiles.forEach((p) => m.set(p.user_id, p));
    return m;
  }, [profiles]);

  const subByUser = useMemo(() => {
    const m = new Map<string, Subscription>();
    subs.forEach((s) => m.set(s.user_id, s));
    return m;
  }, [subs]);

  const isUserAdmin = (uid: string) => roles.some((r) => r.user_id === uid && r.role === "admin");
  const isUserTherapist = (uid: string) => roles.some((r) => r.user_id === uid && r.role === "therapist");
  const promoteToTherapist = async (uid: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "therapist" });
    if (error) toast.error(error.message); else { toast.success("Marked as therapist"); refresh(); }
  };
  const demoteFromTherapist = async (uid: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "therapist");
    if (error) toast.error(error.message); else { toast.success("Removed therapist"); refresh(); }
  };

  const displayName = (uid: string) => {
    const p = profileByUser.get(uid);
    if (!p) return uid.slice(0, 8);
    return p.parent_name || p.email || uid.slice(0, 8);
  };

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center px-4"><Card className="max-w-md"><CardContent className="p-8 text-center"><p>Please sign in.</p></CardContent></Card></div>;
  }
  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) {
    return <div className="flex min-h-screen items-center justify-center px-4"><Card className="max-w-md"><CardContent className="p-8 text-center"><ShieldCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><p className="font-semibold">Admins only.</p></CardContent></Card></div>;
  }

  const filteredProfiles = profiles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (p.parent_name?.toLowerCase().includes(q) || p.child_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q));
  });

  const grantPremium = async (uid: string, months = 1) => {
    const expires = new Date(); expires.setMonth(expires.getMonth() + months);
    const { error } = await supabase.from("subscriptions").upsert({
      user_id: uid,
      plan: "premium",
      status: "active",
      activated_at: new Date().toISOString(),
      expires_at: expires.toISOString(),
    }, { onConflict: "user_id" });
    if (error) toast.error(error.message); else { toast.success(`Premium granted (${months}mo)`); refresh(); }
  };
  const revokePremium = async (uid: string) => {
    const { error } = await supabase.from("subscriptions").upsert({
      user_id: uid, plan: "premium", status: "inactive", expires_at: null,
    }, { onConflict: "user_id" });
    if (error) toast.error(error.message); else { toast.success("Premium revoked"); refresh(); }
  };
  const promoteToAdmin = async (uid: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
    if (error) toast.error(error.message); else { toast.success("Promoted to admin"); refresh(); }
  };
  const demoteFromAdmin = async (uid: string) => {
    if (uid === user.id) { toast.error("Can't demote yourself"); return; }
    const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
    if (error) toast.error(error.message); else { toast.success("Removed admin"); refresh(); }
  };

  const approveReceipt = async (r: Receipt) => {
    const expires = new Date(); expires.setMonth(expires.getMonth() + 1);
    const { error: e1 } = await supabase.from("payment_receipts").update({ status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", r.id);
    if (e1) { toast.error(e1.message); return; }
    const { error: e2 } = await supabase.from("subscriptions").upsert({
      user_id: r.user_id,
      plan: "premium",
      status: "active",
      activated_at: new Date().toISOString(),
      expires_at: expires.toISOString(),
    }, { onConflict: "user_id" });
    if (e2) toast.error(e2.message); else { toast.success("Approved & Premium activated"); refresh(); }
  };
  const rejectReceipt = async (r: Receipt, reason = "Not verified") => {
    const { error } = await supabase.from("payment_receipts").update({ status: "rejected", notes: reason, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", r.id);
    if (error) toast.error(error.message); else { toast.success("Rejected"); refresh(); }
  };
  const viewScreenshot = async (path: string) => {
    const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };
  const deleteContent = async (id: string) => {
    const { error } = await supabase.from("community_content").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); refresh(); }
  };

  const pendingReceipts = receipts.filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-extrabold">Admin Panel</h1>
          {pendingReceipts.length > 0 && <Badge variant="destructive" className="ml-2">{pendingReceipts.length} pending payment</Badge>}
        </div>

        <Tabs defaultValue="payments">
          <TabsList className="flex-wrap">
            <TabsTrigger value="payments"><CreditCard className="mr-1 h-4 w-4" /> Payments {pendingReceipts.length > 0 && `(${pendingReceipts.length})`}</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-1 h-4 w-4" /> Users ({profiles.length})</TabsTrigger>
            <TabsTrigger value="progress"><BookOpen className="mr-1 h-4 w-4" /> Progress ({progress.length})</TabsTrigger>
            <TabsTrigger value="community"><MessagesSquare className="mr-1 h-4 w-4" /> Community ({community.length})</TabsTrigger>
            <TabsTrigger value="insights"><Sparkles className="mr-1 h-4 w-4" /> Insights ({insights.length})</TabsTrigger>
            <TabsTrigger value="announcements"><Megaphone className="mr-1 h-4 w-4" /> Announce</TabsTrigger>
            <TabsTrigger value="promo"><Ticket className="mr-1 h-4 w-4" /> Promo</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="mr-1 h-4 w-4" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements"><AnnouncementsAdmin userId={user.id} /></TabsContent>
          <TabsContent value="promo"><PromoAdmin /></TabsContent>
          <TabsContent value="analytics">
            <Card><CardContent className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Users" value={profiles.length} />
              <Stat label="Premium active" value={subs.filter(s => s.status === 'active').length} />
              <Stat label="Pending payments" value={pendingReceipts.length} />
              <Stat label="Total revenue (ETB)" value={receipts.filter(r => r.status === 'approved').reduce((a, r) => a + Number(r.amount || 0), 0)} />
              <Stat label="Lessons completed" value={progress.reduce((a, p) => a + (p.lessons_completed || 0), 0)} />
              <Stat label="Community posts" value={community.length} />
              <Stat label="Insights generated" value={insights.length} />
              <Stat label="Admins" value={roles.filter(r => r.role === 'admin').length} />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card><CardContent className="p-4 space-y-2">
              {receipts.length === 0 && <p className="text-sm text-muted-foreground">No receipts yet.</p>}
              {receipts.map((r) => {
                const sub = subByUser.get(r.user_id);
                return (
                  <div key={r.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold">{displayName(r.user_id)} · <span className="font-mono text-xs">{r.transaction_id}</span></p>
                        <p className="text-xs text-muted-foreground">{r.amount} ETB · {r.sender_phone ?? "no phone"} · {new Date(r.created_at).toLocaleString()}</p>
                        {sub?.status === "active" && <p className="text-xs text-secondary">👑 Premium active</p>}
                      </div>
                      <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>{r.status}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.screenshot_path && <Button variant="outline" size="sm" onClick={() => viewScreenshot(r.screenshot_path!)}>View screenshot</Button>}
                      {r.status === "pending" && (
                        <>
                          <Button size="sm" className="bg-secondary text-secondary-foreground gap-1" onClick={() => approveReceipt(r)}><Check className="h-3 w-3" /> Approve & Activate</Button>
                          <Button size="sm" variant="destructive" className="gap-1" onClick={() => rejectReceipt(r)}><X className="h-3 w-3" /> Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="users">
            <Card><CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="space-y-2">
                {filteredProfiles.map((p) => {
                  const admin = isUserAdmin(p.user_id);
                  const sub = subByUser.get(p.user_id);
                  return (
                    <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold flex items-center gap-2">
                          {p.parent_name || "(no name)"}
                          {admin && <Badge variant="default" className="gap-1"><ShieldCheck className="h-3 w-3" />admin</Badge>}
                          {sub?.status === "active" && <Badge variant="secondary" className="gap-1"><Crown className="h-3 w-3" />premium</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.email ?? "—"} · child: {p.child_name ?? "—"} ({p.child_age ?? "?"})</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sub?.status === "active"
                          ? <Button size="sm" variant="outline" onClick={() => revokePremium(p.user_id)}>Revoke premium</Button>
                          : <Button size="sm" className="gap-1 bg-secondary text-secondary-foreground" onClick={() => grantPremium(p.user_id, 1)}><Crown className="h-3 w-3" /> Grant premium</Button>}
                        {admin
                          ? <Button size="sm" variant="outline" onClick={() => demoteFromAdmin(p.user_id)} disabled={p.user_id === user.id}>Remove admin</Button>
                          : <Button size="sm" variant="outline" onClick={() => promoteToAdmin(p.user_id)}>Make admin</Button>}
                        {isUserTherapist(p.user_id)
                          ? <Button size="sm" variant="outline" onClick={() => demoteFromTherapist(p.user_id)}>Remove therapist</Button>
                          : <Button size="sm" variant="outline" onClick={() => promoteToTherapist(p.user_id)}><Stethoscope className="h-3 w-3" /> Make therapist</Button>}
                      </div>
                    </div>
                  );
                })}
                {filteredProfiles.length === 0 && <p className="text-sm text-muted-foreground">No users match.</p>}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card><CardContent className="p-4">
              <div className="space-y-2">
                {progress.map((p) => (
                  <div key={p.id} className="rounded-lg border p-3 text-sm">
                    <p><b>{displayName(p.user_id)}</b> · Module {p.module_index} · Lessons {p.lessons_completed}/{p.total_lessons} · Quiz {p.quiz_score ?? "—"}/{p.quiz_total ?? "—"}</p>
                  </div>
                ))}
                {progress.length === 0 && <p className="text-sm text-muted-foreground">No progress yet.</p>}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="community">
            <Card><CardContent className="p-4">
              <div className="space-y-2">
                {community.map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-xs text-muted-foreground">by {displayName(c.user_id)} · {c.category} · ❤ {c.likes}</p>
                      <p className="mt-1 text-sm">{c.description}</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteContent(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                {community.length === 0 && <p className="text-sm text-muted-foreground">No content.</p>}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card><CardContent className="p-4 space-y-2">
              {insights.map((ins) => (
                <div key={ins.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-semibold">{displayName(ins.user_id)} · week of {ins.week_start}</p>
                  <p className="mt-1"><b>Summary:</b> {ins.summary}</p>
                  <p className="text-secondary"><b>Strengths:</b> {ins.strengths}</p>
                  <p className="text-accent"><b>Focus:</b> {ins.focus_areas}</p>
                </div>
              ))}
              {insights.length === 0 && <p className="text-sm text-muted-foreground">No insights generated yet.</p>}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border bg-card p-4 text-center">
    <p className="text-2xl font-extrabold text-primary">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const AnnouncementsAdmin = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!title.trim()) return;
    const { error } = await supabase.from("announcements").insert({ title, body, created_by: userId });
    if (error) toast.error(error.message); else { setTitle(""); setBody(""); load(); }
  };
  const toggle = async (id: string, active: boolean) => {
    await supabase.from("announcements").update({ active: !active }).eq("id", id); load();
  };
  const del = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id); load();
  };
  return (
    <Card><CardContent className="p-4 space-y-3">
      <div className="space-y-2 rounded-lg border p-3">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Message body" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button onClick={add} className="gap-2"><Plus className="h-4 w-4" /> Post announcement</Button>
      </div>
      {items.map((a) => (
        <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex-1">
            <p className="font-semibold">{a.title}</p>
            <p className="text-xs text-muted-foreground">{a.body}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toggle(a.id, a.active)}>{a.active ? "Hide" : "Show"}</Button>
            <Button size="sm" variant="destructive" onClick={() => del(a.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      ))}
    </CardContent></Card>
  );
};

const PromoAdmin = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [months, setMonths] = useState("1");
  const [maxUses, setMaxUses] = useState("100");
  const load = async () => {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    setCodes(data ?? []);
  };
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!code.trim()) return;
    const { error } = await supabase.from("promo_codes").insert({
      code: code.trim().toUpperCase(),
      free_months: parseInt(months) || 1,
      max_uses: parseInt(maxUses) || 100,
    });
    if (error) toast.error(error.message); else { setCode(""); load(); toast.success("Created"); }
  };
  const toggle = async (id: string, active: boolean) => {
    await supabase.from("promo_codes").update({ active: !active }).eq("id", id); load();
  };
  const del = async (id: string) => {
    await supabase.from("promo_codes").delete().eq("id", id); load();
  };
  return (
    <Card><CardContent className="p-4 space-y-3">
      <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-4">
        <Input placeholder="CODE (e.g. WELCOME)" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <Input type="number" placeholder="Free months" value={months} onChange={(e) => setMonths(e.target.value)} />
        <Input type="number" placeholder="Max uses" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
        <Button onClick={add} className="gap-2"><Plus className="h-4 w-4" /> Create code</Button>
      </div>
      {codes.map((c) => (
        <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="font-mono font-bold">{c.code}</p>
            <p className="text-xs text-muted-foreground">{c.free_months}mo · used {c.uses}/{c.max_uses} · {c.active ? "active" : "disabled"}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toggle(c.id, c.active)}>{c.active ? "Disable" : "Enable"}</Button>
            <Button size="sm" variant="destructive" onClick={() => del(c.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      ))}
    </CardContent></Card>
  );
};

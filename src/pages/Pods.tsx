import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePods } from "@/hooks/usePods";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Flame,
  Loader2,
  LogOut,
  Phone,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

const RHYTHMS = ["daily", "every other day", "weekly"];

export default function Pods() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    pods,
    myPods,
    checkins,
    loading,
    createPod,
    joinPod,
    leavePod,
    fetchCheckins,
    submitCheckin,
    streakFor,
    today,
  } = usePods();

  const [tab, setTab] = useState("my");
  const [showCreate, setShowCreate] = useState(false);
  const [checkinPod, setCheckinPod] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    commitment: "",
    focus: "",
    meeting_rhythm: "daily",
    max_members: 5,
  });
  const [checkinForm, setCheckinForm] = useState({
    kept_commitment: true,
    note: "",
    prayer_request: "",
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    myPods.forEach((p) => fetchCheckins(p.id));
  }, [myPods, fetchCheckins]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const openPods = pods.filter(
    (p) => p.members.length < p.max_members && !p.members.some((m) => m.user_id === user?.id)
  );

  const initials = (name?: string | null) => (name || "B").slice(0, 2).toUpperCase();

  const handleCreate = async () => {
    if (!form.name.trim() || !form.commitment.trim()) return;
    await createPod(form);
    setForm({ name: "", commitment: "", focus: "", meeting_rhythm: "daily", max_members: 5 });
    setShowCreate(false);
    setTab("my");
  };

  const handleCheckin = async () => {
    if (!checkinPod) return;
    await submitCheckin(checkinPod, checkinForm);
    setCheckinPod(null);
    setCheckinForm({ kept_commitment: true, note: "", prayer_request: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-44 md:pt-28 pb-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold mb-2 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-accent" />
              Accountability Pods
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Matched with three to five men for a shared commitment. Daily check-ins, honest
              streaks, and one button that calls your brother.
            </p>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="my">My Pods ({myPods.length})</TabsTrigger>
                <TabsTrigger value="find">Find a Pod ({openPods.length})</TabsTrigger>
              </TabsList>

              <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Start a Pod
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start a Pod</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Pod name</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Iron Sharpens Iron"
                      />
                    </div>
                    <div>
                      <Label>Shared commitment</Label>
                      <Textarea
                        value={form.commitment}
                        onChange={(e) => setForm({ ...form, commitment: e.target.value })}
                        placeholder="Scripture and 30 minutes of movement, six days a week."
                      />
                    </div>
                    <div>
                      <Label>Focus (optional)</Label>
                      <Input
                        value={form.focus}
                        onChange={(e) => setForm({ ...form, focus: e.target.value })}
                        placeholder="Fatherhood, recovery, discipline..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Rhythm</Label>
                        <Select
                          value={form.meeting_rhythm}
                          onValueChange={(v) => setForm({ ...form, meeting_rhythm: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RHYTHMS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Pod size</Label>
                        <Select
                          value={String(form.max_members)}
                          onValueChange={(v) => setForm({ ...form, max_members: Number(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[3, 4, 5].map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                {n} men
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleCreate}>
                      Create Pod
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value="my" className="space-y-6">
              {myPods.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium mb-1">You're not in a pod yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Join an open pod or start your own and invite brothers.
                    </p>
                    <Button variant="outline" onClick={() => setTab("find")}>
                      Find a Pod
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myPods.map((pod) => {
                  const podCheckins = checkins[pod.id] || [];
                  const todays = podCheckins.filter((c) => c.checkin_date === today);
                  const iCheckedIn = todays.some((c) => c.user_id === user?.id);
                  return (
                    <Card key={pod.id}>
                      <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {pod.name}
                              <Badge variant="secondary">
                                {pod.members.length}/{pod.max_members}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">{pod.commitment}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Dialog
                              open={checkinPod === pod.id}
                              onOpenChange={(o) => setCheckinPod(o ? pod.id : null)}
                            >
                              <DialogTrigger asChild>
                                <Button variant={iCheckedIn ? "outline" : "default"} size="sm">
                                  {iCheckedIn ? "Update Check-in" : "Daily Check-in"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Check in — {pod.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="kept"
                                      checked={checkinForm.kept_commitment}
                                      onCheckedChange={(v) =>
                                        setCheckinForm({ ...checkinForm, kept_commitment: !!v })
                                      }
                                    />
                                    <Label htmlFor="kept">I kept the commitment today</Label>
                                  </div>
                                  <div>
                                    <Label>Honest update</Label>
                                    <Textarea
                                      value={checkinForm.note}
                                      onChange={(e) =>
                                        setCheckinForm({ ...checkinForm, note: e.target.value })
                                      }
                                      placeholder="Where you stood strong, where you struggled."
                                    />
                                  </div>
                                  <div>
                                    <Label>Prayer request</Label>
                                    <Textarea
                                      value={checkinForm.prayer_request}
                                      onChange={(e) =>
                                        setCheckinForm({
                                          ...checkinForm,
                                          prayer_request: e.target.value,
                                        })
                                      }
                                      placeholder="What can your pod carry for you?"
                                    />
                                  </div>
                                  <Button className="w-full" onClick={handleCheckin}>
                                    Submit Check-in
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm" onClick={() => leavePod(pod.id)}>
                              <LogOut className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="space-y-2">
                          {pod.members.map((m) => {
                            const streak = streakFor(pod.id, m.user_id);
                            const checkedIn = todays.some((c) => c.user_id === m.user_id);
                            return (
                              <div
                                key={m.id}
                                className="flex items-center gap-3 rounded-lg border border-border p-3"
                              >
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={m.avatar_url || undefined} />
                                  <AvatarFallback>{initials(m.display_name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {m.display_name || "Brother"}
                                    {m.user_id === user?.id && (
                                      <span className="text-muted-foreground"> (you)</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {checkedIn ? "Checked in today" : "No check-in today"}
                                  </p>
                                </div>
                                <Badge variant="outline" className="gap-1">
                                  <Flame className="h-3 w-3 text-accent" />
                                  {streak}
                                </Badge>
                                {m.user_id !== user?.id && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => navigate(`/messages?user=${m.user_id}`)}
                                  >
                                    <Phone className="h-4 w-4 mr-1" />
                                    Call
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-2">Recent check-ins</h4>
                          {podCheckins.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No check-ins yet. Be the first to set the pace.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {podCheckins.slice(0, 6).map((c) => (
                                <div key={c.id} className="rounded-lg bg-secondary/40 p-3 text-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">
                                      {c.display_name || "Brother"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {c.checkin_date} · {c.kept_commitment ? "Kept it" : "Missed"}
                                    </span>
                                  </div>
                                  {c.note && <p className="text-muted-foreground">{c.note}</p>}
                                  {c.prayer_request && (
                                    <p className="text-accent mt-1">🙏 {c.prayer_request}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="find" className="space-y-4">
              {openPods.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No open pods right now — start one and let brothers join you.
                  </CardContent>
                </Card>
              ) : (
                openPods.map((pod) => (
                  <Card key={pod.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {pod.name}
                        <Badge variant="secondary">
                          {pod.members.length}/{pod.max_members}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{pod.commitment}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {pod.focus && <Badge variant="outline">{pod.focus}</Badge>}
                        <Badge variant="outline">{pod.meeting_rhythm} check-ins</Badge>
                      </div>
                      <Button onClick={() => joinPod(pod.id)}>Join Pod</Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

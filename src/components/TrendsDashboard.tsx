import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";

interface CheckinData {
  check_in_date: string;
  mood_level: number;
  stress_level: number;
  energy_level: number;
  sleep_quality: number | null;
}

interface TrendData {
  date: string;
  mood: number;
  stress: number;
  energy: number;
  sleep: number | null;
}

export function TrendsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TrendData[]>([]);
  const [period, setPeriod] = useState<"7" | "14" | "30">("7");

  useEffect(() => {
    if (user) {
      fetchTrends();
    }
  }, [user, period]);

  const fetchTrends = async () => {
    if (!user) return;
    setLoading(true);

    const daysAgo = parseInt(period);
    const startDate = format(subDays(startOfDay(new Date()), daysAgo - 1), "yyyy-MM-dd");

    const { data: checkins, error } = await supabase
      .from("mood_checkins")
      .select("check_in_date, mood_level, stress_level, energy_level, sleep_quality")
      .eq("user_id", user.id)
      .gte("check_in_date", startDate)
      .order("check_in_date", { ascending: true });

    if (error) {
      console.error("Error fetching trends:", error);
      setLoading(false);
      return;
    }

    const trendData: TrendData[] = (checkins || []).map((c: CheckinData) => ({
      date: format(new Date(c.check_in_date), "MMM d"),
      mood: c.mood_level,
      stress: c.stress_level,
      energy: c.energy_level,
      sleep: c.sleep_quality,
    }));

    setData(trendData);
    setLoading(false);
  };

  const calculateAverage = (key: keyof Omit<TrendData, "date">) => {
    const values = data.filter(d => d[key] !== null).map(d => d[key] as number);
    if (values.length === 0) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const getTrend = (key: keyof Omit<TrendData, "date">) => {
    if (data.length < 2) return "neutral";
    const recent = data.slice(-3);
    const earlier = data.slice(0, 3);
    
    const recentAvg = recent.filter(d => d[key] !== null).reduce((a, b) => a + (b[key] as number), 0) / recent.length;
    const earlierAvg = earlier.filter(d => d[key] !== null).reduce((a, b) => a + (b[key] as number), 0) / earlier.length;
    
    const diff = recentAvg - earlierAvg;
    if (Math.abs(diff) < 0.3) return "neutral";
    return diff > 0 ? "up" : "down";
  };

  const TrendIcon = ({ trend, positive }: { trend: string; positive: boolean }) => {
    if (trend === "neutral") return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (trend === "up") {
      return positive ? (
        <TrendingUp className="h-4 w-4 text-green-500" />
      ) : (
        <TrendingUp className="h-4 w-4 text-red-500" />
      );
    }
    return positive ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-green-500" />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No check-in data yet. Complete daily check-ins to see your trends.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg uppercase tracking-wider">Your Trends</CardTitle>
            <CardDescription>Track your patterns over time</CardDescription>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as "7" | "14" | "30")}>
            <TabsList className="h-8">
              <TabsTrigger value="7" className="text-xs px-3">7D</TabsTrigger>
              <TabsTrigger value="14" className="text-xs px-3">14D</TabsTrigger>
              <TabsTrigger value="30" className="text-xs px-3">30D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Mood</span>
              <TrendIcon trend={getTrend("mood")} positive={true} />
            </div>
            <div className="text-2xl font-bold text-blue-400">{calculateAverage("mood")}</div>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Stress</span>
              <TrendIcon trend={getTrend("stress")} positive={false} />
            </div>
            <div className="text-2xl font-bold text-red-400">{calculateAverage("stress")}</div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Energy</span>
              <TrendIcon trend={getTrend("energy")} positive={true} />
            </div>
            <div className="text-2xl font-bold text-yellow-400">{calculateAverage("energy")}</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Sleep</span>
              <TrendIcon trend={getTrend("sleep")} positive={true} />
            </div>
            <div className="text-2xl font-bold text-purple-400">{calculateAverage("sleep") || "—"}</div>
          </div>
        </div>

        {/* Combined Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(45, 100%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(45, 100%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 100%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 100%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="mood"
                name="Mood"
                stroke="hsl(210, 100%, 60%)"
                fill="url(#colorMood)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="energy"
                name="Energy"
                stroke="hsl(45, 100%, 60%)"
                fill="url(#colorEnergy)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="stress"
                name="Stress"
                stroke="hsl(0, 100%, 60%)"
                fill="url(#colorStress)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        {data.length >= 3 && (
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h4 className="font-medium text-sm mb-2">Quick Insights</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {getTrend("mood") === "up" && (
                <li>✨ Your mood has been improving recently</li>
              )}
              {getTrend("mood") === "down" && (
                <li>💪 Your mood could use a boost - try a workout!</li>
              )}
              {getTrend("stress") === "down" && (
                <li>🧘 Great job managing your stress levels</li>
              )}
              {getTrend("stress") === "up" && (
                <li>⚠️ Stress is trending up - consider recovery activities</li>
              )}
              {getTrend("energy") === "up" && (
                <li>⚡ Your energy levels are on the rise</li>
              )}
              {getTrend("energy") === "down" && (
                <li>😴 Energy dipping - prioritize sleep and nutrition</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

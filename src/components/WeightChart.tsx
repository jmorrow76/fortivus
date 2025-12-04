import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { TrendingDown, TrendingUp, Minus, Scale } from "lucide-react";

interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_date: string;
  weight: number | null;
  notes: string | null;
  created_at: string;
}

interface WeightChartProps {
  photos: ProgressPhoto[];
}

const WeightChart = ({ photos }: WeightChartProps) => {
  const chartData = useMemo(() => {
    return photos
      .filter((p) => p.weight !== null)
      .sort((a, b) => new Date(a.photo_date).getTime() - new Date(b.photo_date).getTime())
      .map((p) => ({
        date: p.photo_date,
        weight: p.weight,
        formattedDate: format(new Date(p.photo_date), "MMM d"),
      }));
  }, [photos]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const weights = chartData.map((d) => d.weight as number);
    const startWeight = weights[0];
    const currentWeight = weights[weights.length - 1];
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    const totalChange = currentWeight - startWeight;

    return {
      startWeight,
      currentWeight,
      minWeight,
      maxWeight,
      avgWeight: avgWeight.toFixed(1),
      totalChange: totalChange.toFixed(1),
      trend: totalChange < 0 ? "down" : totalChange > 0 ? "up" : "stable",
    };
  }, [chartData]);

  if (chartData.length < 2) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-16 text-center">
          <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Add weight data to at least 2 photos to see your progress chart.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    weight: {
      label: "Weight",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Starting</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                {stats.startWeight} <span className="text-sm font-normal">lbs</span>
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Current</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                {stats.currentWeight} <span className="text-sm font-normal">lbs</span>
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Change</p>
              <div className="flex items-center gap-2">
                {stats.trend === "down" ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : stats.trend === "up" ? (
                  <TrendingUp className="h-5 w-5 text-accent" />
                ) : (
                  <Minus className="h-5 w-5 text-muted-foreground" />
                )}
                <p
                  className={`text-2xl font-heading font-bold ${
                    stats.trend === "down"
                      ? "text-green-600"
                      : stats.trend === "up"
                      ? "text-accent"
                      : "text-foreground"
                  }`}
                >
                  {parseFloat(stats.totalChange) > 0 ? "+" : ""}
                  {stats.totalChange} <span className="text-sm font-normal">lbs</span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Average</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                {stats.avgWeight} <span className="text-sm font-normal">lbs</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Weight Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  domain={["dataMin - 5", "dataMax + 5"]}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value} lbs`, "Weight"]}
                    />
                  }
                />
                {stats && (
                  <ReferenceLine
                    y={parseFloat(stats.avgWeight)}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    label={{
                      value: "Avg",
                      position: "right",
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  dot={{
                    fill: "hsl(var(--accent))",
                    strokeWidth: 2,
                    r: 4,
                    stroke: "hsl(var(--background))",
                  }}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--accent))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Weight Log */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Weight Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chartData.map((entry, index) => {
              const prevWeight = index > 0 ? chartData[index - 1].weight : null;
              const change = prevWeight ? (entry.weight as number) - (prevWeight as number) : null;

              return (
                <div
                  key={entry.date}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </span>
                  <div className="flex items-center gap-3">
                    {change !== null && (
                      <span
                        className={`text-xs ${
                          change < 0
                            ? "text-green-600"
                            : change > 0
                            ? "text-accent"
                            : "text-muted-foreground"
                        }`}
                      >
                        {change > 0 ? "+" : ""}
                        {change.toFixed(1)}
                      </span>
                    )}
                    <span className="font-medium text-foreground">{entry.weight} lbs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightChart;

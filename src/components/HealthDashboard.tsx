import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHealthData } from "@/hooks/useHealthData";
import { 
  Activity, 
  Heart, 
  Moon, 
  Flame, 
  Navigation, 
  RefreshCw, 
  Smartphone,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";

const HealthDashboard = () => {
  const {
    healthData,
    isAvailable,
    isAuthorized,
    isLoading,
    error,
    requestPermissions,
    syncHealthData,
  } = useHealthData();

  if (!isAvailable) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">
            Native App Required
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Health data integration requires the native iOS or Android app. 
            Download the app to sync your Apple Health or Google Fit data.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthorized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Connect Health Data
          </CardTitle>
          <CardDescription>
            Sync your fitness data from Apple Health or Google Fit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h4 className="font-medium mb-2">We'll access:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Steps and distance</li>
              <li>• Heart rate</li>
              <li>• Sleep data</li>
              <li>• Active calories burned</li>
            </ul>
          </div>
          <Button 
            onClick={requestPermissions} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Connect Health Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: "Steps Today",
      value: healthData.steps.toLocaleString(),
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Heart Rate",
      value: healthData.heartRate ? `${healthData.heartRate} bpm` : "—",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Sleep",
      value: healthData.sleepHours ? `${healthData.sleepHours} hrs` : "—",
      icon: Moon,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Calories",
      value: healthData.activeCalories ? `${healthData.activeCalories} kcal` : "—",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Distance",
      value: healthData.distance ? `${(healthData.distance * 0.621371).toFixed(1)} mi` : "—",
      icon: Navigation,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Health Data
          </CardTitle>
          <CardDescription>
            Synced from your wearable device
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
            Connected
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={syncHealthData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-4 rounded-lg bg-secondary/30 text-center"
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-full ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div className="font-heading font-bold text-lg">
                {metric.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {healthData.lastSynced && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Last synced: {format(healthData.lastSynced, "MMM d, h:mm a")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthDashboard;

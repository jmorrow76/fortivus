import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanUpdateBannerProps {
  featureName: string;
  show: boolean;
}

export const PlanUpdateBanner = ({ featureName, show }: PlanUpdateBannerProps) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <Alert className="mb-4 border-accent/50 bg-accent/5">
      <RefreshCw className="h-4 w-4 text-accent" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm">
          Your {featureName} data has been updated. Regenerate your AI Plan to incorporate these insights.
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/my-progress")}
          className="ml-4 shrink-0"
        >
          Update Plan
        </Button>
      </AlertDescription>
    </Alert>
  );
};

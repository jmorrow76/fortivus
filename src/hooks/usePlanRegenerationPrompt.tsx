import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PlanRegenerationPromptOptions {
  featureName: string;
  dataTimestamp?: string | null;
}

export function usePlanRegenerationPrompt({ featureName, dataTimestamp }: PlanRegenerationPromptOptions) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const [latestPlanDate, setLatestPlanDate] = useState<string | null>(null);

  useEffect(() => {
    const checkPlanDate = async () => {
      if (!user?.id || !dataTimestamp) return;

      const { data: latestPlan } = await supabase
        .from("personal_plans")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestPlan) {
        setLatestPlanDate(latestPlan.created_at);
        // Show banner if the feature data was updated after the plan was generated
        const planDate = new Date(latestPlan.created_at);
        const featureDate = new Date(dataTimestamp);
        setShouldShowBanner(featureDate > planDate);
      } else {
        // No plan exists, suggest creating one
        setShouldShowBanner(true);
      }
    };

    checkPlanDate();
  }, [user?.id, dataTimestamp]);

  const showRegenerationToast = () => {
    toast.info(`${featureName} data updated`, {
      description: "Consider regenerating your AI Plan to incorporate these insights.",
      action: {
        label: "Update Plan",
        onClick: () => navigate("/my-progress"),
      },
      duration: 8000,
    });
  };

  const navigateToUpdatePlan = () => {
    navigate("/my-progress");
  };

  return {
    shouldShowBanner,
    latestPlanDate,
    showRegenerationToast,
    navigateToUpdatePlan,
  };
}

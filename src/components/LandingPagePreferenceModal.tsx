import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LayoutDashboard, Flame, Settings, Crown } from "lucide-react";

interface LandingPagePreferenceModalProps {
  open: boolean;
  onSelect: (preference: "dashboard" | "fitness-journey") => void;
}

const LandingPagePreferenceModal = ({ open, onSelect }: LandingPagePreferenceModalProps) => {
  const [selected, setSelected] = useState<"dashboard" | "fitness-journey">("fitness-journey");

  const handleConfirm = () => {
    onSelect(selected);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center font-heading text-xl">
            Choose Your Home Page
          </DialogTitle>
          <DialogDescription className="text-center">
            Where would you like to land after signing in?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          <button
            onClick={() => setSelected("fitness-journey")}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
              selected === "fitness-journey"
                ? "border-accent bg-accent/5"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Fitness Journey</h4>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Recommended</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Quick access to workouts, runs, check-ins, AI coaching & more
              </p>
            </div>
          </button>
          
          <button
            onClick={() => setSelected("dashboard")}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
              selected === "dashboard"
                ? "border-accent bg-accent/5"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Member Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Overview of stats, community feed, and leaderboard
              </p>
            </div>
          </button>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleConfirm} 
            className="w-full"
          >
            Continue
          </Button>
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Settings className="h-3 w-3" />
            You can change this anytime in Profile Settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LandingPagePreferenceModal;

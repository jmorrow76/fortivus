import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  LayoutDashboard, Flame, Trophy, Users, MessageCircle, 
  Dumbbell, TrendingUp, Utensils, ScanFace, Sparkles,
  ChevronRight, ChevronLeft, BookOpen, Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface WelcomeTourProps {
  open: boolean;
  onComplete: () => void;
  landingPage: "dashboard" | "fitness-journey";
}

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: { icon: React.ReactNode; title: string; description: string }[];
}

const dashboardSteps: TourStep[] = [
  {
    title: "Welcome to Your Dashboard",
    description: "Your central hub for tracking progress and staying connected with the community.",
    icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
    features: [
      { icon: <Trophy className="h-5 w-5 text-amber-500" />, title: "Track Your Stats", description: "See your streak, XP, and leaderboard ranking at a glance" },
      { icon: <Flame className="h-5 w-5 text-orange-500" />, title: "Daily Check-ins", description: "Log your mood and energy to get personalized recommendations" },
      { icon: <BookOpen className="h-5 w-5 text-accent" />, title: "Scripture of the Day", description: "Start each day with inspiring biblical wisdom" },
    ],
  },
  {
    title: "Community & Gamification",
    description: "Stay motivated with challenges, badges, and a supportive community of brothers.",
    icon: <Users className="h-8 w-8 text-primary" />,
    features: [
      { icon: <Target className="h-5 w-5 text-green-500" />, title: "Weekly Challenges", description: "Compete in challenges and earn XP rewards" },
      { icon: <Trophy className="h-5 w-5 text-purple-500" />, title: "Earn Badges", description: "Unlock achievements as you reach milestones" },
      { icon: <Users className="h-5 w-5 text-blue-500" />, title: "Community Feed", description: "Celebrate wins with fellow members" },
    ],
  },
  {
    title: "Training & Progress",
    description: "Access your workouts, running stats, and track your fitness journey.",
    icon: <Dumbbell className="h-8 w-8 text-primary" />,
    features: [
      { icon: <Dumbbell className="h-5 w-5 text-primary" />, title: "Workout Tracker", description: "Log exercises, sets, and personal records" },
      { icon: <TrendingUp className="h-5 w-5 text-green-500" />, title: "Running Stats", description: "Track your runs with GPS and see progress" },
      { icon: <Sparkles className="h-5 w-5 text-accent" />, title: "Quick Access", description: "Jump to Fitness Journey for AI-powered features" },
    ],
  },
];

const fitnessJourneySteps: TourStep[] = [
  {
    title: "Welcome to Fitness Journey",
    description: "Your AI-powered hub for personalized coaching, plans, and advanced tracking.",
    icon: <Flame className="h-8 w-8 text-orange-500" />,
    features: [
      { icon: <Sparkles className="h-5 w-5 text-accent" />, title: "Quick Start Guide", description: "Personalized recommendations based on your assessment" },
      { icon: <BookOpen className="h-5 w-5 text-accent" />, title: "Scripture of the Day", description: "Biblical wisdom to fuel your discipline" },
      { icon: <Target className="h-5 w-5 text-green-500" />, title: "Daily Status", description: "Track your mood and energy at a glance" },
    ],
  },
  {
    title: "AI-Powered Features",
    description: "Leverage artificial intelligence to optimize your fitness and nutrition.",
    icon: <MessageCircle className="h-8 w-8 text-primary" />,
    features: [
      { icon: <MessageCircle className="h-5 w-5 text-primary" />, title: "AI Coach", description: "Get personalized advice from your virtual coach" },
      { icon: <Utensils className="h-5 w-5 text-orange-500" />, title: "Calorie Tracking", description: "Log meals and track your macros easily" },
      { icon: <ScanFace className="h-5 w-5 text-purple-500" />, title: "Body Analysis", description: "AI-powered body composition assessment" },
    ],
  },
  {
    title: "Advanced Tools",
    description: "Access specialized features designed for men over 40.",
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    features: [
      { icon: <Dumbbell className="h-5 w-5 text-primary" />, title: "Workout Logging", description: "Track your training with detailed stats" },
      { icon: <TrendingUp className="h-5 w-5 text-green-500" />, title: "Run Tracker", description: "GPS-enabled running with pace and distance" },
      { icon: <Sparkles className="h-5 w-5 text-accent" />, title: "Elite Features", description: "Hormonal optimization, joint health, and more" },
    ],
  },
];

const WelcomeTour = ({ open, onComplete, landingPage }: WelcomeTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = landingPage === "dashboard" ? dashboardSteps : fitnessJourneySteps;
  const totalSteps = steps.length;
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
            {step.icon}
          </div>
          <DialogTitle className="text-xl font-heading">
            {step.title}
          </DialogTitle>
          <DialogDescription>
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="p-2 rounded-lg bg-background">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold text-sm">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Progress value={progress} className="h-1" />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </div>
            <div className="flex items-center gap-2">
              {currentStep === 0 ? (
                <Button variant="ghost" size="sm" onClick={handleSkip}>
                  Skip Tour
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep === totalSteps - 1 ? (
                  "Get Started"
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeTour;

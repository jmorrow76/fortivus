import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface TooltipTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

const TooltipTour = ({ steps, isOpen, onComplete, onSkip }: TooltipTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const updatePosition = useCallback(() => {
    if (!step?.target) return;

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      // Calculate tooltip position based on placement
      const tooltipWidth = 320;
      const tooltipHeight = 180;
      const padding = 16;
      const arrowOffset = 12;

      let top = 0;
      let left = 0;

      const placement = step.placement || "bottom";

      switch (placement) {
        case "top":
          top = rect.top - tooltipHeight - arrowOffset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          top = rect.bottom + arrowOffset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - arrowOffset;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + arrowOffset;
          break;
      }

      // Keep tooltip within viewport
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

      setTooltipPosition({ top, left });

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to let the page render
    const timer = setTimeout(updatePosition, 100);
    
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, currentStep, updatePosition]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip?.();
    onComplete();
  };

  if (!isOpen || !step) return null;

  const placement = step.placement || "bottom";

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with cutout for target element */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Highlight border around target */}
      {targetRect && (
        <div
          className="absolute rounded-lg border-2 border-primary shadow-lg shadow-primary/30 pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "absolute w-80 bg-card border border-border rounded-lg shadow-xl pointer-events-auto transition-all duration-300",
          "animate-in fade-in-0 zoom-in-95"
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Arrow */}
        <div
          className={cn(
            "absolute w-3 h-3 bg-card border-border rotate-45",
            placement === "top" && "bottom-[-7px] left-1/2 -translate-x-1/2 border-r border-b",
            placement === "bottom" && "top-[-7px] left-1/2 -translate-x-1/2 border-l border-t",
            placement === "left" && "right-[-7px] top-1/2 -translate-y-1/2 border-r border-t",
            placement === "right" && "left-[-7px] top-1/2 -translate-y-1/2 border-l border-b"
          )}
        />

        <div className="p-4">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Step indicator */}
          <div className="flex gap-1 mb-3">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  index === currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Content */}
          <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {isLastStep ? (
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
      </div>
    </div>,
    document.body
  );
};

// Pre-defined tour configurations
export const dashboardTourSteps: TourStep[] = [
  {
    target: '[data-tour="elite-dropdown"]',
    title: "Elite Features",
    description: "Access all premium features including AI Coach, Workouts, Run Tracker, and advanced health tools designed for men over 40.",
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-knowledge-hub"]',
    title: "Knowledge Hub",
    description: "Expert articles on fitness, nutrition, recovery, and faith-based wellness. New content added weekly.",
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-forum"]',
    title: "Community Forum",
    description: "Connect with fellow brothers, share prayer requests, ask questions, and encourage one another.",
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-dashboard"]',
    title: "Member Dashboard",
    description: "Your central hub for streaks, XP, badges, challenges, and community activity at a glance.",
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-fitness-journey"]',
    title: "Fitness Journey",
    description: "Access your personalized AI coaching, body analysis, calorie tracking, and all premium Elite features.",
    placement: "bottom",
  },
];

export const fitnessJourneyTourSteps: TourStep[] = [
  {
    target: '[data-tour="scripture"]',
    title: "Daily Scripture",
    description: "Start your day with biblical wisdom focused on discipline, perseverance, and stewardship of your body.",
    placement: "bottom",
  },
  {
    target: '[data-tour="quick-start"]',
    title: "Quick Start Guide",
    description: "Personalized recommendations based on your assessment. Get workout, nutrition, and schedule guidance tailored to your goals.",
    placement: "bottom",
  },
  {
    target: '[data-tour="feature-nav"]',
    title: "Feature Navigation",
    description: "Access all Elite features from here: AI coaching, calorie tracking, workouts, body analysis, and advanced tools designed for men over 40.",
    placement: "bottom",
  },
];

export default TooltipTour;

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2, Utensils, AlertTriangle, Lightbulb, Plus, Upload, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingQuery } from "@/hooks/queries";
import { useNativeCamera } from "@/hooks/useNativeCamera";

interface MenuRecommendation {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
}

interface MenuAvoid {
  name: string;
  reason: string;
}

interface MenuAnalysis {
  recommendations?: MenuRecommendation[];
  avoid?: MenuAvoid[];
  tip?: string;
  rawResponse?: string;
}

interface MenuAnalyzerProps {
  dailyProgress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  macroGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onLogMeal?: (item: MenuRecommendation, mealType: string) => void;
}

const MenuAnalyzer = ({ dailyProgress, macroGoals, onLogMeal }: MenuAnalyzerProps) => {
  const { toast } = useToast();
  const { data: onboardingData } = useOnboardingQuery();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MenuAnalysis | null>(null);
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { takePhoto, isNative } = useNativeCamera();

  const analyzeMenu = async (base64: string) => {
    setAnalyzing(true);
    setAnalysis(null);
    setMenuImage(base64);

    try {
      // Prepare goals from onboarding data
      const goals = onboardingData ? {
        fitnessGoal: onboardingData.fitness_goal,
        experienceLevel: onboardingData.experience_level,
        dietaryPreference: onboardingData.dietary_preference,
      } : {};

      // Call edge function
      const { data, error } = await supabase.functions.invoke('analyze-menu', {
        body: {
          imageBase64: base64,
          goals,
          dailyProgress,
          macroGoals,
        },
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Menu analyzed!",
          description: "Here are your personalized recommendations.",
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Menu analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze menu. Please try again.",
        variant: "destructive",
      });
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTakePhoto = async () => {
    if (isNative) {
      const result = await takePhoto();
      if (result?.dataUrl) {
        await analyzeMenu(result.dataUrl);
      }
    } else {
      // Fallback for web - trigger file input with camera
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) await handleFile(file);
      };
      input.click();
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFile = async (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please use an image under 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await analyzeMenu(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await handleFile(file);
  };

  const handleLogItem = (item: MenuRecommendation) => {
    if (onLogMeal) {
      onLogMeal(item, 'lunch');
      toast({
        title: "Added to tracker",
        description: `${item.name} logged to your calorie tracker.`,
      });
    }
  };

  const remainingCalories = macroGoals.calories - dailyProgress.calories;
  const remainingProtein = macroGoals.protein - dailyProgress.protein;

  const getRecommendationLabel = (index: number) => {
    const labels = ["Recommended #1", "Recommended #2", "Recommended #3"];
    return labels[index] || `Recommended #${index + 1}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            AI Menu Advisor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Take a photo or upload a restaurant menu to get personalized recommendations based on your 
            remaining macros ({remainingCalories} cal, {remainingProtein}g protein left today).
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={analyzing}
          />

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              disabled={analyzing}
              onClick={handleTakePhoto}
            >
              {analyzing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
              <span className="text-sm">Take Photo</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              disabled={analyzing}
              onClick={handleUpload}
            >
              {analyzing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
              <span className="text-sm">Upload Menu</span>
            </Button>
          </div>

          {menuImage && !analyzing && (
            <div className="mt-4">
              <img 
                src={menuImage} 
                alt="Menu" 
                className="w-full max-h-48 object-contain rounded-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {analysis && (
        <>
          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Top Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.recommendations.map((item, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {getRecommendationLabel(index)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg">{item.name}</h4>
                      </div>
                      {onLogMeal && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleLogItem(item)}
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Log
                        </Button>
                      )}
                    </div>
                    
                    <div className="mt-3 p-3 rounded-md bg-background/50 border border-border/50">
                      <p className="text-sm font-medium text-muted-foreground">Why this choice:</p>
                      <p className="text-sm mt-1">{item.reason}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-3 text-center text-sm">
                      <div className="p-2 rounded bg-background">
                        <div className="font-semibold">{item.calories}</div>
                        <div className="text-xs text-muted-foreground">cal</div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="font-semibold">{item.protein}g</div>
                        <div className="text-xs text-muted-foreground">protein</div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="font-semibold">{item.carbs}g</div>
                        <div className="text-xs text-muted-foreground">carbs</div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="font-semibold">{item.fat}g</div>
                        <div className="text-xs text-muted-foreground">fat</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* What to Avoid */}
          {analysis.avoid && analysis.avoid.length > 0 && (
            <Card className="border-destructive/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  What to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.avoid.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg bg-destructive/5">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tip */}
          {analysis.tip && (
            <Card className="border-accent/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm">{analysis.tip}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Response Fallback */}
          {analysis.rawResponse && !analysis.recommendations && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm whitespace-pre-wrap">{analysis.rawResponse}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default MenuAnalyzer;

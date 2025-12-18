import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MealType, MEAL_TYPES } from '@/hooks/useCalorieTracker';
import { useNativeCamera } from '@/hooks/useNativeCamera';
import { Capacitor } from '@capacitor/core';
import { cn } from '@/lib/utils';

interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AnalysisResult {
  items: FoodItem[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  confidence?: string;
  notes?: string;
  error?: string;
}

interface FoodPhotoAnalyzerProps {
  onLogMeal: (
    foodId: string | null,
    servings: number,
    mealType: MealType,
    customFood?: { name: string; calories: number; protein: number; carbs: number; fat: number }
  ) => Promise<boolean>;
  addFoodAndLog?: (
    foodData: { name: string; calories: number; protein: number; carbs: number; fat: number },
    servings: number,
    mealType: MealType
  ) => Promise<boolean>;
  onClose: () => void;
}

export function FoodPhotoAnalyzer({ onLogMeal, addFoodAndLog, onClose }: FoodPhotoAnalyzerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [logging, setLogging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { takePhoto, pickFromGallery, isNative } = useNativeCamera();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = async () => {
    if (isNative) {
      try {
        const result = await takePhoto();
        if (result?.dataUrl) {
          setImagePreview(result.dataUrl);
          setAnalysis(null);
        }
      } catch (err: any) {
        console.error('[FoodPhotoAnalyzer] Camera error:', err);
        const errorMessage = err?.message || String(err);
        if (!errorMessage.includes('cancelled') && !errorMessage.includes('canceled') && !errorMessage.includes('User cancelled')) {
          toast.error('Unable to access camera. Please check your permissions in Settings.');
        }
      }
    } else {
      // Fallback for web - use file input with capture
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
      }
    }
  };

  const handleGallerySelect = async () => {
    if (isNative) {
      try {
        const result = await pickFromGallery();
        if (result?.dataUrl) {
          setImagePreview(result.dataUrl);
          setAnalysis(null);
        }
      } catch (err: any) {
        console.error('[FoodPhotoAnalyzer] Gallery error:', err);
        const errorMessage = err?.message || String(err);
        if (!errorMessage.includes('cancelled') && !errorMessage.includes('canceled') && !errorMessage.includes('User cancelled')) {
          toast.error('Unable to access photo library. Please check your permissions in Settings.');
        }
      }
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
      }
    }
  };

  const analyzePhoto = async () => {
    if (!imagePreview) return;

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-food-photo', {
        body: { imageBase64: imagePreview }
      });

      if (error) {
        console.error('Error analyzing photo:', error);
        toast.error('Failed to analyze photo');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setAnalysis(data);
        return;
      }

      setAnalysis(data);
      toast.success('Food analyzed successfully!');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to analyze photo');
    } finally {
      setAnalyzing(false);
    }
  };

  const logAnalyzedMeal = async (mealType: MealType) => {
    if (!analysis || !analysis.items.length) return;

    setLogging(true);
    setSelectedMealType(mealType);

    try {
      // Log each food item - save to shared database if addFoodAndLog is provided
      for (const item of analysis.items) {
        const foodData = {
          name: `${item.name} (${item.portion})`,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat
        };

        if (addFoodAndLog) {
          // Save to shared database and log
          await addFoodAndLog(foodData, 1, mealType);
        } else {
          // Fallback to custom food logging
          await onLogMeal(null, 1, mealType, foodData);
        }
      }

      toast.success(`Added ${analysis.items.length} item(s) to ${mealType}`);
      onClose();
    } catch (err) {
      console.error('Error logging meal:', err);
      toast.error('Failed to log meal');
    } finally {
      setLogging(false);
    }
  };

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Image capture/upload section */}
      {!imagePreview ? (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-24 flex-col gap-2"
              onClick={handleCameraCapture}
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs">Take Photo</span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-24 flex-col gap-2"
              onClick={handleGallerySelect}
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs">Upload Photo</span>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            <strong>Take a photo of your actual food</strong> (plate, meal, snack) and AI will estimate the calories and macros
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image preview */}
          <div className="relative">
            <img
              src={imagePreview}
              alt="Food preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => {
                setImagePreview(null);
                setAnalysis(null);
              }}
            >
              Change
            </Button>
          </div>

          {/* Analyze button */}
          {!analysis && (
            <Button
              onClick={analyzePhoto}
              disabled={analyzing}
              className="w-full gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Food
                </>
              )}
            </Button>
          )}

          {/* Analysis results */}
          {analysis && !analysis.error && (
            <div className="space-y-3">
              {/* Confidence indicator */}
              {analysis.confidence && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className={cn("w-4 h-4", getConfidenceColor(analysis.confidence))} />
                  <span className={getConfidenceColor(analysis.confidence)}>
                    {analysis.confidence.charAt(0).toUpperCase() + analysis.confidence.slice(1)} confidence
                  </span>
                </div>
              )}

              {/* Food items */}
              <div className="space-y-2">
                {analysis.items.map((item, index) => (
                  <Card key={index} className="bg-secondary/50">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.portion}</p>
                        </div>
                        <p className="font-semibold text-sm">{item.calories} kcal</p>
                      </div>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>P: {item.protein}g</span>
                        <span>C: {item.carbs}g</span>
                        <span>F: {item.fat}g</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Total */}
              <Card className="bg-accent/10 border-accent/20">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">{analysis.total.calories} kcal</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                    <span>Protein: {analysis.total.protein}g</span>
                    <span>Carbs: {analysis.total.carbs}g</span>
                    <span>Fat: {analysis.total.fat}g</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {analysis.notes && (
                <p className="text-xs text-muted-foreground italic">{analysis.notes}</p>
              )}

              {/* Quick add buttons for each meal type */}
              <div className="space-y-3 pt-3 border-t">
                <Label className="text-center block">Add to Calorie Tracker</Label>
                <div className="grid grid-cols-2 gap-2">
                  {MEAL_TYPES.map((type) => (
                    <Button
                      key={type}
                      variant={type === 'snack' ? 'outline' : 'default'}
                      onClick={() => logAnalyzedMeal(type)}
                      disabled={logging}
                      className="capitalize"
                    >
                      {logging && selectedMealType === type ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {analysis?.error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {analysis.error}
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

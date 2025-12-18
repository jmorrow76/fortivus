import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Loader2, Sparkles, CheckCircle, AlertCircle, ScanBarcode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MealType, MEAL_TYPES } from '@/hooks/useCalorieTracker';
import { useNativeCamera } from '@/hooks/useNativeCamera';
import { cn } from '@/lib/utils';

interface NutritionData {
  name: string;
  brand?: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  confidence?: string;
  notes?: string;
  error?: string;
}

interface NutritionLabelScannerProps {
  addFoodAndLog: (
    foodData: { name: string; calories: number; protein: number; carbs: number; fat: number },
    servings: number,
    mealType: MealType
  ) => Promise<boolean>;
  onClose: () => void;
}

export function NutritionLabelScanner({ addFoodAndLog, onClose }: NutritionLabelScannerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('snack');
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
      setNutritionData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = async () => {
    if (isNative) {
      try {
        const result = await takePhoto();
        if (result?.dataUrl) {
          setImagePreview(result.dataUrl);
          setNutritionData(null);
        }
      } catch (err: any) {
        console.error('[NutritionLabelScanner] Camera error:', err);
        const errorMessage = err?.message || String(err);
        if (!errorMessage.includes('cancelled') && !errorMessage.includes('canceled') && !errorMessage.includes('User cancelled')) {
          toast.error('Unable to access camera. Please check your permissions in Settings.');
        }
      }
    } else {
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
          setNutritionData(null);
        }
      } catch (err: any) {
        console.error('[NutritionLabelScanner] Gallery error:', err);
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

  const analyzeLabel = async () => {
    if (!imagePreview) return;

    setAnalyzing(true);
    setNutritionData(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-nutrition-label', {
        body: { imageBase64: imagePreview }
      });

      if (error) {
        console.error('Error analyzing label:', error);
        toast.error('Failed to analyze nutrition label');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setNutritionData(data);
        return;
      }

      setNutritionData(data);
      toast.success('Nutrition label analyzed!');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to analyze nutrition label');
    } finally {
      setAnalyzing(false);
    }
  };

  const logFood = async (mealType: MealType) => {
    if (!nutritionData || nutritionData.error) return;

    setLogging(true);
    setSelectedMealType(mealType);

    try {
      const foodName = nutritionData.brand 
        ? `${nutritionData.name} (${nutritionData.brand})`
        : nutritionData.name;

      const success = await addFoodAndLog(
        {
          name: foodName,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat
        },
        1,
        mealType
      );

      if (success) {
        toast.success(`Added ${foodName} to ${mealType}`);
        onClose();
      }
    } catch (err) {
      console.error('Error logging food:', err);
      toast.error('Failed to log food');
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
      {!imagePreview ? (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-24 flex-col gap-2"
              onClick={handleCameraCapture}
            >
              <ScanBarcode className="w-6 h-6" />
              <span className="text-xs">Scan Label</span>
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
            Scan a nutrition label or barcode to automatically extract food data. This food will be saved for all users to search.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Label preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => {
                setImagePreview(null);
                setNutritionData(null);
              }}
            >
              Change
            </Button>
          </div>

          {!nutritionData && (
            <Button
              onClick={analyzeLabel}
              disabled={analyzing}
              className="w-full gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Label...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Extract Nutrition Info
                </>
              )}
            </Button>
          )}

          {nutritionData && !nutritionData.error && (
            <div className="space-y-3">
              {nutritionData.confidence && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className={cn("w-4 h-4", getConfidenceColor(nutritionData.confidence))} />
                  <span className={getConfidenceColor(nutritionData.confidence)}>
                    {nutritionData.confidence.charAt(0).toUpperCase() + nutritionData.confidence.slice(1)} confidence
                  </span>
                </div>
              )}

              <Card className="bg-secondary/50">
                <CardContent className="p-3 space-y-2">
                  <div>
                    <p className="font-medium">{nutritionData.name}</p>
                    {nutritionData.brand && (
                      <p className="text-xs text-muted-foreground">{nutritionData.brand}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Serving: {nutritionData.serving_size}{nutritionData.serving_unit}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calories</span>
                      <span className="font-semibold">{nutritionData.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protein</span>
                      <span className="font-semibold">{nutritionData.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carbs</span>
                      <span className="font-semibold">{nutritionData.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fat</span>
                      <span className="font-semibold">{nutritionData.fat}g</span>
                    </div>
                    {nutritionData.fiber !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fiber</span>
                        <span className="font-semibold">{nutritionData.fiber}g</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {nutritionData.notes && (
                <p className="text-xs text-muted-foreground italic">{nutritionData.notes}</p>
              )}

              <div className="space-y-3 pt-3 border-t">
                <Label className="text-center block">Add to Calorie Tracker</Label>
                <div className="grid grid-cols-2 gap-2">
                  {MEAL_TYPES.map((type) => (
                    <Button
                      key={type}
                      variant={type === 'snack' ? 'outline' : 'default'}
                      onClick={() => logFood(type)}
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

          {nutritionData?.error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {nutritionData.error}
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

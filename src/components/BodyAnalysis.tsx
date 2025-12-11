import { useState, useRef } from 'react';
import { Upload, Camera, Loader2, TrendingUp, Apple, Dumbbell, Moon, AlertCircle, CheckCircle, Target, Lightbulb, User, Sun, Save, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BodyAnalysisHistory from './BodyAnalysisHistory';

interface AnalysisResult {
  bodyFatPercentage: number;
  bodyFatCategory: string;
  muscleAssessment: string;
  strengths: string[];
  areasToImprove: string[];
  recommendations: {
    nutrition: string;
    training: string;
    recovery: string;
  };
  estimatedTimeframe: string;
  disclaimer: string;
}

const BodyAnalysis = () => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-body`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64: selectedImage }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data.analysis);
      setSaved(false);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze image';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!result || !user) {
      toast.error('Please complete an analysis first');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('body_analysis_results')
        .insert({
          user_id: user.id,
          body_fat_percentage: result.bodyFatPercentage,
          body_fat_category: result.bodyFatCategory,
          muscle_assessment: result.muscleAssessment,
          strengths: result.strengths,
          areas_to_improve: result.areasToImprove,
          nutrition_recommendation: result.recommendations.nutrition,
          training_recommendation: result.recommendations.training,
          recovery_recommendation: result.recommendations.recovery,
          estimated_timeframe: result.estimatedTimeframe,
        });

      if (error) throw error;

      setSaved(true);
      toast.success('Analysis saved! It will be used to personalize your AI fitness plans.');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setResult(null);
    setErrorMessage(null);
    setSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Athletic':
        return 'text-emerald-600';
      case 'Fit':
        return 'text-green-600';
      case 'Average':
        return 'text-amber-600';
      case 'Above Average':
        return 'text-orange-600';
      default:
        return 'text-red-600';
    }
  };

  return (
    <section id="analysis" className="section-padding bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="section-header">
          <span className="section-label">AI-Powered</span>
          <h2 className="section-title">
            Body Composition <span className="text-accent">Analysis</span>
          </h2>
          <p className="section-description">
            Upload a photo and get an AI-powered estimate of your body fat percentage 
            with personalized recommendations tailored for men over 40.
          </p>
        </div>

        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="analyze" className="gap-2">
              <Camera className="w-4 h-4" />
              New Analysis
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History & Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card variant="default" className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-accent" />
                Upload Your Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent/50 hover:bg-secondary/50 transition-all duration-200"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground/70">PNG, JPG up to 10MB</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-80 object-contain rounded-lg bg-secondary"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAnalysis}
                    className="absolute top-2 right-2"
                  >
                    Change Photo
                  </Button>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={analyzeImage}
                  disabled={!selectedImage || isAnalyzing}
                  className="flex-1"
                  variant="default"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Analyze Body Composition
                    </>
                  )}
                </Button>
              </div>

              {/* Photo Tips */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  Photo Tips for Best Results
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Pose</p>
                      <p className="text-xs text-muted-foreground">Stand relaxed, arms at sides or slightly away. Front or 45° angle works best.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sun className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Lighting</p>
                      <p className="text-xs text-muted-foreground">Natural light or bright, even lighting. Avoid harsh shadows or backlight.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Camera className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Framing</p>
                      <p className="text-xs text-muted-foreground">Torso clearly visible. Minimal clothing for accurate assessment.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>🔒 Your photo is processed securely and not stored</p>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {!result && !isAnalyzing && !errorMessage && (
              <Card variant="default" className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    Upload a photo to receive your personalized analysis
                  </p>
                </CardContent>
              </Card>
            )}

            {errorMessage && !isAnalyzing && (
              <Card variant="default" className="h-full flex items-center justify-center min-h-[400px] border-destructive/50">
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive/70" />
                  <p className="text-destructive font-medium mb-2">Analysis Failed</p>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    {errorMessage}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={resetAnalysis}
                  >
                    Try a Different Photo
                  </Button>
                </CardContent>
              </Card>
            )}

            {isAnalyzing && (
              <Card variant="default" className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-12">
                  <Loader2 className="w-16 h-16 mx-auto mb-4 text-accent animate-spin" />
                  <p className="text-muted-foreground">Analyzing your body composition...</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">This may take a few seconds</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <>
                {/* Main Stats */}
                <Card variant="premium">
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <div className="text-5xl font-heading font-bold text-accent mb-2">
                        {result.bodyFatPercentage}%
                      </div>
                      <div className={`text-lg font-semibold ${getCategoryColor(result.bodyFatCategory)}`}>
                        {result.bodyFatCategory}
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm">{result.muscleAssessment}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <h4 className="font-semibold text-emerald-600 flex items-center gap-2 mb-2 text-sm">
                          <CheckCircle className="w-4 h-4" /> Strengths
                        </h4>
                        <ul className="space-y-1">
                          {result.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-600 flex items-center gap-2 mb-2 text-sm">
                          <Target className="w-4 h-4" /> Areas to Improve
                        </h4>
                        <ul className="space-y-1">
                          {result.areasToImprove.map((a, i) => (
                            <li key={i} className="text-sm text-muted-foreground">• {a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <div className="grid gap-4">
                  <Card variant="default">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                        <Apple className="w-4 h-4 text-emerald-600" /> Nutrition
                      </h4>
                      <p className="text-sm text-muted-foreground">{result.recommendations.nutrition}</p>
                    </CardContent>
                  </Card>

                  <Card variant="default">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                        <Dumbbell className="w-4 h-4 text-accent" /> Training
                      </h4>
                      <p className="text-sm text-muted-foreground">{result.recommendations.training}</p>
                    </CardContent>
                  </Card>

                  <Card variant="default">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                        <Moon className="w-4 h-4 text-blue-600" /> Recovery
                      </h4>
                      <p className="text-sm text-muted-foreground">{result.recommendations.recovery}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Save & Actions */}
                <Card variant="default">
                  <CardContent className="pt-4">
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      <strong className="text-foreground">Estimated timeframe to next level:</strong>{' '}
                      {result.estimatedTimeframe}
                    </p>
                    
                    {/* Save Button */}
                    <div className="flex justify-center gap-3 mb-4">
                      <Button
                        onClick={handleSaveAnalysis}
                        disabled={isSaving || saved || !user}
                        className="gap-2"
                      >
                        {isSaving ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                        ) : saved ? (
                          <><CheckCircle className="h-4 w-4" /> Saved for AI Plans</>
                        ) : (
                          <><Save className="h-4 w-4" /> Save for AI Plan</>
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetAnalysis}>
                        Analyze Another
                      </Button>
                    </div>
                    
                    {saved && (
                      <p className="text-sm text-center text-accent mb-4">
                        ✓ This analysis will be used to personalize your next AI fitness plan
                      </p>
                    )}
                    
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary rounded-md p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{result.disclaimer}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
          </TabsContent>

          <TabsContent value="history">
            <BodyAnalysisHistory />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default BodyAnalysis;

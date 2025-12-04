import { useState, useRef } from 'react';
import { Upload, Camera, Loader2, TrendingUp, Apple, Dumbbell, Moon, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
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
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Athletic':
        return 'text-green-400';
      case 'Fit':
        return 'text-emerald-400';
      case 'Average':
        return 'text-yellow-400';
      case 'Above Average':
        return 'text-orange-400';
      default:
        return 'text-red-400';
    }
  };

  return (
    <section id="analysis" className="py-24 px-4 bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold tracking-wider uppercase text-sm">AI-Powered</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            Body Composition <span className="text-primary">Analysis</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload a photo and get an AI-powered estimate of your body fat percentage 
            with personalized recommendations tailored for men over 40.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card variant="glass" className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
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
                  className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
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
                    className="w-full h-80 object-contain rounded-xl bg-black/20"
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
                  variant="gold"
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

              <div className="text-xs text-muted-foreground/70 space-y-1">
                <p>💡 For best results, use a well-lit front or side photo</p>
                <p>🔒 Your photo is processed securely and not stored</p>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {!result && !isAnalyzing && (
              <Card variant="glass" className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    Upload a photo to receive your personalized analysis
                  </p>
                </CardContent>
              </Card>
            )}

            {isAnalyzing && (
              <Card variant="glass" className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-12">
                  <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
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
                      <div className="text-6xl font-bold text-primary mb-2">
                        {result.bodyFatPercentage}%
                      </div>
                      <div className={`text-xl font-semibold ${getCategoryColor(result.bodyFatCategory)}`}>
                        {result.bodyFatCategory}
                      </div>
                      <p className="text-muted-foreground mt-2">{result.muscleAssessment}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <h4 className="font-semibold text-green-400 flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4" /> Strengths
                        </h4>
                        <ul className="space-y-1">
                          {result.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-400 flex items-center gap-2 mb-2">
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
                  <Card variant="glass">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Apple className="w-4 h-4 text-green-400" /> Nutrition
                      </h4>
                      <p className="text-sm text-muted-foreground">{result.recommendations.nutrition}</p>
                    </CardContent>
                  </Card>

                  <Card variant="glass">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Dumbbell className="w-4 h-4 text-primary" /> Training
                      </h4>
                      <p className="text-sm text-muted-foreground">{result.recommendations.training}</p>
                    </CardContent>
                  </Card>

                  <Card variant="glass">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Moon className="w-4 h-4 text-blue-400" /> Recovery
                      </h4>
                      <p className="text-sm text-muted-foreground">{result.recommendations.recovery}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeframe & Disclaimer */}
                <Card variant="glass">
                  <CardContent className="pt-4">
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      <strong className="text-foreground">Estimated timeframe to next level:</strong>{' '}
                      {result.estimatedTimeframe}
                    </p>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground/70 bg-muted/20 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{result.disclaimer}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BodyAnalysis;

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, Scale, ArrowRight, Sparkles, Loader2, TrendingUp, Target, Heart, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_date: string;
  weight: number | null;
  notes: string | null;
  created_at: string;
}

interface PhotoComparisonProps {
  photos: ProgressPhoto[];
}

interface AIAnalysis {
  overallAssessment: string;
  bodyCompositionChanges: string[];
  muscleImprovements: string[];
  postureNotes: string;
  estimatedBodyFatChange: string;
  topImprovements: string[];
  focusAreas: string[];
  encouragement: string;
}

const PhotoComparison = ({ photos }: PhotoComparisonProps) => {
  const [beforeId, setBeforeId] = useState<string>("");
  const [afterId, setAfterId] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const { toast } = useToast();

  const beforePhoto = photos.find((p) => p.id === beforeId);
  const afterPhoto = photos.find((p) => p.id === afterId);

  const weightDiff = beforePhoto?.weight && afterPhoto?.weight
    ? (afterPhoto.weight - beforePhoto.weight).toFixed(1)
    : null;

  const daysBetween = beforePhoto && afterPhoto
    ? Math.abs(
        Math.ceil(
          (new Date(afterPhoto.photo_date).getTime() -
            new Date(beforePhoto.photo_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const handleAnalyze = async () => {
    if (!beforePhoto || !afterPhoto) return;

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-photo-comparison', {
        body: {
          beforeImageUrl: beforePhoto.photo_url,
          afterImageUrl: afterPhoto.photo_url,
          beforeDate: format(new Date(beforePhoto.photo_date), "MMMM d, yyyy"),
          afterDate: format(new Date(afterPhoto.photo_date), "MMMM d, yyyy"),
          beforeWeight: beforePhoto.weight,
          afterWeight: afterPhoto.weight,
          daysBetween
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Your transformation has been analyzed.",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Unable to analyze photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Reset analysis when photos change
  const handleBeforeChange = (value: string) => {
    setBeforeId(value);
    setAnalysis(null);
  };

  const handleAfterChange = (value: string) => {
    setAfterId(value);
    setAnalysis(null);
  };

  if (photos.length < 2) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">
            You need at least 2 photos to use the comparison view.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Before Photo</Label>
          <Select value={beforeId} onValueChange={handleBeforeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a photo" />
            </SelectTrigger>
            <SelectContent>
              {photos.map((photo) => (
                <SelectItem key={photo.id} value={photo.id} disabled={photo.id === afterId}>
                  {format(new Date(photo.photo_date), "MMM d, yyyy")}
                  {photo.weight && ` - ${photo.weight} lbs`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>After Photo</Label>
          <Select value={afterId} onValueChange={handleAfterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a photo" />
            </SelectTrigger>
            <SelectContent>
              {photos.map((photo) => (
                <SelectItem key={photo.id} value={photo.id} disabled={photo.id === beforeId}>
                  {format(new Date(photo.photo_date), "MMM d, yyyy")}
                  {photo.weight && ` - ${photo.weight} lbs`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before */}
        <Card className="shadow-card overflow-hidden">
          <div className="aspect-[3/4] bg-muted flex items-center justify-center">
            {beforePhoto ? (
              <img
                src={beforePhoto.photo_url}
                alt="Before"
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Select a "Before" photo</p>
            )}
          </div>
          {beforePhoto && (
            <CardContent className="p-4 border-t border-border">
              <p className="font-medium text-foreground mb-2">Before</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(beforePhoto.photo_date), "MMM d, yyyy")}
                </span>
                {beforePhoto.weight && (
                  <span className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    {beforePhoto.weight} lbs
                  </span>
                )}
              </div>
              {beforePhoto.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{beforePhoto.notes}</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* After */}
        <Card className="shadow-card overflow-hidden">
          <div className="aspect-[3/4] bg-muted flex items-center justify-center">
            {afterPhoto ? (
              <img
                src={afterPhoto.photo_url}
                alt="After"
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Select an "After" photo</p>
            )}
          </div>
          {afterPhoto && (
            <CardContent className="p-4 border-t border-border">
              <p className="font-medium text-foreground mb-2">After</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(afterPhoto.photo_date), "MMM d, yyyy")}
                </span>
                {afterPhoto.weight && (
                  <span className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    {afterPhoto.weight} lbs
                  </span>
                )}
              </div>
              {afterPhoto.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{afterPhoto.notes}</p>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Stats Summary */}
      {beforePhoto && afterPhoto && (
        <Card className="shadow-card bg-secondary/50">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Time Span</p>
                <p className="font-heading text-lg font-semibold text-foreground">
                  {daysBetween} days
                </p>
              </div>
              {weightDiff && (
                <>
                  <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                  <div>
                    <p className="text-sm text-muted-foreground">Weight Change</p>
                    <p
                      className={`font-heading text-lg font-semibold ${
                        parseFloat(weightDiff) < 0 ? "text-green-600" : parseFloat(weightDiff) > 0 ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {parseFloat(weightDiff) > 0 ? "+" : ""}
                      {weightDiff} lbs
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Button */}
      {beforePhoto && afterPhoto && !analysis && (
        <div className="flex justify-center">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            size="lg"
            className="gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing Transformation...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Analyze with AI
              </>
            )}
          </Button>
        </div>
      )}

      {/* AI Analysis Results */}
      {analysis && (
        <Card className="shadow-elevated border-accent/20">
          <CardContent className="py-6 space-y-6">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-heading text-lg font-semibold">AI Transformation Analysis</h3>
            </div>

            {/* Overall Assessment */}
            <div className="bg-accent/10 rounded-lg p-4">
              <p className="text-foreground">{analysis.overallAssessment}</p>
            </div>

            {/* Top Improvements */}
            {analysis.topImprovements && analysis.topImprovements.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Top Improvements
                </h4>
                <ul className="space-y-2">
                  {analysis.topImprovements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Body Composition Changes */}
              {analysis.bodyCompositionChanges && analysis.bodyCompositionChanges.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Body Composition</h4>
                  <ul className="space-y-1">
                    {analysis.bodyCompositionChanges.map((change, index) => (
                      <li key={index} className="text-sm text-muted-foreground">• {change}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Muscle Improvements */}
              {analysis.muscleImprovements && analysis.muscleImprovements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Muscle Development</h4>
                  <ul className="space-y-1">
                    {analysis.muscleImprovements.map((improvement, index) => (
                      <li key={index} className="text-sm text-muted-foreground">• {improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Estimated Body Fat Change */}
            {analysis.estimatedBodyFatChange && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Estimated Body Fat Change:</span>{" "}
                  {analysis.estimatedBodyFatChange}
                </p>
              </div>
            )}

            {/* Focus Areas */}
            {analysis.focusAreas && analysis.focusAreas.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  Continue Focusing On
                </h4>
                <ul className="space-y-2">
                  {analysis.focusAreas.map((area, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {area}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Encouragement */}
            {analysis.encouragement && (
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-foreground italic">{analysis.encouragement}</p>
                </div>
              </div>
            )}

            {/* Analyze Again Button */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={handleAnalyze}
                disabled={analyzing}
                className="gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Re-analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze Again
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PhotoComparison;

import { useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingQuery } from "@/hooks/queries";
import { 
  ArrowLeft, Sparkles, Camera, TrendingUp, Lock, Crown, Lightbulb,
  MessageCircle, Utensils, Battery, Shield, Moon, RotateCcw, Briefcase, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BodyAnalysisComponent from "@/components/BodyAnalysis";
import PersonalizedRecommendations from "@/components/dashboard/PersonalizedRecommendations";
import { getPersonalizedRecommendations } from "@/lib/onboardingUtils";

// Import Progress Photos components
import PhotoComparison from "@/components/PhotoComparison";
import WeightChart from "@/components/WeightChart";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, Trash2, Calendar, Scale, LayoutGrid, Columns, LineChart } from "lucide-react";
import { format } from "date-fns";

interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_date: string;
  weight: number | null;
  notes: string | null;
  created_at: string;
}

const MyProgress = () => {
  const navigate = useNavigate();
  const { user, loading, subscription } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'guide';
  const { toast } = useToast();

  // Onboarding data for Quick Start Guide
  const { data: onboardingData, isLoading: onboardingLoading } = useOnboardingQuery();
  const recommendations = useMemo(() => getPersonalizedRecommendations(onboardingData), [onboardingData]);

  // Progress Photos state
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoDate, setPhotoDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [photosTab, setPhotosTab] = useState("grid");
  
  // Today's Status state
  const [latestCheckin, setLatestCheckin] = useState<{ mood_level: number; energy_level: number; check_in_date: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { from: "/my-progress" } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && subscription.subscribed) {
      fetchPhotos();
      fetchTodayStatus();
    }
  }, [user, subscription.subscribed]);

  const fetchTodayStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("mood_checkins")
        .select("mood_level, energy_level, check_in_date")
        .eq("user_id", user.id)
        .order("check_in_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) setLatestCheckin(data);
    } catch (error) {
      console.error("Error fetching check-in:", error);
    }
  };

  const fetchPhotos = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("progress_photos")
        .select("*")
        .eq("user_id", user.id)
        .order("photo_date", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setPhotosLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!photoFile || !user) return;

    setUploading(true);
    try {
      const fileExt = photoFile.name.split(".").pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(filePath, photoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("progress-photos")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("progress_photos")
        .insert({
          user_id: user.id,
          photo_url: publicUrl,
          photo_date: photoDate,
          weight: weight ? parseFloat(weight) : null,
          notes: notes || null,
        });

      if (insertError) throw insertError;

      toast({ title: "Photo uploaded!", description: "Your progress photo has been saved." });
      setDialogOpen(false);
      setPhotoFile(null);
      setWeight("");
      setNotes("");
      fetchPhotos();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string, photoUrl: string) => {
    if (!user) return;
    setDeleting(photoId);
    try {
      const urlParts = photoUrl.split("/");
      const fileName = urlParts.slice(-2).join("/");

      await supabase.storage.from("progress-photos").remove([fileName]);
      const { error } = await supabase.from("progress_photos").delete().eq("id", photoId);

      if (error) throw error;

      toast({ title: "Photo deleted" });
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Non-subscribed users see upgrade prompt
  if (!subscription.subscribed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-40 md:pt-28 pb-16 px-4">
          <div className="container max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>

            <Card className="text-center">
              <CardContent className="py-12 px-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-accent" />
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                  Elite Members Only
                </h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Fitness Journey features are available exclusively to Fortivus Elite members. 
                  Upgrade to unlock AI coaching, body analysis, personalized plans, and more.
                </p>
                
                <div className="space-y-4">
                  <Button size="lg" className="w-full sm:w-auto" asChild>
                    <Link to="/pricing">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Elite
                    </Link>
                  </Button>
                </div>

                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="font-medium mb-4">What you'll unlock:</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-sm mx-auto">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      1-on-1 AI Coaching for personalized guidance
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      AI Personal Plan - custom diet, workout & supplements
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      AI Body Composition Analysis
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      Calorie & Macro Tracking
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      Progress Photo Tracking & Comparisons
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      Advanced AI features for men 40+
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 md:pt-28 pb-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium tracking-wider uppercase text-accent">Elite Feature</span>
                </div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold">Fitness Journey</h1>
                <p className="text-muted-foreground text-sm">
                  Your complete AI-powered progress hub
                </p>
              </div>
            </div>

            {/* Today's Status Card */}
            <Card className="md:min-w-[200px]">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Today's Status
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3 px-4">
                {(() => {
                  const today = new Date();
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  const hasCheckedInToday = latestCheckin?.check_in_date === todayStr;
                  
                  return hasCheckedInToday && latestCheckin ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mood</span>
                        <span className="font-medium">{latestCheckin.mood_level}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Energy</span>
                        <span className="font-medium">{latestCheckin.energy_level}/5</span>
                      </div>
                      <div className="text-xs text-center text-muted-foreground mt-2 pt-2 border-t">
                        ✓ Checked in today
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Not checked in yet</p>
                      <Button size="sm" asChild>
                        <Link to="/checkin">Check In</Link>
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mb-6 flex flex-wrap gap-1 h-auto p-1">
              <TabsTrigger value="guide" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Quick Start</span>
              </TabsTrigger>
              <TabsTrigger value="coach" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">AI Coach</span>
              </TabsTrigger>
              <TabsTrigger value="plan" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Plan</span>
              </TabsTrigger>
              <TabsTrigger value="calories" className="gap-2">
                <Utensils className="h-4 w-4" />
                <span className="hidden sm:inline">Calories</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="gap-2">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
            </TabsList>

            {/* Quick Start Guide Tab */}
            <TabsContent value="guide">
              {recommendations && onboardingData ? (
                <PersonalizedRecommendations 
                  recommendations={recommendations} 
                  onboardingData={onboardingData} 
                />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Complete Your Assessment</h3>
                    <p className="text-muted-foreground mb-4">
                      Take the quick assessment to get personalized recommendations
                    </p>
                    <Button asChild>
                      <Link to="/onboarding">Start Assessment</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* AI Coach Tab */}
            <TabsContent value="coach">
              <Card>
                <CardContent className="py-8">
                  <div className="text-center mb-6">
                    <MessageCircle className="h-12 w-12 mx-auto text-accent mb-4" />
                    <h3 className="font-semibold text-xl mb-2">1-on-1 AI Coach</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Get personalized coaching advice anytime. Your AI coach understands your goals, 
                      fitness level, and preferences to provide tailored guidance.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button size="lg" asChild>
                      <Link to="/coaching">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Coaching Session
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Plan Tab */}
            <TabsContent value="plan">
              <Card>
                <CardContent className="py-8">
                  <div className="text-center mb-6">
                    <Sparkles className="h-12 w-12 mx-auto text-accent mb-4" />
                    <h3 className="font-semibold text-xl mb-2">AI Personal Plan</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Generate a comprehensive diet, workout, and supplement protocol tailored to your goals. 
                      Plans integrate with your body analysis results for maximum effectiveness.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button size="lg" asChild>
                      <Link to="/personal-plan">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create or View Plans
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calorie Tracker Tab */}
            <TabsContent value="calories">
              <Card>
                <CardContent className="py-8">
                  <div className="text-center mb-6">
                    <Flame className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                    <h3 className="font-semibold text-xl mb-2">Calorie & Macro Tracker</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Track your daily meals and macros. Log food, set calorie goals, 
                      and monitor your nutrition to stay on track with your fitness goals.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button size="lg" asChild>
                      <Link to="/calories">
                        <Utensils className="h-4 w-4 mr-2" />
                        Open Calorie Tracker
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Body Analysis Tab */}
            <TabsContent value="analysis">
              <div className="-mx-4 sm:mx-0">
                <BodyAnalysisComponent />
              </div>
            </TabsContent>

            {/* Progress Photos Tab - Full embedded functionality */}
            <TabsContent value="photos">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Camera className="h-5 w-5 text-accent" />
                        Progress Photos
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Track your transformation journey
                      </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Photo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Progress Photo</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Photo</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={photoDate}
                              onChange={(e) => setPhotoDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Weight (optional)</Label>
                            <Input
                              type="number"
                              placeholder="Enter weight"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Notes (optional)</Label>
                            <Textarea
                              placeholder="Any notes about this photo..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                          </div>
                          <Button 
                            onClick={handleUpload} 
                            disabled={!photoFile || uploading}
                            className="w-full"
                          >
                            {uploading ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                            ) : (
                              "Upload Photo"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Tabs value={photosTab} onValueChange={setPhotosTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="grid" className="gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Gallery
                      </TabsTrigger>
                      <TabsTrigger value="compare" className="gap-2">
                        <Columns className="h-4 w-4" />
                        Compare
                      </TabsTrigger>
                      <TabsTrigger value="chart" className="gap-2">
                        <LineChart className="h-4 w-4" />
                        Weight
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="grid">
                      {photosLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : photos.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No progress photos yet. Add your first one!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {photos.map((photo) => (
                            <div key={photo.id} className="relative group">
                              <img
                                src={photo.photo_url}
                                alt={`Progress from ${photo.photo_date}`}
                                className="w-full aspect-square object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                                <p className="text-sm font-medium flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(photo.photo_date), "MMM d, yyyy")}
                                </p>
                                {photo.weight && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Scale className="h-3 w-3" />
                                    {photo.weight} lbs
                                  </p>
                                )}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => handleDelete(photo.id, photo.photo_url)}
                                  disabled={deleting === photo.id}
                                >
                                  {deleting === photo.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="compare">
                      <PhotoComparison photos={photos} />
                    </TabsContent>

                    <TabsContent value="chart">
                      <WeightChart photos={photos} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced AI Features Tab */}
            <TabsContent value="advanced">
              <Card className="bg-gradient-to-br from-accent/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Advanced AI Features
                  </CardTitle>
                  <CardDescription>
                    Specialized tools designed for men over 40
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Hormonal Optimization */}
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <Battery className="h-8 w-8 text-accent mb-3" />
                      <h4 className="font-semibold mb-2">Hormonal Optimization</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Optimize training and nutrition around natural testosterone fluctuations.
                      </p>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to="/hormonal">Open Tool</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Joint Health */}
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <Shield className="h-8 w-8 text-accent mb-3" />
                      <h4 className="font-semibold mb-2">Joint Health Analytics</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        AI-driven injury risk prediction and prevention protocols.
                      </p>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to="/joint-health">Open Tool</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Sleep-Adaptive */}
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <Moon className="h-8 w-8 text-accent mb-3" />
                      <h4 className="font-semibold mb-2">Sleep-Adaptive Workouts</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Modify workouts based on your sleep quality and recovery data.
                      </p>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to="/sleep-adaptive">Open Tool</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Comeback Protocol */}
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <RotateCcw className="h-8 w-8 text-accent mb-3" />
                      <h4 className="font-semibold mb-2">Comeback Protocol</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Smart return-to-fitness guidance after breaks or injuries.
                      </p>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to="/comeback">Open Tool</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Executive Mode */}
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <Briefcase className="h-8 w-8 text-accent mb-3" />
                      <h4 className="font-semibold mb-2">Executive Performance</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Cognitive and performance optimization for busy professionals.
                      </p>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to="/executive-mode">Open Tool</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyProgress;
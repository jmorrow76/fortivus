import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingQuery } from "@/hooks/queries";
import { 
  ArrowLeft, Sparkles, Camera, TrendingUp, Lock, Crown, Lightbulb,
  MessageCircle, Utensils, Battery, Shield, Moon, RotateCcw, Briefcase, Flame,
  Dumbbell, ScanFace, Activity, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BodyAnalysisComponent from "@/components/BodyAnalysis";
import PersonalizedRecommendations from "@/components/dashboard/PersonalizedRecommendations";
import ScriptureOfDay from "@/components/dashboard/ScriptureOfDay";
import TooltipTour, { fitnessJourneyTourSteps } from "@/components/TooltipTour";

import { getPersonalizedRecommendations } from "@/lib/onboardingUtils";

// Import Progress Photos components
import PhotoComparison from "@/components/PhotoComparison";
import WeightChart from "@/components/WeightChart";
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
  const [activeMainTab, setActiveMainTab] = useState("coach");
  const [showTour, setShowTour] = useState(false);
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
      checkTourStatus();
    }
  }, [user, subscription.subscribed]);

  const checkTourStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("has_seen_tour")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data?.has_seen_tour === false) {
        setTimeout(() => setShowTour(true), 500);
      }
    } catch (error) {
      console.error("Error checking tour status:", error);
    }
  };

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

          {/* Scripture of the Day */}
          <div className="mb-8" data-tour="scripture">
            <ScriptureOfDay />
          </div>

          {/* Quick Start Guide - Always visible */}
          <div className="mb-8" data-tour="quick-start">
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
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-8" data-tour="feature-nav">
            <h2 className="font-heading text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <Link to="/coaching" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Start Coaching Session</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/calories" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Log Food</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/workouts" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Start Workout</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/body-analysis" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <ScanFace className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Analyze Body Composition</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/running" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Track a Run</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/checkin" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Daily Check-in</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/hormonal" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Hormonal Optimization</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/sleep-adaptive" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Moon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Optimize Sleep</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/joint-health" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Assess Joint Health</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/comeback" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <RotateCcw className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Start Comeback Protocol</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/executive-mode" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Executive Performance</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/fasting" className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Biblical Fasting</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <TooltipTour
        steps={fitnessJourneyTourSteps}
        isOpen={showTour}
        onComplete={async () => {
          setShowTour(false);
          if (user) {
            await supabase
              .from("profiles")
              .update({ has_seen_tour: true })
              .eq("user_id", user.id);
          }
        }}
      />
    </div>
  );
};

export default MyProgress;
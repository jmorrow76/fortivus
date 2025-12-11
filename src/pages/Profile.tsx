import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, FORTIVUS_ELITE } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Loader2, User, Crown, Settings, Calendar, Sparkles, Flame, RefreshCw, LayoutDashboard, Home, HelpCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import HealthDashboard from "@/components/HealthDashboard";
import { NotificationSettings } from "@/components/NotificationSettings";
import { SocialConnections } from "@/components/SocialConnections";
import PromoCodeRedemption from "@/components/PromoCodeRedemption";
import TooltipTour, { dashboardTourSteps, fitnessJourneyTourSteps } from "@/components/TooltipTour";
import { format } from "date-fns";

const Profile = () => {
  const { user, loading: authLoading, subscription, session } = useAuth();
  const { hasCompletedOnboarding, resetOnboarding } = useOnboarding();
  const isManualGrant = subscription.productId === 'manual_grant';
  const isElite = subscription.subscribed && (
    subscription.productId === FORTIVUS_ELITE.monthly.product_id ||
    subscription.productId === FORTIVUS_ELITE.yearly.product_id ||
    isManualGrant
  );
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [carbsGoal, setCarbsGoal] = useState(200);
  const [fatGoal, setFatGoal] = useState(65);
  const [landingPagePreference, setLandingPagePreference] = useState<"dashboard" | "fitness-journey">("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [resettingAssessment, setResettingAssessment] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  const handleRetakeAssessment = async () => {
    setResettingAssessment(true);
    try {
      await resetOnboarding();
      toast({
        title: "Assessment reset",
        description: "Redirecting to the fitness assessment...",
      });
      navigate("/onboarding");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset assessment",
        variant: "destructive",
      });
    } finally {
      setResettingAssessment(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;
    
    setManagingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open subscription management",
        variant: "destructive",
      });
    } finally {
      setManagingSubscription(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, calorie_goal, protein_goal, carbs_goal, fat_goal, landing_page_preference")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url);
        setCalorieGoal(data.calorie_goal || 2000);
        setProteinGoal(data.protein_goal || 150);
        setCarbsGoal(data.carbs_goal || 200);
        setFatGoal(data.fat_goal || 65);
        setLandingPagePreference((data.landing_page_preference as "dashboard" | "fitness-journey") || "dashboard");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          display_name: displayName.trim() || null,
          calorie_goal: calorieGoal,
          protein_goal: proteinGoal,
          carbs_goal: carbsGoal,
          fat_goal: fatGoal,
          landing_page_preference: landingPagePreference
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your settings have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 md:pt-28 pb-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Membership Card */}
          <Card className="shadow-card mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-lg">Membership</CardTitle>
                {isElite ? (
                  <Badge className="bg-accent text-accent-foreground font-semibold px-3 py-1.5 flex items-center gap-1.5">
                    <Crown className="h-4 w-4" />
                    Elite Member
                  </Badge>
                ) : (
                  <Badge variant="secondary">Free</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isElite ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {subscription.subscriptionEnd && !isManualGrant && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Renews {format(new Date(subscription.subscriptionEnd), "MMM d, yyyy")}
                    </span>
                  )}
                  {isManualGrant ? (
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Complimentary membership
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageSubscription}
                      disabled={managingSubscription}
                    >
                      {managingSubscription ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Subscription
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Unlock AI coaching, advanced tracking, and more.
                    </p>
                  </div>
                  <Button size="sm" onClick={() => navigate("/#pricing")}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Promo Code Redemption - only show if not already elite */}
          {!isElite && (
            <div className="mb-6">
              <PromoCodeRedemption />
            </div>
          )}

          {/* Profile Settings Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                    <AvatarFallback className="bg-secondary text-foreground">
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-accent text-accent-foreground rounded-full cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click the camera icon to upload a new photo
                </p>
              </div>

              {/* Display Name Section */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="max-w-md"
                />
              </div>

              {/* Email Section (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="max-w-md bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Fitness Assessment Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold">Fitness Assessment</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {hasCompletedOnboarding
                    ? "Update your fitness goals, experience level, and preferences to get refreshed personalized recommendations."
                    : "Complete your fitness assessment to get personalized workout and nutrition recommendations."}
                </p>
                <Button
                  variant="outline"
                  onClick={handleRetakeAssessment}
                  disabled={resettingAssessment}
                  className="w-full sm:w-auto"
                >
                  {resettingAssessment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {hasCompletedOnboarding ? "Retake Assessment" : "Take Assessment"}
                    </>
                  )}
                </Button>
              </div>

              {/* Macro Goals Section */}
              {isElite && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">Daily Nutrition Goals</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="calorieGoal">Calories (kcal)</Label>
                      <Input
                        id="calorieGoal"
                        type="number"
                        min="1000"
                        max="10000"
                        value={calorieGoal}
                        onChange={(e) => setCalorieGoal(parseInt(e.target.value) || 2000)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proteinGoal">Protein (g)</Label>
                      <Input
                        id="proteinGoal"
                        type="number"
                        min="0"
                        max="500"
                        value={proteinGoal}
                        onChange={(e) => setProteinGoal(parseInt(e.target.value) || 150)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carbsGoal">Carbs (g)</Label>
                      <Input
                        id="carbsGoal"
                        type="number"
                        min="0"
                        max="1000"
                        value={carbsGoal}
                        onChange={(e) => setCarbsGoal(parseInt(e.target.value) || 200)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatGoal">Fat (g)</Label>
                      <Input
                        id="fatGoal"
                        type="number"
                        min="0"
                        max="500"
                        value={fatGoal}
                        onChange={(e) => setFatGoal(parseInt(e.target.value) || 65)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customize your daily targets for the calorie tracker
                  </p>
                </div>
              )}

              {/* Landing Page Preference Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold">Default Landing Page</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowWelcomeTour(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Replay Tour
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose which page to show after you sign in
                </p>
                <RadioGroup 
                  value={landingPagePreference} 
                  onValueChange={(value) => setLandingPagePreference(value as "dashboard" | "fitness-journey")}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="dashboard" id="landing-dashboard" />
                    <Label htmlFor="landing-dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      Member Dashboard
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="fitness-journey" id="landing-fitness" />
                    <Label htmlFor="landing-fitness" className="flex items-center gap-2 cursor-pointer">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Fitness Journey
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <div className="mt-6">
            <NotificationSettings />
          </div>

          {/* Social Connections */}
          <div className="mt-6">
            <SocialConnections />
          </div>

          {/* Health Data Section */}
          <div className="mt-6">
            {isElite ? (
              <HealthDashboard />
            ) : (
              <Card className="border-dashed relative overflow-hidden">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <Crown className="h-8 w-8 text-accent mb-2" />
                  <p className="font-heading font-semibold text-foreground mb-1">Elite Feature</p>
                  <p className="text-sm text-muted-foreground mb-3">Sync your wearable health data</p>
                  <Button size="sm" onClick={() => navigate("/#pricing")}>
                    Upgrade to Elite
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-muted-foreground">
                    <Settings className="h-5 w-5" />
                    Wearable Health Data
                  </CardTitle>
                  <CardDescription>
                    Connect Apple Health or Google Fit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 opacity-50">
                    <div className="p-3 rounded-lg bg-secondary/30 text-center">
                      <div className="font-bold">--</div>
                      <div className="text-xs text-muted-foreground">Steps</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30 text-center">
                      <div className="font-bold">--</div>
                      <div className="text-xs text-muted-foreground">Heart Rate</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30 text-center">
                      <div className="font-bold">--</div>
                      <div className="text-xs text-muted-foreground">Sleep</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <TooltipTour
        steps={landingPagePreference === "fitness-journey" ? fitnessJourneyTourSteps : dashboardTourSteps}
        isOpen={showWelcomeTour}
        onComplete={() => setShowWelcomeTour(false)}
      />
    </div>
  );
};

export default Profile;

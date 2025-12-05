import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, FORTIVUS_ELITE } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Loader2, User, Crown, Settings, Calendar, Sparkles, Flame } from "lucide-react";
import Navbar from "@/components/Navbar";
import HealthDashboard from "@/components/HealthDashboard";
import { NotificationSettings } from "@/components/NotificationSettings";
import { SocialConnections } from "@/components/SocialConnections";
import { format } from "date-fns";

const Profile = () => {
  const { user, loading: authLoading, subscription, session } = useAuth();
  const isElite = subscription.subscribed && (
    subscription.productId === FORTIVUS_ELITE.monthly.product_id ||
    subscription.productId === FORTIVUS_ELITE.yearly.product_id ||
    subscription.productId === 'manual_grant'
  );
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [carbsGoal, setCarbsGoal] = useState(200);
  const [fatGoal, setFatGoal] = useState(65);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);

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
        .select("display_name, avatar_url, calorie_goal, protein_goal, carbs_goal, fat_goal")
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
          fat_goal: fatGoal
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
      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-2xl">Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your profile information and avatar
                  </CardDescription>
                </div>
                {isElite && (
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-accent text-accent-foreground font-semibold px-3 py-1.5 flex items-center gap-1.5">
                      <Crown className="h-4 w-4" />
                      Elite Member
                    </Badge>
                    {subscription.subscriptionEnd && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Renews {format(new Date(subscription.subscriptionEnd), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Upgrade Prompt for non-Elite users */}
              {!isElite && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-accent/20">
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-foreground">Upgrade to Elite</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Unlock AI body analysis, progress tracking, personalized build plans, and more.
                      </p>
                      <Button
                        size="sm"
                        className="mt-3"
                        onClick={() => navigate("/#pricing")}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        View Plans
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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

              {/* Save Button */}
              <div className="flex flex-col sm:flex-row gap-3">
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
                
                {isElite && (
                  <Button
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={managingSubscription}
                    className="w-full sm:w-auto"
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
    </div>
  );
};

export default Profile;

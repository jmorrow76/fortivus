import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Loader2, Trash2, Calendar, Scale, LayoutGrid, Columns, LineChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import PhotoComparison from "@/components/PhotoComparison";
import WeightChart from "@/components/WeightChart";
import { format } from "date-fns";

interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_date: string;
  weight: number | null;
  notes: string | null;
  created_at: string;
}

const Progress = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoDate, setPhotoDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("progress_photos")
        .select("*")
        .eq("user_id", user!.id)
        .order("photo_date", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
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
          notes: notes.trim() || null,
        });

      if (insertError) throw insertError;

      toast({
        title: "Photo uploaded",
        description: "Your progress photo has been saved.",
      });

      // Reset form and refresh
      setPhotoFile(null);
      setPhotoDate(format(new Date(), "yyyy-MM-dd"));
      setWeight("");
      setNotes("");
      setDialogOpen(false);
      fetchPhotos();
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

  const handleDelete = async (photo: ProgressPhoto) => {
    if (!user) return;

    setDeleting(photo.id);
    try {
      // Extract file path from URL
      const urlParts = photo.photo_url.split("/progress-photos/");
      const filePath = urlParts[1];

      if (filePath) {
        await supabase.storage.from("progress-photos").remove([filePath]);
      }

      const { error } = await supabase
        .from("progress_photos")
        .delete()
        .eq("id", photo.id);

      if (error) throw error;

      toast({
        title: "Photo deleted",
        description: "Your progress photo has been removed.",
      });

      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
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
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  Progress Photos
                </h1>
                <p className="text-muted-foreground">
                  Track your transformation journey
                </p>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">Add Progress Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo">Photo</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (optional)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 185.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="How are you feeling? Any milestones?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!photoFile || uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Save Photo"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {photos.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-16 text-center">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">No progress photos yet</p>
                  <p className="text-sm">Start documenting your fitness journey by adding your first photo.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="mb-6">
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
                  Chart
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grid">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="shadow-card overflow-hidden group">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={photo.photo_url}
                          alt={`Progress photo from ${photo.photo_date}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(photo)}
                          disabled={deleting === photo.id}
                        >
                          {deleting === photo.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(photo.photo_date), "MMM d, yyyy")}
                          </span>
                          {photo.weight && (
                            <span className="flex items-center gap-1">
                              <Scale className="h-4 w-4" />
                              {photo.weight} lbs
                            </span>
                          )}
                        </div>
                        {photo.notes && (
                          <p className="text-sm text-foreground line-clamp-2">{photo.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="compare">
                <PhotoComparison photos={photos} />
              </TabsContent>

              <TabsContent value="chart">
                <WeightChart photos={photos} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Progress;

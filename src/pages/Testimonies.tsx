import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Sparkles, 
  Plus, 
  Loader2, 
  Heart,
  Calendar,
  User,
  BookOpen,
  Trash2,
  Star,
  StarOff,
  Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLikes } from '@/hooks/useLikes';

interface Testimony {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  is_featured: boolean;
  is_weekly_spotlight: boolean;
  author_name?: string;
  author_avatar?: string;
}

export default function Testimonies() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const testimonyIds = testimonies.map(t => t.id);
  const { likeCounts, userLikes, toggleLike } = useLikes('testimony', testimonyIds);

  const fetchTestimonies = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonies')
        .select('*')
        .order('is_weekly_spotlight', { ascending: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch author profiles
      const testimoniesWithAuthors = await Promise.all(
        (data || []).map(async (testimony) => {
          const { data: profile } = await supabase.rpc('get_public_profile', {
            target_user_id: testimony.user_id
          });
          return {
            ...testimony,
            author_name: profile?.[0]?.display_name || 'Anonymous Brother',
            author_avatar: profile?.[0]?.avatar_url
          };
        })
      );

      setTestimonies(testimoniesWithAuthors);
    } catch (error) {
      console.error('Error fetching testimonies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const handleSubmit = async () => {
    if (!user || !title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('testimonies')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim()
        });

      if (error) throw error;

      toast({
        title: 'Testimony shared!',
        description: 'Thank you for sharing how God has worked in your life.'
      });

      setTitle('');
      setContent('');
      setDialogOpen(false);
      fetchTestimonies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to share testimony',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Testimony removed',
        description: 'Your testimony has been deleted.'
      });

      fetchTestimonies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete testimony',
        variant: 'destructive'
      });
    }
  };

  const handleToggleFeatured = async (id: string, title: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonies')
        .update({ is_featured: !currentFeatured })
        .eq('id', id);

      if (error) throw error;

      // Send email notification when featuring (not when unfeaturing)
      if (!currentFeatured) {
        try {
          await supabase.functions.invoke('notify-featured-testimony', {
            body: { testimonyId: id, testimonyTitle: title }
          });
        } catch (emailError) {
          console.error('Failed to send featured notification email:', emailError);
          // Don't fail the feature action if email fails
        }
      }

      toast({
        title: currentFeatured ? 'Removed from featured' : 'Featured!',
        description: currentFeatured 
          ? 'Testimony is no longer featured.' 
          : 'Testimony is now featured at the top. Author has been notified.'
      });

      fetchTestimonies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update testimony',
        variant: 'destructive'
      });
    }
  };

  const handleSetWeeklySpotlight = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonies')
        .update({ is_weekly_spotlight: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Testimony of the Week set!',
        description: 'This testimony will now be featured on the homepage.'
      });

      fetchTestimonies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set weekly spotlight',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container pt-32 md:pt-28 pb-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Testimonies
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Share how God has answered your prayers and celebrate His faithfulness with our community of brothers.
          </p>
          <p className="text-sm text-muted-foreground italic">
            "Come and hear, all you who fear God, and I will tell what he has done for my soul." — Psalm 66:16
          </p>
        </div>

        {/* Share Button */}
        {user && (
          <div className="flex justify-center mb-8">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Share Your Testimony
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Share Your Testimony
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., God healed my chronic pain"
                      maxLength={150}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Story</label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share the details of how God answered your prayer..."
                      rows={8}
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {content.length}/5000 characters
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitting || !title.trim() || !content.trim()}
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Share Testimony
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Testimonies List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : testimonies.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No testimonies shared yet. Be the first to share how God has worked in your life!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 max-w-3xl mx-auto">
            {testimonies.map((testimony) => (
              <Card 
                key={testimony.id} 
                className={testimony.is_featured ? 'border-primary/50 bg-primary/5' : ''}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimony.author_avatar} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{testimony.author_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(testimony.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(testimony as any).is_weekly_spotlight && (
                        <Badge className="gap-1 bg-primary">
                          <Award className="h-3 w-3" />
                          Testimony of the Week
                        </Badge>
                      )}
                      {testimony.is_featured && !(testimony as any).is_weekly_spotlight && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${(testimony as any).is_weekly_spotlight ? 'text-primary' : 'text-muted-foreground'}`}
                            onClick={() => handleSetWeeklySpotlight(testimony.id)}
                            title="Set as Testimony of the Week"
                            disabled={(testimony as any).is_weekly_spotlight}
                          >
                            <Award className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${testimony.is_featured ? 'text-yellow-500' : 'text-muted-foreground'}`}
                            onClick={() => handleToggleFeatured(testimony.id, testimony.title, testimony.is_featured)}
                            title={testimony.is_featured ? 'Remove from featured' : 'Feature this testimony'}
                          >
                            {testimony.is_featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                          </Button>
                        </>
                      )}
                      {testimony.user_id === user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(testimony.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-xl mt-2">{testimony.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {testimony.content}
                  </p>
                  
                  {/* Like button */}
                  <div className="mt-6 pt-4 border-t flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${userLikes[testimony.id] ? 'text-red-500' : 'text-muted-foreground'}`}
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "Sign in required",
                            description: "Please sign in to encourage this testimony.",
                            variant: "destructive",
                          });
                          return;
                        }
                        toggleLike(testimony.id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${userLikes[testimony.id] ? 'fill-current' : ''}`} />
                      {likeCounts[testimony.id] || 0} encouraged
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

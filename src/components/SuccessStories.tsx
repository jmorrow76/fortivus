import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Quote, Target, TrendingUp, Clock, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { Json } from '@/integrations/supabase/types';

interface Story {
  name: string;
  age: number;
  startingPoint: string;
  goals: string;
  results: string;
  timeline: string;
  quote: string;
}

const SuccessStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSavedStories();
    }
  }, [user]);

  const fetchSavedStories = async () => {
    const { data, error } = await supabase
      .from('saved_stories')
      .select('story_data')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedStories(data.map(d => d.story_data as unknown as Story));
    }
  };

  const generateStories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate stories');
      }

      const data = await response.json();
      setStories(data.stories || []);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating stories:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unable to generate stories. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isStorySaved = (story: Story) => {
    return savedStories.some(s => s.name === story.name && s.quote === story.quote);
  };

  const toggleSaveStory = async (story: Story) => {
    if (!user) {
      toast({
        title: 'Sign in Required',
        description: 'Please sign in to save stories.',
      });
      navigate('/auth');
      return;
    }

    const isSaved = isStorySaved(story);

    if (isSaved) {
      const { error } = await supabase
        .from('saved_stories')
        .delete()
        .eq('user_id', user.id)
        .contains('story_data', { name: story.name, quote: story.quote });

      if (!error) {
        setSavedStories(prev => prev.filter(s => !(s.name === story.name && s.quote === story.quote)));
        toast({ title: 'Story removed', description: 'Story removed from your favorites.' });
      }
    } else {
      const { error } = await supabase
        .from('saved_stories')
        .insert([{ user_id: user.id, story_data: story as unknown as Json }]);

      if (!error) {
        setSavedStories(prev => [story, ...prev]);
        toast({ title: 'Story saved!', description: 'Story added to your favorites.' });
      }
    }
  };

  const StoryCard = ({ story, showSaveButton = true }: { story: Story; showSaveButton?: boolean }) => {
    const saved = isStorySaved(story);
    
    return (
      <Card className="bg-card border-border/40 shadow-card overflow-hidden">
        <CardContent className="p-6">
          <div className="mb-6 pb-4 border-b border-border/30 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                {story.name}, {story.age}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-accent" />
                <span>{story.timeline} transformation</span>
              </div>
            </div>
            {showSaveButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleSaveStory(story)}
                className={saved ? 'text-destructive hover:text-destructive/80' : 'text-muted-foreground hover:text-accent'}
              >
                {saved ? <Heart className="h-5 w-5 fill-current" /> : <Heart className="h-5 w-5" />}
              </Button>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Starting Point</span>
            </div>
            <p className="text-sm text-muted-foreground">{story.startingPoint}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Results Achieved</span>
            </div>
            <p className="text-sm text-muted-foreground">{story.results}</p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 relative">
            <Quote className="h-6 w-6 text-accent/30 absolute top-3 left-3" />
            <p className="text-sm italic text-foreground/80 pl-6">
              "{story.quote}"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="success-stories" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Real Transformations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover inspiring stories from men over 40 who transformed their fitness journey
          </p>
          
          <Button
            onClick={generateStories}
            disabled={isLoading}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Generating Stories...
              </>
            ) : hasGenerated ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Generate New Stories
              </>
            ) : (
              'Discover Success Stories'
            )}
          </Button>
        </div>

        {stories.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {stories.map((story, index) => (
              <StoryCard key={index} story={story} />
            ))}
          </div>
        )}

        {user && savedStories.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-heading font-semibold text-foreground mb-6 flex items-center gap-2">
              <Heart className="h-6 w-6 text-accent fill-accent" />
              Your Saved Stories
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {savedStories.map((story, index) => (
                <StoryCard key={`saved-${index}`} story={story} />
              ))}
            </div>
          </div>
        )}

        {!hasGenerated && !isLoading && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Click the button above to discover AI-generated success stories
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SuccessStories;

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Quote, Target, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

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

  return (
    <section id="success-stories" className="py-20 bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-4">
            Real Transformations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover inspiring stories from men over 40 who transformed their fitness journey
          </p>
          
          <Button
            onClick={generateStories}
            disabled={isLoading}
            size="lg"
            className="bg-bronze hover:bg-bronze/90 text-white"
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
              <Card key={index} className="bg-white border-border/40 shadow-elegant overflow-hidden">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="mb-6 pb-4 border-b border-border/30">
                    <h3 className="text-xl font-heading font-semibold text-navy">
                      {story.name}, {story.age}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-bronze" />
                      <span>{story.timeline} transformation</span>
                    </div>
                  </div>

                  {/* Starting Point */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-bronze" />
                      <span className="text-sm font-medium text-navy">Starting Point</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{story.startingPoint}</p>
                  </div>

                  {/* Results */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-bronze" />
                      <span className="text-sm font-medium text-navy">Results Achieved</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{story.results}</p>
                  </div>

                  {/* Quote */}
                  <div className="bg-cream/50 rounded-lg p-4 relative">
                    <Quote className="h-6 w-6 text-bronze/30 absolute top-3 left-3" />
                    <p className="text-sm italic text-navy/80 pl-6">
                      "{story.quote}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
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

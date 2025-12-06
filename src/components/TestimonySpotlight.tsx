import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkles, User, ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface FeaturedTestimony {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

export default function TestimonySpotlight() {
  const [testimony, setTestimony] = useState<FeaturedTestimony | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTestimony = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonies')
          .select('*')
          .eq('is_weekly_spotlight', true)
          .limit(1)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // No rows found
            console.error('Error fetching featured testimony:', error);
          }
          return;
        }

        if (data) {
          // Fetch author profile
          const { data: profile } = await supabase.rpc('get_public_profile', {
            target_user_id: data.user_id
          });

          setTestimony({
            ...data,
            author_name: profile?.[0]?.display_name || 'Anonymous Brother',
            author_avatar: profile?.[0]?.avatar_url
          });
        }
      } catch (error) {
        console.error('Error fetching featured testimony:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTestimony();
  }, []);

  if (loading || !testimony) {
    return null;
  }

  // Truncate content for preview
  const truncatedContent = testimony.content.length > 300 
    ? testimony.content.substring(0, 300) + '...' 
    : testimony.content;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="h-3 w-3" />
            Testimony of the Week
          </Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            God's Faithfulness in Action
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Celebrating how God is moving in the lives of our brothers in Christ
          </p>
        </div>

        <Card className="max-w-3xl mx-auto border-primary/20 bg-card/50 backdrop-blur">
          <CardContent className="p-8 md:p-10">
            <Quote className="h-10 w-10 text-primary/30 mb-4" />
            
            <h3 className="font-heading text-2xl font-bold mb-4">
              {testimony.title}
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">
              {truncatedContent}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={testimony.author_avatar} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{testimony.author_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(testimony.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <Button asChild variant="outline" className="gap-2">
                <Link to="/testimonies">
                  Read More Testimonies
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

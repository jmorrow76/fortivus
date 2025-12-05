import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, User, Loader2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  slug: string;
  read_time_minutes: number;
  is_featured: boolean;
  published_at: string | null;
  image_url: string | null;
}

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isKnowledgeHubPage = location.pathname === "/knowledge";

  useEffect(() => {
    const fetchArticles = async () => {
      let query = supabase
        .from("articles")
        .select("id, title, excerpt, category, author, slug, read_time_minutes, is_featured, published_at, image_url")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      // Only limit on homepage, show all on Knowledge Hub
      if (!isKnowledgeHubPage) {
        query = query.limit(4);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching articles:", error);
      } else {
        setArticles(data || []);
      }
      setLoading(false);
    };

    fetchArticles();
  }, [isKnowledgeHubPage]);

  const featuredArticle = articles.find(a => a.is_featured) || articles[0];
  const otherArticles = articles.filter(a => a.id !== featuredArticle?.id);

  if (loading) {
    return (
      <section id="articles" className="section-padding bg-secondary/30">
        <div className="container mx-auto px-4 flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section id="articles" className="section-padding bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="section-title">Knowledge Hub</h2>
            <p className="text-muted-foreground">
              Articles coming soon. Check back later for expert insights on training, nutrition, and lifestyle optimization.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="articles" className="section-padding bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="section-label text-left">Knowledge Hub</span>
            <h2 className="section-title text-left">
              Expert <span className="text-accent">Insights</span>
            </h2>
            <p className="section-description text-left mx-0">
              Expert articles and contributions covering training,
              nutrition, and lifestyle optimization.
            </p>
          </div>
          {!isKnowledgeHubPage && (
            <Link to="/knowledge">
              <Button variant="outline" size="lg" className="shrink-0 self-start md:self-auto">
                Browse All Articles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        {/* Articles Grid */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Featured Article */}
          {featuredArticle && (
            <Link to={`/knowledge/${featuredArticle.slug}`} className="lg:row-span-2">
              <Card variant="premium" className="h-full overflow-hidden group cursor-pointer">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="h-56 relative overflow-hidden">
                    {featuredArticle.image_url ? (
                      <img 
                        src={featuredArticle.image_url} 
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary to-muted" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-md bg-accent text-accent-foreground text-xs font-semibold">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6 lg:p-8 flex-1 flex flex-col">
                    <span className="text-accent text-sm font-semibold mb-2">
                      {featuredArticle.category}
                    </span>
                    <h3 className="font-heading text-xl lg:text-2xl font-bold mb-4 group-hover:text-accent transition-colors">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 flex-1 text-sm leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{featuredArticle.author}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {featuredArticle.read_time_minutes} min read
                          </div>
                        </div>
                      </div>
                      <Button variant="default" size="sm" className="group/btn">
                        Read
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Other Articles */}
          {otherArticles.map((article) => (
            <Link key={article.id} to={`/knowledge/${article.slug}`}>
              <Card variant="interactive" className="group h-full cursor-pointer overflow-hidden">
                <CardContent className="p-0">
                  {article.image_url && (
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <span className="text-accent text-sm font-semibold mb-2 block">
                      {article.category}
                    </span>
                    <h3 className="font-heading text-lg font-bold mb-3 group-hover:text-accent transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        {article.author}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {article.read_time_minutes} min
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Articles;

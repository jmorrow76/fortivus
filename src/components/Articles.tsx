import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, ArrowRight, User, Loader2, Search, X, History, TrendingUp } from "lucide-react";

const RECENT_SEARCHES_KEY = "fortivus_recent_searches";
const MAX_RECENT_SEARCHES = 5;

const SUGGESTED_TERMS = [
  "strength training",
  "nutrition",
  "recovery",
  "sleep",
  "testosterone",
  "mobility",
  "protein",
];

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
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isKnowledgeHubPage = location.pathname === "/knowledge";

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setIsSearchFocused(false);
    }
  };

  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term);
    saveRecentSearch(term);
    setIsSearchFocused(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

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

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(articles.map(a => a.category))];
    return ["All", ...uniqueCategories.sort()];
  }, [articles]);

  // Filter articles by selected category and search query
  const filteredArticles = useMemo(() => {
    let filtered = articles;
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.excerpt.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query) ||
        a.author.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = filteredArticles.find(a => a.is_featured) || filteredArticles[0];
  const otherArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
  };

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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
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
          {!isKnowledgeHubPage ? (
            <Link to="/knowledge">
              <Button variant="outline" size="lg" className="shrink-0 self-start md:self-auto">
                Browse All Articles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div className="text-muted-foreground text-sm shrink-0 self-start md:self-auto">
              Showing {filteredArticles.length} of {articles.length} articles
            </div>
          )}
        </div>

        {/* Search and Category Filter - Only on Knowledge Hub */}
        {isKnowledgeHubPage && (
          <div className="space-y-4 mb-10">
            {/* Search Bar with Suggestions */}
            <div ref={searchRef} className="relative max-w-md">
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>
              
              {/* Suggestions Dropdown */}
              {isSearchFocused && !searchQuery && (recentSearches.length > 0 || SUGGESTED_TERMS.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="p-2">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent</span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </button>
                      </div>
                      {recentSearches.map((term, index) => (
                        <button
                          key={`recent-${index}`}
                          onClick={() => handleSuggestionClick(term)}
                          className="w-full flex items-center gap-2 px-2 py-2 text-sm text-left hover:bg-secondary rounded-md transition-colors"
                        >
                          <History className="h-3.5 w-3.5 text-muted-foreground" />
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggested Terms */}
                  <div className="p-2 border-t border-border">
                    <div className="px-2 py-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Suggested</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-2 py-1">
                      {SUGGESTED_TERMS.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSuggestionClick(term)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                        >
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Category Filters */}
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No results message */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? `No articles found for "${searchQuery}"` : "No articles found in this category."}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Articles Grid */}
        {filteredArticles.length > 0 && (
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
        )}
      </div>
    </section>
  );
};

export default Articles;

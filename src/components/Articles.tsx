import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, User } from "lucide-react";

const articles = [
  {
    title: "The Complete Guide to Training After 40",
    excerpt: "Why your approach needs to change and how to adapt your workouts for longevity and results.",
    category: "Training",
    readTime: "12 min",
    author: "Dr. Mike Reynolds",
    featured: true,
  },
  {
    title: "Testosterone: Myths vs Science",
    excerpt: "Separating fact from fiction about natural testosterone optimization for men over 40.",
    category: "Hormones",
    readTime: "8 min",
    author: "Dr. Sarah Chen",
    featured: false,
  },
  {
    title: "5 Recovery Protocols That Actually Work",
    excerpt: "Evidence-based recovery strategies to reduce soreness and accelerate gains.",
    category: "Recovery",
    readTime: "6 min",
    author: "Coach James Hartley",
    featured: false,
  },
  {
    title: "Nutrition Timing for Maximum Muscle",
    excerpt: "When and what to eat around your workouts for optimal protein synthesis.",
    category: "Nutrition",
    readTime: "10 min",
    author: "Dr. Emily Foster",
    featured: false,
  },
];

const Articles = () => {
  return (
    <section id="articles" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
              Knowledge Hub
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Expert{" "}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Insights
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              AI-powered articles and expert contributions covering training,
              nutrition, and lifestyle optimization.
            </p>
          </div>
          <Button variant="outline" size="lg" className="shrink-0">
            Browse All Articles
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Articles Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Article */}
          <Card variant="premium" className="lg:row-span-2 overflow-hidden group">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="h-64 bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <span className="text-primary text-sm font-semibold mb-2">
                  {articles[0].category}
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {articles[0].title}
                </h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{articles[0].author}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {articles[0].readTime} read
                      </div>
                    </div>
                  </div>
                  <Button variant="gold" size="sm" className="group/btn">
                    Read
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Articles */}
          {articles.slice(1).map((article) => (
            <Card key={article.title} variant="interactive" className="group">
              <CardContent className="p-6">
                <span className="text-primary text-sm font-semibold mb-2 block">
                  {article.category}
                </span>
                <h3 className="font-heading text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    {article.author}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Articles;

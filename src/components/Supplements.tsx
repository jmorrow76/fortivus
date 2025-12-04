import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Shield, Zap, Brain, Heart } from "lucide-react";

const supplements = [
  {
    name: "Testosterone Support Complex",
    brand: "Prime Vitality",
    description: "Clinically dosed ashwagandha, tongkat ali, and zinc for natural T optimization.",
    rating: 4.9,
    reviews: 2847,
    price: "$49.99",
    icon: Zap,
    tag: "Best Seller",
  },
  {
    name: "Joint Recovery Pro",
    brand: "FlexFit",
    description: "Glucosamine, MSM, and collagen peptides for joint health and mobility.",
    rating: 4.8,
    reviews: 1923,
    price: "$39.99",
    icon: Shield,
    tag: "Editor's Choice",
  },
  {
    name: "Cognitive Edge",
    brand: "NeuroMax",
    description: "Lion's mane, alpha-GPC, and bacopa for mental clarity and focus.",
    rating: 4.7,
    reviews: 1456,
    price: "$44.99",
    icon: Brain,
    tag: "Top Rated",
  },
  {
    name: "Heart & Circulation",
    brand: "CardioVite",
    description: "CoQ10, omega-3s, and beetroot extract for cardiovascular support.",
    rating: 4.8,
    reviews: 2134,
    price: "$54.99",
    icon: Heart,
    tag: "Essential",
  },
];

const Supplements = () => {
  return (
    <section id="supplements" className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
              Curated Supplements
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Science-Backed{" "}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Supplementation
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Every product vetted by our team. Only recommendations we'd take
              ourselves. Affiliate partnerships that align with our standards.
            </p>
          </div>
          <Button variant="outline" size="lg" className="shrink-0">
            View All Supplements
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Supplements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supplements.map((supplement) => (
            <Card key={supplement.name} variant="interactive" className="group">
              <CardContent className="p-6">
                {/* Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {supplement.tag}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <supplement.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">{supplement.brand}</p>
                  <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {supplement.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {supplement.description}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-semibold">{supplement.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({supplement.reviews.toLocaleString()} reviews)
                  </span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-heading text-xl font-bold text-primary">
                    {supplement.price}
                  </span>
                  <Button variant="gold" size="sm">
                    Shop Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            <Shield className="w-4 h-4 inline mr-2" />
            All products are third-party tested and verified. We earn commissions on purchases.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Supplements;

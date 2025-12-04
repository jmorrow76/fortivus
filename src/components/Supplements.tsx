import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Shield, Zap, Brain, Leaf } from "lucide-react";

const supplements = [
  {
    name: "AG1 Athletic Greens",
    brand: "AG1",
    description: "The ultimate daily nutritional foundation. 75 vitamins, minerals, and whole-food sourced nutrients in one scoop.",
    rating: 4.9,
    reviews: 12847,
    price: "$99/month",
    icon: Leaf,
    tag: "Featured Partner",
    affiliateUrl: "https://drinkag1.com/?utm_source=YOURAFFILIATEID", // Replace with your AG1 affiliate link
    logo: "AG1",
  },
  {
    name: "IM8 Performance Formula",
    brand: "IM8",
    description: "Advanced performance and recovery formula designed specifically for men over 40.",
    rating: 4.8,
    reviews: 3456,
    price: "$79.99",
    icon: Zap,
    tag: "Partner Brand",
    affiliateUrl: "https://im8.com/?ref=YOURAFFILIATEID", // Replace with your IM8 affiliate link
    logo: "IM8",
  },
  {
    name: "Caldera + Lab The Good",
    brand: "Caldera + Lab",
    description: "Multi-functional serum with 27 active botanicals. Clean, clinical skincare for men.",
    rating: 4.9,
    reviews: 2134,
    price: "$125",
    icon: Shield,
    tag: "Men's Skincare",
    affiliateUrl: "https://calderalab.com/?utm_source=YOURAFFILIATEID", // Replace with your Caldera Lab affiliate link
    logo: "Caldera Lab",
  },
  {
    name: "Testosterone Support",
    brand: "Amazon's Choice",
    description: "Clinically dosed ashwagandha, tongkat ali, and zinc for natural testosterone optimization.",
    rating: 4.7,
    reviews: 8923,
    price: "$39.99",
    icon: Brain,
    tag: "Amazon Pick",
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID", // Replace with your Amazon affiliate link
    logo: "Amazon",
  },
];

const Supplements = () => {
  const handleShopClick = (affiliateUrl: string) => {
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="supplements" className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
              Partner Supplements
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Science-Backed{" "}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Nutrition
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Exclusively partnered with premium brands we trust. Every product vetted 
              and tested by our team.
            </p>
          </div>
          <Button variant="outline" size="lg" className="shrink-0">
            View All Partners
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Featured AG1 Banner */}
        <div className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-green-900/30 via-green-800/20 to-emerald-900/30 border border-green-500/20">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold mb-4 inline-block">
                Official Partner
              </span>
              <h3 className="font-heading text-3xl font-bold mb-3">
                AG1 by Athletic Greens
              </h3>
              <p className="text-muted-foreground mb-4 max-w-xl">
                One scoop. 75 high-quality vitamins, minerals, and whole-food sourced nutrients. 
                The comprehensive daily nutrition drink trusted by elite athletes worldwide.
              </p>
              <Button 
                variant="gold" 
                size="lg"
                onClick={() => handleShopClick("https://drinkag1.com/?utm_source=YOURAFFILIATEID")}
              >
                Get AG1 + Free Gifts
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <span className="font-heading text-4xl font-bold text-green-400">AG1</span>
            </div>
          </div>
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
                  <Button 
                    variant="gold" 
                    size="sm"
                    onClick={() => handleShopClick(supplement.affiliateUrl)}
                  >
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
            Official affiliate partner. We earn commissions on purchases at no extra cost to you.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Supplements;

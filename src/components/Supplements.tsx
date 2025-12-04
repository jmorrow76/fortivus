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
    affiliateUrl: "https://drinkag1.com/?utm_source=YOURAFFILIATEID",
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
    affiliateUrl: "https://im8.com/?ref=YOURAFFILIATEID",
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
    affiliateUrl: "https://calderalab.com/?utm_source=YOURAFFILIATEID",
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
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID",
    logo: "Amazon",
  },
];

const Supplements = () => {
  const handleShopClick = (affiliateUrl: string) => {
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="supplements" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Subsection Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <h3 className="text-xl md:text-2xl font-medium">Supplements</h3>
          <Button variant="outline" size="sm" className="shrink-0 self-start md:self-auto">
            View All
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Featured AG1 Banner */}
        <div className="mb-12 p-6 lg:p-8 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-semibold mb-4 inline-block">
                Official Partner
              </span>
              <h3 className="font-heading text-2xl lg:text-3xl font-bold mb-3 text-foreground">
                AG1 by Athletic Greens
              </h3>
              <p className="text-muted-foreground mb-4 max-w-xl leading-relaxed">
                One scoop. 75 high-quality vitamins, minerals, and whole-food sourced nutrients. 
                The comprehensive daily nutrition drink trusted by elite athletes worldwide.
              </p>
              <Button 
                variant="default" 
                size="lg"
                onClick={() => handleShopClick("https://drinkag1.com/?utm_source=YOURAFFILIATEID")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Get AG1 + Free Gifts
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="w-40 h-40 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="font-heading text-3xl font-bold text-emerald-700">AG1</span>
            </div>
          </div>
        </div>

        {/* Supplements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supplements.map((supplement) => (
            <Card key={supplement.name} variant="interactive" className="group">
              <CardContent className="p-5">
                {/* Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold">
                    {supplement.tag}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <supplement.icon className="w-4 h-4 text-accent" />
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">{supplement.brand}</p>
                  <h3 className="font-heading text-base font-bold mb-2 group-hover:text-accent transition-colors">
                    {supplement.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {supplement.description}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="font-semibold text-sm">{supplement.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({supplement.reviews.toLocaleString()})
                  </span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-lg font-medium text-foreground">
                    {supplement.price}
                  </span>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleShopClick(supplement.affiliateUrl)}
                  >
                    Shop
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

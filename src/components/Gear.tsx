import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Shield } from "lucide-react";

const partnerBrands = [
  {
    name: "Municipal",
    tagline: "Performance Meets Style",
    description: "Mark Wahlberg's premium athletic brand. Built for those who demand excellence in training and life.",
    category: "Performance Apparel",
    featured: [
      { name: "Training Hoodie", price: "$88", rating: 4.9 },
      { name: "Performance Tee", price: "$48", rating: 4.8 },
      { name: "Jogger Pants", price: "$78", rating: 4.9 },
    ],
    affiliateUrl: "https://municipal.com/?ref=YOURAFFILIATEID",
    color: "from-blue-900/30 to-slate-900/30",
    accent: "blue",
  },
  {
    name: "Vuori",
    tagline: "Investment in Happiness",
    description: "Premium performance apparel that transitions seamlessly from gym to life. Sustainable and incredibly comfortable.",
    category: "Lifestyle Athletic",
    featured: [
      { name: "Kore Short", price: "$68", rating: 4.9 },
      { name: "Strato Tech Tee", price: "$58", rating: 4.8 },
      { name: "Meta Pant", price: "$98", rating: 4.9 },
    ],
    affiliateUrl: "https://vuori.com/?ref=YOURAFFILIATEID",
    color: "from-teal-900/30 to-cyan-900/30",
    accent: "teal",
  },
  {
    name: "Alo Yoga",
    tagline: "Mindful Movement",
    description: "Premium yoga and athleisure wear. Designed in LA for those who value quality, style, and mindful living.",
    category: "Yoga & Recovery",
    featured: [
      { name: "Warrior Compression", price: "$118", rating: 4.8 },
      { name: "Revival Tank", price: "$62", rating: 4.7 },
      { name: "Triumph Hoodie", price: "$148", rating: 4.9 },
    ],
    affiliateUrl: "https://aloyoga.com/?ref=YOURAFFILIATEID",
    color: "from-purple-900/30 to-indigo-900/30",
    accent: "purple",
  },
];

const amazonPicks = [
  { 
    name: "Adjustable Dumbbells", 
    brand: "Bowflex", 
    price: "$349", 
    rating: 4.8,
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID"
  },
  { 
    name: "Massage Gun Pro", 
    brand: "Theragun", 
    price: "$299", 
    rating: 4.8,
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID"
  },
  { 
    name: "Olympic Barbell", 
    brand: "Rogue Fitness", 
    price: "$295", 
    rating: 4.9,
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID"
  },
  { 
    name: "Foam Roller Set", 
    brand: "TriggerPoint", 
    price: "$45", 
    rating: 4.7,
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID"
  },
];

const Gear = () => {
  const handleShopClick = (affiliateUrl: string) => {
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="gear" className="py-24 bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
            Official Partners
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Premium{" "}
            <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Partner Brands
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Exclusively partnered with the brands we wear and trust. Quality gear 
            that performs as hard as you do.
          </p>
        </div>

        {/* Partner Brand Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {partnerBrands.map((brand) => (
            <Card 
              key={brand.name} 
              variant="glass" 
              className={`overflow-hidden bg-gradient-to-br ${brand.color} border-${brand.accent}-500/20`}
            >
              <CardContent className="p-6">
                {/* Brand Header */}
                <div className="mb-6 pb-4 border-b border-border/50">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 inline-block">
                    Official Partner
                  </span>
                  <h3 className="font-heading text-2xl font-bold mb-1">{brand.name}</h3>
                  <p className="text-sm text-primary font-medium">{brand.tagline}</p>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">
                  {brand.description}
                </p>

                {/* Featured Products */}
                <div className="space-y-3 mb-6">
                  {brand.featured.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-xl bg-background/30 hover:bg-background/50 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="text-xs text-muted-foreground">{item.rating}</span>
                        </div>
                      </div>
                      <span className="font-heading font-bold text-primary">{item.price}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="gold" 
                  className="w-full"
                  onClick={() => handleShopClick(brand.affiliateUrl)}
                >
                  Shop {brand.name}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Amazon Equipment Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-heading text-2xl font-bold mb-2">Training Equipment</h3>
              <p className="text-muted-foreground">Top-rated gear via our Amazon partnership</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => handleShopClick("https://amazon.com/shop/YOURSTOREFRONT")}
            >
              View All on Amazon
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {amazonPicks.map((item) => (
              <div
                key={item.name}
                onClick={() => handleShopClick(item.affiliateUrl)}
                className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card transition-all cursor-pointer group"
              >
                <p className="text-xs text-muted-foreground mb-1">{item.brand}</p>
                <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {item.name}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-xs text-muted-foreground">{item.rating}</span>
                  </div>
                  <span className="font-heading font-bold text-primary">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            <Shield className="w-4 h-4 inline mr-2" />
            Affiliate partnerships with brands we trust. We earn commissions at no extra cost to you.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Gear;

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
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    logoColor: "text-slate-900",
    logoBg: "bg-slate-900",
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
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    logoColor: "text-teal-700",
    logoBg: "bg-teal-600",
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
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    logoColor: "text-purple-700",
    logoBg: "bg-purple-600",
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
    <section id="gear" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Subsection Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <h3 className="text-xl md:text-2xl font-medium">Apparel & Gear</h3>
        </div>

        {/* Partner Brand Cards */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {partnerBrands.map((brand) => (
            <Card 
              key={brand.name} 
              className={`overflow-hidden ${brand.bgColor} ${brand.borderColor} border`}
            >
              <CardContent className="p-6">
                {/* Brand Logo */}
                <div className={`h-14 rounded-lg ${brand.logoBg} flex items-center justify-center mb-4`}>
                  <span className="font-heading text-lg font-bold tracking-[0.15em] uppercase text-white">
                    {brand.name}
                  </span>
                </div>
                
                {/* Brand Header */}
                <div className="mb-4 pb-4 border-b border-border">
                  <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold mb-2 inline-block">
                    Official Partner
                  </span>
                  <p className={`text-sm ${brand.logoColor} font-medium`}>{brand.tagline}</p>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {brand.description}
                </p>

                {/* Featured Products */}
                <div className="space-y-2 mb-6">
                  {brand.featured.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-card hover:shadow-subtle transition-all"
                    >
                      <div>
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span className="text-xs text-muted-foreground">{item.rating}</span>
                        </div>
                      </div>
                      <span className="font-heading font-bold text-accent">{item.price}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="default" 
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-heading text-xl font-bold mb-2">Training Equipment</h3>
              <p className="text-muted-foreground text-sm">Top-rated gear via our Amazon partnership</p>
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
                className="p-4 rounded-lg bg-card border border-border hover:border-accent/30 hover:shadow-subtle transition-all cursor-pointer group"
              >
                <p className="text-xs text-muted-foreground mb-1">{item.brand}</p>
                <h4 className="font-semibold text-sm mb-2 group-hover:text-accent transition-colors">
                  {item.name}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-xs text-muted-foreground">{item.rating}</span>
                  </div>
                  <span className="font-heading font-bold text-accent">{item.price}</span>
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

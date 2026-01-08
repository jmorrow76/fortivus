import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Shield, Zap, Brain, Leaf, Heart, Dumbbell } from "lucide-react";

const supplements = [
  {
    name: "AG1 Athletic Greens",
    brand: "AG1",
    description: "75 vitamins, minerals, and whole-food sourced nutrients in one scoop.",
    rating: 4.9,
    reviews: 12847,
    price: "$99/mo",
    tag: "Featured",
    affiliateUrl: "https://drinkag1.com/?utm_source=YOURAFFILIATEID",
    logo: "AG1",
    brandBg: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    name: "IM8 Performance Formula",
    brand: "IM8",
    description: "Advanced performance and recovery formula for men over 40.",
    rating: 4.8,
    reviews: 3456,
    price: "$79.99",
    tag: "Partner",
    affiliateUrl: "https://im8.com/?ref=YOURAFFILIATEID",
    logo: "IM8",
    brandBg: "bg-orange-50",
    textColor: "text-orange-600",
  },
  {
    name: "Caldera + Lab The Good",
    brand: "Caldera + Lab",
    description: "Multi-functional serum with 27 active botanicals for men.",
    rating: 4.9,
    reviews: 2134,
    price: "$125",
    tag: "Skincare",
    affiliateUrl: "https://calderalab.com/?utm_source=YOURAFFILIATEID",
    logo: "Caldera",
    brandBg: "bg-slate-100",
    textColor: "text-slate-700",
  },
  {
    name: "Testosterone Support",
    brand: "Amazon's Choice",
    description: "Ashwagandha, tongkat ali, and zinc for natural T optimization.",
    rating: 4.7,
    reviews: 8923,
    price: "$39.99",
    tag: "Amazon",
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID",
    logo: "Amazon",
    brandBg: "bg-amber-50",
    textColor: "text-amber-600",
  },
];

const essentials = [
  {
    name: "Omega-3 Fish Oil",
    brand: "Nordic Naturals",
    description: "High-potency omega-3 for heart, brain, and joint health.",
    rating: 4.8,
    reviews: 15234,
    price: "$45.99",
    icon: Heart,
    tag: "Heart",
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID",
    brandBg: "bg-blue-50",
  },
  {
    name: "Creatine Monohydrate",
    brand: "Thorne",
    description: "NSF certified. Supports muscle strength and cognitive function.",
    rating: 4.9,
    reviews: 7892,
    price: "$32.00",
    icon: Dumbbell,
    tag: "Strength",
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID",
    brandBg: "bg-indigo-50",
  },
  {
    name: "Vitamin D3 + K2",
    brand: "Sports Research",
    description: "Essential for bone health, immunity, and testosterone.",
    rating: 4.8,
    reviews: 11456,
    price: "$24.95",
    icon: Zap,
    tag: "Immunity",
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID",
    brandBg: "bg-yellow-50",
  },
  {
    name: "Magnesium Glycinate",
    brand: "Pure Encapsulations",
    description: "For sleep quality, muscle recovery, and stress management.",
    rating: 4.9,
    reviews: 9234,
    price: "$38.60",
    icon: Brain,
    tag: "Recovery",
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID",
    brandBg: "bg-purple-50",
  },
];

const Supplements = () => {
  const handleShopClick = (affiliateUrl: string) => {
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-44 md:pt-28">
        {/* Hero */}
        <section className="py-10 md:py-14 bg-secondary/20">
          <div className="container mx-auto px-4 text-center">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">Curated Selection</span>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight mt-2 mb-3">
              Premium <span className="text-accent">Supplements</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Hand-picked supplements for men over 40. Vetted for quality, efficacy, and value.
            </p>
          </div>
        </section>

        {/* Featured AG1 Banner */}
        <section className="py-8 md:py-10">
          <div className="container mx-auto px-4">
            <div className="p-5 md:p-8 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    Official Partner
                  </span>
                  <h2 className="text-xl md:text-2xl font-medium mt-3 mb-2 text-foreground">
                    AG1 by Athletic Greens
                  </h2>
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">
                    One scoop. 75 vitamins, minerals, and whole-food sourced nutrients. 
                    Trusted by elite athletes worldwide.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Leaf className="h-4 w-4 text-emerald-600" />
                      75 nutrients
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-emerald-600" />
                      Energy & focus
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      NSF Certified
                    </span>
                  </div>
                  <Button 
                    onClick={() => handleShopClick("https://drinkag1.com/?utm_source=YOURAFFILIATEID")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Get AG1 + Free Gifts
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="font-heading text-3xl font-bold text-emerald-700">AG1</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Supplements */}
        <section className="py-8 md:py-10 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <span className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">Partner Brands</span>
              <h2 className="text-2xl font-medium mt-2">Featured Supplements</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {supplements.map((item) => (
                <Card key={item.name} variant="interactive" className="group">
                  <CardContent className="p-4">
                    <div className={`h-12 rounded-lg ${item.brandBg} flex items-center justify-center mb-3`}>
                      <span className={`font-heading text-sm font-bold ${item.textColor}`}>
                        {item.logo}
                      </span>
                    </div>
                    
                    <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-semibold uppercase">
                      {item.tag}
                    </span>

                    <div className="mt-2 mb-3">
                      <p className="text-[10px] text-muted-foreground">{item.brand}</p>
                      <h3 className="font-medium text-sm leading-tight group-hover:text-accent transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span className="font-medium text-xs">{item.rating}</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({item.reviews.toLocaleString()})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="font-medium text-sm">{item.price}</span>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="h-7 text-xs px-3"
                        onClick={() => handleShopClick(item.affiliateUrl)}
                      >
                        Shop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Essential Supplements */}
        <section className="py-8 md:py-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <span className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">Essentials</span>
              <h2 className="text-2xl font-medium mt-2">Core Supplements for Men 40+</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {essentials.map((item) => (
                <Card key={item.name} variant="interactive" className="group">
                  <CardContent className="p-4">
                    <div className={`h-12 rounded-lg ${item.brandBg} flex items-center justify-center mb-3`}>
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-semibold uppercase">
                      {item.tag}
                    </span>

                    <div className="mt-2 mb-3">
                      <p className="text-[10px] text-muted-foreground">{item.brand}</p>
                      <h3 className="font-medium text-sm leading-tight group-hover:text-accent transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span className="font-medium text-xs">{item.rating}</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({item.reviews.toLocaleString()})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="font-medium text-sm">{item.price}</span>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="h-7 text-xs px-3"
                        onClick={() => handleShopClick(item.affiliateUrl)}
                      >
                        Shop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Badge */}
        <section className="py-8 bg-secondary/20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              Affiliate partner. We earn commissions at no extra cost to you.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Supplements;

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Shield, Zap, Brain, Leaf, Heart, Dumbbell } from "lucide-react";

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
    brandColor: "bg-emerald-500",
    brandBg: "bg-emerald-50",
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
    brandColor: "bg-orange-500",
    brandBg: "bg-orange-50",
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
    logo: "Caldera",
    brandColor: "bg-slate-800",
    brandBg: "bg-slate-100",
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
    brandColor: "bg-amber-500",
    brandBg: "bg-amber-50",
  },
];

const additionalSupplements = [
  {
    name: "Omega-3 Fish Oil",
    brand: "Nordic Naturals",
    description: "Ultra-pure, high-potency omega-3 for heart, brain, and joint health.",
    rating: 4.8,
    reviews: 15234,
    price: "$45.99",
    icon: Heart,
    tag: "Heart Health",
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID",
    logo: "Nordic",
    brandBg: "bg-blue-50",
  },
  {
    name: "Creatine Monohydrate",
    brand: "Thorne",
    description: "NSF certified for sport. Supports muscle strength, power output, and cognitive function.",
    rating: 4.9,
    reviews: 7892,
    price: "$32.00",
    icon: Dumbbell,
    tag: "Muscle & Strength",
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID",
    logo: "Thorne",
    brandBg: "bg-indigo-50",
  },
  {
    name: "Vitamin D3 + K2",
    brand: "Sports Research",
    description: "Essential for bone health, immune function, and testosterone production in men.",
    rating: 4.8,
    reviews: 11456,
    price: "$24.95",
    icon: Zap,
    tag: "Immunity",
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID",
    logo: "SR",
    brandBg: "bg-yellow-50",
  },
  {
    name: "Magnesium Glycinate",
    brand: "Pure Encapsulations",
    description: "Highly absorbable magnesium for sleep quality, muscle recovery, and stress management.",
    rating: 4.9,
    reviews: 9234,
    price: "$38.60",
    icon: Brain,
    tag: "Recovery",
    affiliateUrl: "https://amazon.com/dp/PRODUCTID?tag=YOURAMAZONID",
    logo: "Pure",
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
      <main className="pt-20">
        {/* Hero Section */}
        <section className="section-padding bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="section-label">Curated Selection</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
                Premium <span className="text-accent">Supplements</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hand-picked supplements for men over 40. Every product is vetted for quality, 
                efficacy, and value by our team of fitness experts.
              </p>
            </div>
          </div>
        </section>

        {/* Featured AG1 Banner */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="p-6 lg:p-10 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1">
                  <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-semibold mb-4 inline-block">
                    Official Partner
                  </span>
                  <h2 className="text-2xl lg:text-4xl font-medium mb-4 text-foreground">
                    AG1 by Athletic Greens
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-xl leading-relaxed text-lg">
                    One scoop. 75 high-quality vitamins, minerals, and whole-food sourced nutrients. 
                    The comprehensive daily nutrition drink trusted by elite athletes worldwide.
                  </p>
                  <ul className="space-y-2 mb-6 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-emerald-600" />
                      75 vitamins, minerals & nutrients
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-600" />
                      Supports energy & focus
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      NSF Certified for Sport
                    </li>
                  </ul>
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
                <div className="w-48 h-48 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="font-heading text-4xl font-bold text-emerald-700">AG1</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Supplements */}
        <section className="section-padding bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="section-header">
              <span className="section-label">Partner Brands</span>
              <h2 className="section-title">Featured Supplements</h2>
              <p className="section-description">
                Premium products from our trusted partner brands
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supplements.map((supplement) => (
                <Card key={supplement.name} variant="interactive" className="group">
                  <CardContent className="p-5">
                    <div className={`h-16 rounded-lg ${supplement.brandBg} flex items-center justify-center mb-4`}>
                      <span className={`font-heading text-lg font-bold ${supplement.brandColor === 'bg-slate-800' ? 'text-slate-800' : supplement.brandColor === 'bg-emerald-500' ? 'text-emerald-600' : supplement.brandColor === 'bg-orange-500' ? 'text-orange-600' : 'text-amber-600'}`}>
                        {supplement.logo}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold">
                        {supplement.tag}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">{supplement.brand}</p>
                      <h3 className="font-heading text-base font-bold mb-2 group-hover:text-accent transition-colors">
                        {supplement.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {supplement.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="font-semibold text-sm">{supplement.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({supplement.reviews.toLocaleString()})
                      </span>
                    </div>

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
          </div>
        </section>

        {/* Essential Supplements */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="section-header">
              <span className="section-label">Essentials</span>
              <h2 className="section-title">Core Supplements for Men 40+</h2>
              <p className="section-description">
                Science-backed essentials that every man over 40 should consider
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalSupplements.map((supplement) => (
                <Card key={supplement.name} variant="interactive" className="group">
                  <CardContent className="p-5">
                    <div className={`h-16 rounded-lg ${supplement.brandBg} flex items-center justify-center mb-4`}>
                      <supplement.icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold">
                        {supplement.tag}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">{supplement.brand}</p>
                      <h3 className="font-heading text-base font-bold mb-2 group-hover:text-accent transition-colors">
                        {supplement.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {supplement.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="font-semibold text-sm">{supplement.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({supplement.reviews.toLocaleString()})
                      </span>
                    </div>

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
          </div>
        </section>

        {/* Trust Badge */}
        <section className="section-padding bg-secondary/20">
          <div className="container mx-auto px-4 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">Trusted Partnerships</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We only recommend products we've personally tested and trust. As an affiliate partner, 
              we earn commissions on purchases at no extra cost to you.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Supplements;

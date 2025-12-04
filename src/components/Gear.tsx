import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star } from "lucide-react";

const gearCategories = [
  {
    category: "Training Equipment",
    items: [
      { name: "Adjustable Dumbbells", brand: "Bowflex", price: "$349", rating: 4.8 },
      { name: "Resistance Bands Set", brand: "Fit Simplify", price: "$29", rating: 4.7 },
      { name: "Olympic Barbell", brand: "Rogue", price: "$295", rating: 4.9 },
    ],
  },
  {
    category: "Performance Apparel",
    items: [
      { name: "Compression Shorts", brand: "Under Armour", price: "$35", rating: 4.6 },
      { name: "Training Shoes", brand: "Nike Metcon", price: "$130", rating: 4.8 },
      { name: "Lifting Belt", brand: "Gymreapers", price: "$45", rating: 4.9 },
    ],
  },
  {
    category: "Recovery Tools",
    items: [
      { name: "Massage Gun", brand: "Theragun", price: "$299", rating: 4.8 },
      { name: "Foam Roller", brand: "TriggerPoint", price: "$35", rating: 4.7 },
      { name: "Ice Bath Tub", brand: "The Cold Pod", price: "$149", rating: 4.6 },
    ],
  },
];

const Gear = () => {
  return (
    <section id="gear" className="py-24 bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
            Recommended Gear
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Equipment That{" "}
            <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Performs
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From home gym essentials to performance apparel, every piece is tested
            and approved by our team.
          </p>
        </div>

        {/* Gear Categories */}
        <div className="grid lg:grid-cols-3 gap-8">
          {gearCategories.map((category) => (
            <Card key={category.category} variant="glass" className="overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-heading text-xl font-bold mb-6 pb-4 border-b border-border">
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group cursor-pointer"
                    >
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          {item.brand}
                        </p>
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="text-xs text-muted-foreground">
                            {item.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-heading text-lg font-bold text-primary">
                          {item.price}
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6">
                  View All {category.category}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gear;

import { useState, useEffect } from "react";
import { ExternalLink, Star, Filter, Heart, Church } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  description: string | null;
  amazon_url: string;
  image_url: string | null;
  category: string;
  price: string | null;
  is_featured: boolean;
  sort_order: number;
}

const CATEGORIES = [
  { value: "all", label: "All Products" },
  { value: "supplements", label: "Supplements" },
  { value: "equipment", label: "Equipment" },
  { value: "apparel", label: "Apparel" },
  { value: "recovery", label: "Recovery" },
  { value: "nutrition", label: "Nutrition" },
  { value: "skincare", label: "Skin & Hair Care" },
  { value: "books", label: "Books" },
  { value: "general", label: "General" },
];

const Recommendations = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("recommended_products")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const featuredProducts = filteredProducts.filter(p => p.is_featured);
  const regularProducts = filteredProducts.filter(p => !p.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 md:pt-28 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            My Daily Essentials
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            These are the exact products I use every single day to support my health, training, and recovery. 
            I only recommend what I personally trust and have tested.
          </p>
          
          {/* Church Donation Badge */}
          <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-full px-6 py-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
              <Church className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">10% to Churches & Ministries</p>
              <p className="text-xs text-muted-foreground">Every purchase supports the Kingdom</p>
            </div>
            <Heart className="h-4 w-4 text-primary fill-primary" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No products found in this category.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-primary fill-primary" />
                  Featured Picks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Products */}
            {regularProducts.length > 0 && (
              <div>
                {featuredProducts.length > 0 && (
                  <h2 className="text-2xl font-serif font-bold mb-6">
                    All Recommendations
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Affiliate Disclosure */}
        <div className="mt-16 p-6 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Affiliate Disclosure:</strong> As an Amazon Associate, Fortivus earns from qualifying purchases. 
            10% of all proceeds go to support local churches and Christian ministries. 
            We only recommend products we genuinely believe in and use daily.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const ProductCard = ({ product, featured = false }: { product: Product; featured?: boolean }) => {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${featured ? 'ring-2 ring-primary/20' : ''}`}>
      {product.image_url && (
        <div className="aspect-square bg-muted overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
          {featured && (
            <Star className="h-5 w-5 text-primary fill-primary flex-shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
          </Badge>
          {product.price && (
            <span className="text-sm font-medium text-primary">{product.price}</span>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {product.description}
          </p>
        )}

        <Button asChild className="w-full">
          <a 
            href={product.amazon_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            View on Amazon
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Recommendations;

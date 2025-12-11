import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, ExternalLink, Star, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
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
  created_at: string;
}

const CATEGORIES = [
  { value: "supplements", label: "Supplements" },
  { value: "equipment", label: "Equipment" },
  { value: "apparel", label: "Apparel" },
  { value: "recovery", label: "Recovery" },
  { value: "nutrition", label: "Nutrition" },
  { value: "books", label: "Books" },
  { value: "general", label: "General" },
];

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amazonUrl, setAmazonUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("general");
  const [price, setPrice] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("recommended_products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAmazonUrl("");
    setImageUrl("");
    setCategory("general");
    setPrice("");
    setIsFeatured(false);
    setSortOrder(0);
    setEditingProduct(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description || "");
    setAmazonUrl(product.amazon_url);
    setImageUrl(product.image_url || "");
    setCategory(product.category);
    setPrice(product.price || "");
    setIsFeatured(product.is_featured);
    setSortOrder(product.sort_order);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !amazonUrl.trim()) {
      toast({
        title: "Missing fields",
        description: "Title and Amazon URL are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const productData = {
        title: title.trim(),
        description: description.trim() || null,
        amazon_url: amazonUrl.trim(),
        image_url: imageUrl.trim() || null,
        category,
        price: price.trim() || null,
        is_featured: isFeatured,
        sort_order: sortOrder,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("recommended_products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from("recommended_products")
          .insert(productData);

        if (error) throw error;
        toast({ title: "Product added successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("recommended_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Product deleted" });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("recommended_products")
        .update({ is_featured: !product.is_featured })
        .eq("id", product.id);

      if (error) throw error;
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Amazon Product Recommendations
              </CardTitle>
              <CardDescription>
                Manage products displayed on the recommendations page
              </CardDescription>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products added yet</p>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <span className="text-muted-foreground">{product.sort_order}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{product.title}</p>
                          <a 
                            href={product.amazon_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            View on Amazon <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.price || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(product)}
                      >
                        <Star className={`h-4 w-4 ${product.is_featured ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              Add an Amazon affiliate product link to recommend to users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amazon-url">Amazon Affiliate URL *</Label>
              <Input
                id="amazon-url"
                placeholder="https://www.amazon.com/dp/..."
                value={amazonUrl}
                onChange={(e) => setAmazonUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste your full Amazon affiliate link including your tag
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                placeholder="Product name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Why do you recommend this product?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Product image URL (you can use Amazon product images)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-2">
                <Label htmlFor="price">Price (display only)</Label>
                <Input
                  id="price"
                  placeholder="$29.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort-order">Sort Order</Label>
                <Input
                  id="sort-order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="featured">Featured Product</Label>
                  <p className="text-xs text-muted-foreground">Show in featured section</p>
                </div>
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingProduct ? "Update" : "Add"} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;

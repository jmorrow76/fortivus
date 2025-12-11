-- Create table for Amazon product recommendations
CREATE TABLE public.recommended_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  amazon_url TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  price TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recommended_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products (public page)
CREATE POLICY "Anyone can view recommended products"
ON public.recommended_products
FOR SELECT
USING (true);

-- Only admins can manage products
CREATE POLICY "Admins can insert products"
ON public.recommended_products
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.recommended_products
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.recommended_products
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_recommended_products_updated_at
BEFORE UPDATE ON public.recommended_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
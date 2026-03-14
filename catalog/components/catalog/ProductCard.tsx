"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { motion } from "motion/react";

interface ProductCardProps {
  product: any;
  isFinishedGood?: boolean;
  index?: number;
}

export function ProductCard({ product, isFinishedGood = false, index = 0 }: ProductCardProps) {
  // Handle finished goods linking to their parent product for images
  const displayProduct = isFinishedGood && product.products ? product.products : product;
  const imageUrl = displayProduct.image_url || "https://placehold.co/600x800/e2e8f0/1e293b?text=No+Image";
  const price = isFinishedGood ? product.selling_price : product.base_price;
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);

  const getStockBadge = () => {
    if (!isFinishedGood) return null;
    if (product.stock_quantity <= 0) return <Badge variant="destructive" className="absolute top-2 right-2 z-10">Out of Stock</Badge>;
    if (product.stock_quantity < 5) return <Badge variant="secondary" className="absolute top-2 right-2 z-10 bg-orange-100 text-orange-800 hover:bg-orange-100">Low Stock</Badge>;
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group flex flex-col gap-3"
    >
      <Link href={`/product/${isFinishedGood ? `rtw-${product.id}` : product.id}`} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
        {getStockBadge()}
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
      </Link>
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
          {isFinishedGood && <Badge variant="outline" className="text-[10px]">Ready to Wear</Badge>}
        </div>
        <Link href={`/product/${isFinishedGood ? `rtw-${product.id}` : product.id}`}>
          <h3 className="font-serif text-lg font-medium leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="font-medium text-foreground">{formattedPrice}</p>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { Input } from "@/components/ui/Input";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CatalogViewProps {
  products: any[];
  finishedGoods: any[];
  categories: string[];
}

export function CatalogView({ products, finishedGoods, categories }: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeType, setActiveType] = useState<"all" | "custom" | "rtw">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");

  const filteredItems = useMemo(() => {
    let items: any[] = [];
    
    if (activeType === "all" || activeType === "custom") {
      items = [...items, ...products.map(p => ({ ...p, _type: 'custom' }))];
    }
    
    if (activeType === "all" || activeType === "rtw") {
      items = [...items, ...finishedGoods.map(p => ({ ...p, _type: 'rtw' }))];
    }

    // Filter by category
    if (activeCategory !== "All") {
      items = items.filter(item => item.category === activeCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    // Sort
    items.sort((a, b) => {
      if (sortBy === "price-asc") {
        const priceA = a._type === 'rtw' ? a.selling_price : a.base_price;
        const priceB = b._type === 'rtw' ? b.selling_price : b.base_price;
        return priceA - priceB;
      }
      if (sortBy === "price-desc") {
        const priceA = a._type === 'rtw' ? a.selling_price : a.base_price;
        const priceB = b._type === 'rtw' ? b.selling_price : b.base_price;
        return priceB - priceA;
      }
      // newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return items;
  }, [products, finishedGoods, activeCategory, activeType, searchQuery, sortBy]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Search</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Collection Type</h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveType("all")}
              className={`text-left text-sm py-1 transition-colors ${activeType === "all" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              All Collections
            </button>
            <button 
              onClick={() => setActiveType("custom")}
              className={`text-left text-sm py-1 transition-colors ${activeType === "custom" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Bespoke / Custom Design
            </button>
            <button 
              onClick={() => setActiveType("rtw")}
              className={`text-left text-sm py-1 transition-colors ${activeType === "rtw" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Ready to Wear
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Categories</h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveCategory("All")}
              className={`text-left text-sm py-1 transition-colors ${activeCategory === "All" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button 
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-left text-sm py-1 transition-colors ${activeCategory === category ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredItems.length}</span> products
          </p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select 
              className="text-sm border-none bg-transparent focus:ring-0 cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <ProductCard 
                key={`${item._type}-${item.id}`} 
                product={item} 
                isFinishedGood={item._type === 'rtw'} 
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 border rounded-lg bg-secondary/50">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-muted-foreground text-sm max-w-md">
              We couldn&apos;t find any products matching your current filters. Try adjusting your search or category selection.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setActiveCategory("All");
              setActiveType("all");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

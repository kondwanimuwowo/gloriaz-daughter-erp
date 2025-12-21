import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { productService } from "../../services/productService";
import ProductCard from "../../components/catalog/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CatalogHome() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allProducts, featured, cats] = await Promise.all([
        productService.getAllProducts(),
        productService.getFeaturedProducts(),
        productService.getCategories(),
      ]);
      
      setProducts(allProducts || []);
      setFeaturedProducts(featured || []);
      setCategories(cats || []);
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Failed to load products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.base_price - b.base_price;
        case "price-high":
          return b.base_price - a.base_price;
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-[#2C2C2C] mb-4">
          Discover Our Collection
        </h1>
        <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
          Handcrafted garments celebrating Zambian heritage with contemporary elegance
        </p>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-[#2C2C2C] mb-6">
            Featured Designs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#6B6B6B] mt-4">Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="px-6 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#6B6B6B] text-lg">No products found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-[#6B6B6B]">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

export default function ProductCard({ product }) {
  const getStockBadge = () => {
    switch (product.stock_status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>;
      case 'made_to_order':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Made to Order</Badge>;
      default:
        return null;
    }
  };

  const getPriceDisplay = () => {
    if (product.customizable) {
      return `Starting from K${product.base_price.toLocaleString()}`;
    }
    return `K${product.base_price.toLocaleString()}`;
  };

  const whatsappUrl = `https://wa.me/260976999510?text=${encodeURIComponent(
    `Hi! I'm interested in the ${product.name}. Can you tell me more?`
  )}`;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image Container */}
      <Link to={`/catalog/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        
        {/* Stock Badge */}
        <div className="absolute top-3 left-3">
          {getStockBadge()}
        </div>

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-[#D4AF37] text-white border-[#D4AF37]">Featured</Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">
          {product.category}
        </p>

        {/* Product Name */}
        <Link to={`/catalog/${product.id}`}>
          <h3 className="font-['Playfair_Display'] text-lg font-semibold text-[#2C2C2C] mb-2 line-clamp-2 group-hover:text-[#8B4513] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-[#8B4513] font-bold text-lg mb-3">
          {getPriceDisplay()}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/catalog/${product.id}`}
            className="flex-1 bg-[#8B4513] hover:bg-[#A0522D] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center"
          >
            View Details
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white p-2 rounded-lg transition-colors flex items-center justify-center"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}

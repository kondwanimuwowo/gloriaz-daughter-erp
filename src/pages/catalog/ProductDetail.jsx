import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone, Mail, Clock, Ruler, Sparkles } from "lucide-react";
import { productService } from "../../services/productService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProductCard from "../../components/catalog/ProductCard";
import InquiryForm from "../../components/catalog/InquiryForm";
import WhatsAppButton from "../../components/catalog/WhatsAppButton";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(productId);
      setProduct(data);

      // Load related products
      if (data.category) {
        const related = await productService.getRelatedProducts(
          productId,
          data.category,
          4
        );
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#6B6B6B] mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">Product Not Found</h2>
        <Button onClick={() => navigate("/catalog")}>Back to Catalog</Button>
      </div>
    );
  }

  const images = useMemo(() => {
    if (!product) return [];
    
    // Start with the main image
    const imgs = [product.image_url];
    
    // Add unique gallery images
    if (product.gallery_images && Array.isArray(product.gallery_images)) {
      product.gallery_images.forEach(img => {
        if (img && img !== product.image_url && !imgs.includes(img)) {
          imgs.push(img);
        }
      });
    }
    
    return imgs;
  }, [product]);

  const getPriceDisplay = () => {
    if (product.customizable) {
      return (
        <div>
          <p className="text-sm text-[#6B6B6B] mb-1">Starting from</p>
          <p className="text-4xl font-bold text-[#8B4513]">
            K{product.base_price.toLocaleString()}
          </p>
        </div>
      );
    }
    return (
      <p className="text-4xl font-bold text-[#8B4513]">
        K{product.base_price.toLocaleString()}
      </p>
    );
  };

  const getStockBadge = () => {
    const badges = {
      in_stock: { text: "In Stock", className: "bg-green-100 text-green-800 border-green-200" },
      low_stock: { text: "Low Stock", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      out_of_stock: { text: "Out of Stock", className: "bg-red-100 text-red-800 border-red-200" },
      made_to_order: { text: "Made to Order", className: "bg-blue-100 text-blue-800 border-blue-200" },
    };
    const badge = badges[product.stock_status] || badges.made_to_order;
    return <Badge className={badge.className}>{badge.text}</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/catalog")}
        className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#8B4513] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Product Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Image Gallery */}
        <div>
          {/* Main Image */}
          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4 group">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                imageZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onClick={() => setImageZoomed(!imageZoomed)}
            />
            {product.featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-[#D4AF37] text-white border-[#D4AF37]">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? "border-[#8B4513] ring-2 ring-[#8B4513]/20"
                      : "border-gray-200 hover:border-[#8B4513]/50"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Category & Stock */}
          <div className="flex items-center gap-3 mb-3">
            <p className="text-sm text-[#6B6B6B] uppercase tracking-wide">
              {product.category}
            </p>
            {getStockBadge()}
          </div>

          {/* Product Name */}
          <h1 className="text-3xl md:text-4xl font-['Playfair_Display'] font-bold text-[#2C2C2C] mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mb-6">{getPriceDisplay()}</div>

          {/* Description */}
          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-[#2C2C2C] leading-relaxed">{product.description}</p>
          </div>

          {/* Product Details */}
          <div className="space-y-4 mb-8 bg-gray-50 rounded-lg p-4">
            {product.fabric_details && (
              <div className="flex gap-3">
                <Ruler className="h-5 w-5 text-[#8B4513] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#2C2C2C] mb-1">Fabric Details</p>
                  <p className="text-sm text-[#6B6B6B]">{product.fabric_details}</p>
                </div>
              </div>
            )}

            {product.care_instructions && (
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-[#8B4513] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#2C2C2C] mb-1">Care Instructions</p>
                  <p className="text-sm text-[#6B6B6B]">{product.care_instructions}</p>
                </div>
              </div>
            )}

            {product.estimated_days && (
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-[#8B4513] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#2C2C2C] mb-1">Production Time</p>
                  <p className="text-sm text-[#6B6B6B]">
                    Ready in {product.estimated_days} days
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => setShowInquiryForm(true)}
              className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white py-6 text-lg"
              size="lg"
            >
              Request This Design
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/260976999510?text=${encodeURIComponent(
                  `Hi! I'm interested in the ${product.name}. Can you tell me more?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp</span>
              </a>

              <a
                href="tel:+260976999510"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white rounded-lg transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>Call Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-[#2C2C2C] mb-6">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <InquiryForm
          product={product}
          onClose={() => setShowInquiryForm(false)}
        />
      )}

      {/* WhatsApp Floating Button */}
      <WhatsAppButton productName={product.name} />
    </div>
  );
}

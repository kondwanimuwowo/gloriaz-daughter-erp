"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { ChevronRight, Ruler, Info, Clock, MessageCircle, Sparkles } from "lucide-react";

interface ProductDetailClientProps {
  product: any;
  isFinishedGood: boolean;
}

export function ProductDetailClient({ product, isFinishedGood }: ProductDetailClientProps) {
  const displayProduct = isFinishedGood && product.products ? product.products : product;
  
  const [activeImage, setActiveImage] = useState(displayProduct.image_url || "https://placehold.co/800x1000/e2e8f0/1e293b?text=No+Image");
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const galleryImages = [
    displayProduct.image_url,
    ...(displayProduct.gallery_images || [])
  ].filter(Boolean);

  const price = isFinishedGood ? product.selling_price : product.base_price;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const handleBuyNow = () => {
    if (!whatsappNumber) return;
    const message = encodeURIComponent(`Hi Gloria's Daughter, I'm interested in buying the ready-to-wear item: ${product.name} (SKU: ${product.finished_product_sku || 'N/A'}).`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-secondary">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        
        {galleryImages.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-secondary snap-start transition-all ${activeImage === img ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
              >
                <Image
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col pt-4 md:pt-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </span>
          {isFinishedGood && <Badge variant="secondary">Ready to Wear</Badge>}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">{product.name}</h1>
        <p className="text-2xl font-medium text-foreground mb-6">{formattedPrice}</p>
        
        <div className="prose prose-sm md:prose-base text-muted-foreground mb-8">
          <p>{product.description || displayProduct.description || "No description available."}</p>
        </div>

        <div className="space-y-6 mb-10">
          {isFinishedGood ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Availability:</span>
                {product.stock_quantity > 0 ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock ({product.stock_quantity} available)</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
              {whatsappNumber && (
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full text-base"
                  onClick={handleBuyNow}
                  disabled={product.stock_quantity <= 0}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Buy via WhatsApp
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayProduct.estimated_days && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Estimated production time: <strong className="text-foreground">{displayProduct.estimated_days} days</strong></span>
                </div>
              )}
              <Button 
                size="lg" 
                className="w-full sm:w-auto rounded-full text-base"
                onClick={() => setIsInquiryModalOpen(true)}
              >
                Enquire About This Design
              </Button>
            </div>
          )}
        </div>

        {/* Accordions / Details */}
        <div className="border-t pt-6 space-y-6">
          {displayProduct.fabric_details && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg">
                <Info className="h-5 w-5 text-primary" /> Fabric & Details
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                {displayProduct.fabric_details}
              </p>
            </div>
          )}
          
          {displayProduct.size_guide && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg">
                <Ruler className="h-5 w-5 text-primary" /> Size Guide
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                {displayProduct.size_guide}
              </p>
            </div>
          )}
          
          {displayProduct.care_instructions && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg">
                <Sparkles className="h-5 w-5 text-primary" /> Care Instructions
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                {displayProduct.care_instructions}
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isInquiryModalOpen} 
        onClose={() => setIsInquiryModalOpen(false)}
        title={`Enquire: ${product.name}`}
      >
        <InquiryForm 
          productId={product.id} 
          productName={product.name} 
          onSuccess={() => {
            // Optional: close modal after success
            // setTimeout(() => setIsInquiryModalOpen(false), 3000);
          }}
        />
      </Modal>
    </div>
  );
}

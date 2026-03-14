import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { getFeaturedProducts } from "@/services/catalogService";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ArrowRight, Scissors, Ruler, Sparkles } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://placehold.co/1920x1080/1a1a1a/ffffff?text=Luxury+Fashion"
            alt="Hero Background"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white max-w-4xl tracking-tight">
            Bespoke Fashion, <br className="hidden md:block" />
            <span className="text-primary">Crafted for You</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl font-light">
            Discover our premium collection of tailored garments and ready-to-wear luxury pieces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="rounded-full text-base px-8">
              <Link href="/catalog">Browse Collection</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full text-base px-8 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm">
              <Link href="/catalog?custom=true">Request Custom Design</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Designs */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-10">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold">Featured Designs</h2>
                <p className="text-muted-foreground">Curated selections from our latest collection.</p>
              </div>
              <Link href="/catalog" className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
            
            <div className="mt-8 flex justify-center md:hidden">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/catalog">View All Collection</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold">The Bespoke Experience</h2>
            <p className="text-muted-foreground">
              Our custom tailoring process is designed to ensure your garment fits perfectly and matches your exact vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-border z-0" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-background flex items-center justify-center shadow-sm border">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">1. Browse & Enquire</h3>
              <p className="text-muted-foreground text-sm">
                Explore our catalog of designs and submit an inquiry for the piece that catches your eye.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-background flex items-center justify-center shadow-sm border">
                <Ruler className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">2. Get Fitted</h3>
              <p className="text-muted-foreground text-sm">
                Visit our studio for precise measurements, or provide your own. We&apos;ll discuss fabrics and details.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-background flex items-center justify-center shadow-sm border">
                <Scissors className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">3. Crafting & Delivery</h3>
              <p className="text-muted-foreground text-sm">
                Our master tailors bring your vision to life. After a final fitting, your bespoke piece is ready.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

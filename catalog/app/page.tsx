import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts } from "@/services/catalogService";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ArrowRight, Scissors, Ruler, Sparkles } from "lucide-react";

export const revalidate = 3600;

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[100vh] w-full flex items-center justify-center overflow-hidden grain">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-2.jpg"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-warm-black/70 via-warm-black/40 to-warm-black/80" />
        </div>

        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center">
          <p className="animate-fade-up text-xs md:text-sm font-medium uppercase tracking-[0.35em] text-champagne mb-6">
            Bespoke Fashion House
          </p>
          <h1 className="animate-fade-up delay-100 text-5xl md:text-7xl lg:text-8xl font-serif font-light text-white max-w-5xl leading-[0.95] tracking-tight">
            Crafted for the
            <span className="block font-semibold italic text-champagne-light mt-2">Modern Individual</span>
          </h1>
          <p className="animate-fade-up delay-200 text-base md:text-lg text-white/70 max-w-xl mt-8 font-light leading-relaxed">
            Discover our collection of tailored garments and ready-to-wear luxury pieces, each made with meticulous attention to detail.
          </p>
          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4 mt-12">
            <Link
              href="/catalog"
              className="text-xs font-bold uppercase tracking-[0.2em] bg-white text-black px-10 py-4 hover:bg-white/90 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
            >
              Browse Collection
            </Link>
            <Link
              href="/catalog?custom=true"
              className="text-xs font-bold uppercase tracking-[0.2em] border border-white/30 text-white px-10 py-4 hover:bg-white/10 backdrop-blur-md transition-all duration-300"
            >
              Request Custom Design
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-fade-in delay-600">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* Featured Designs */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-24 md:py-32 bg-background relative grain">
          <div className="container mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
                  Curated Selection
                </p>
                <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight">Featured Designs</h2>
              </div>
              <Link
                href="/catalog"
                className="hidden md:inline-flex items-center gap-3 link-underline text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.slice(0, 12).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            <div className="mt-12 flex justify-center md:hidden">
              <Link
                href="/catalog"
                className="text-sm font-medium uppercase tracking-[0.15em] border border-foreground px-8 py-3 text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
              >
                View All Collection
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bespoke Experience */}
      <section className="py-24 md:py-32 bg-warm-black text-white relative overflow-hidden grain">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-champagne">
              How It Works
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight">
              The Bespoke Experience
            </h2>
            <p className="text-white/50 font-light mt-4 leading-relaxed">
              Our custom tailoring process ensures your garment fits perfectly and matches your exact vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-champagne/30 to-transparent" />

            {[
              {
                icon: Sparkles,
                step: "01",
                title: "Browse & Enquire",
                desc: "Explore our catalog of designs and submit an inquiry for the piece that catches your eye.",
              },
              {
                icon: Ruler,
                step: "02",
                title: "Get Fitted",
                desc: "Visit our studio for precise measurements, or provide your own. We'll discuss fabrics and details.",
              },
              {
                icon: Scissors,
                step: "03",
                title: "Crafting & Delivery",
                desc: "Our master tailors bring your vision to life. After a final fitting, your bespoke piece is ready.",
              },
            ].map((item) => (
              <div key={item.step} className="relative z-10 flex flex-col items-center text-center space-y-5 group hover:-translate-y-3 transition-transform duration-500 ease-out cursor-default">
                <div className="h-20 w-20 rounded-full border border-champagne/30 flex items-center justify-center transition-colors duration-500 group-hover:border-champagne group-hover:bg-champagne/10 shadow-[0_0_0_rgba(212,175,55,0)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                  <item.icon className="h-8 w-8 text-champagne group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                </div>
                <span className="text-xs tracking-[0.3em] text-champagne/60 font-medium group-hover:text-champagne transition-colors">{item.step}</span>
                <h3 className="text-xl font-serif font-medium">{item.title}</h3>
                <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

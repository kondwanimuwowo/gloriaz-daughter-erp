import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://placehold.co/1920x800/2a2a2a/ffffff?text=Our+Story"
            alt="About Gloria's Daughter"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight">Our Story</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="prose prose-lg md:prose-xl mx-auto font-serif text-muted-foreground leading-relaxed">
            <p className="text-2xl text-foreground font-medium text-center mb-12">
              &quot;Gloria&apos;s Daughter was born from a legacy of craftsmanship, dedication to detail, and a profound love for the art of tailoring.&quot;
            </p>
            
            <p>
              Founded on the principles of timeless elegance and modern sophistication, Gloria&apos;s Daughter represents the pinnacle of bespoke fashion. Every garment we create is a testament to our commitment to quality, designed not just to be worn, but to be experienced.
            </p>
            
            <p>
              Our journey began with a simple belief: that clothing should be an extension of one&apos;s identity. We source only the finest fabrics from around the world, ensuring that each piece feels as luxurious as it looks. Our master tailors bring decades of experience to every stitch, combining traditional techniques with contemporary design sensibilities.
            </p>
            
            <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image src="https://placehold.co/800x800/e2e8f0/1e293b?text=Studio+1" alt="Studio" fill className="object-cover" />
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image src="https://placehold.co/800x800/e2e8f0/1e293b?text=Studio+2" alt="Craftsmanship" fill className="object-cover" />
              </div>
            </div>
            
            <p>
              Whether you are looking for a custom-designed suit that commands attention, an elegant dress for a special occasion, or a ready-to-wear piece that elevates your everyday wardrobe, Gloria&apos;s Daughter is here to bring your vision to life.
            </p>
            
            <p>
              We invite you to explore our collection, book a fitting, and experience the difference of true bespoke tailoring.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

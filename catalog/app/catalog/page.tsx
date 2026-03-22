import { getCustomDesigns, getFinishedGoods, getCategories } from "@/services/catalogService";
import { CatalogView } from "@/components/catalog/CatalogView";

export const revalidate = 60;

export default async function CatalogPage() {
  const [products, finishedGoods, categories] = await Promise.all([
    getCustomDesigns(),
    getFinishedGoods(),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="pt-32 pb-8 md:pt-40 md:pb-12 bg-background">
        <div className="container mx-auto px-6 md:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary mb-3">
            Explore
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight">Our Collection</h1>
          <div className="w-12 h-px bg-primary mt-6" />
        </div>
      </section>

      {/* Catalog */}
      <section className="pb-24 md:pb-32 bg-background">
        <div className="container mx-auto px-6 md:px-8">
          <CatalogView
            products={products || []}
            finishedGoods={finishedGoods || []}
            categories={categories || []}
          />
        </div>
      </section>
    </div>
  );
}

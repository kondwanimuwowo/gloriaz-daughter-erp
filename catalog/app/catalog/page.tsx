import { getProducts, getFinishedGoods, getCategories } from "@/services/catalogService";
import { CatalogView } from "@/components/catalog/CatalogView";

export const revalidate = 60; // Revalidate every minute

export default async function CatalogPage() {
  const [products, finishedGoods, categories] = await Promise.all([
    getProducts(),
    getFinishedGoods(),
    getCategories()
  ]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="mb-12 text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold">Our Collection</h1>
        <p className="text-muted-foreground text-lg">
          Explore our exquisite range of bespoke designs and ready-to-wear garments, crafted with precision and passion.
        </p>
      </div>
      
      <CatalogView 
        products={products || []} 
        finishedGoods={finishedGoods || []} 
        categories={categories || []} 
      />
    </div>
  );
}

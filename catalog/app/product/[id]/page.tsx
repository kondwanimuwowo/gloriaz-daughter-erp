import { getProductById, getFinishedGoodById } from "@/services/catalogService";
import { ProductDetailClient } from "@/components/catalog/ProductDetailClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const isFinishedGood = id.startsWith('rtw-');
  const actualId = isFinishedGood ? id.replace('rtw-', '') : id;
  
  let product = null;
  
  if (isFinishedGood) {
    product = await getFinishedGoodById(actualId);
  } else {
    product = await getProductById(actualId);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Collection
      </Link>
      
      <ProductDetailClient product={product} isFinishedGood={isFinishedGood} />
    </div>
  );
}

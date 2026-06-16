import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    notFound();
  }

  const categoriesResult = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    where: { category: { not: null } }
  });
  const categories = categoriesResult.map(c => c.category as string).filter(c => c.trim() !== "").sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground ">Edit Product</h1>
        <p className="mt-1 text-sm text-muted-foreground ">
          Update the details of this product below.
        </p>
      </div>

      <ProductForm initialData={product} existingCategories={categories} />
    </div>
  );
}

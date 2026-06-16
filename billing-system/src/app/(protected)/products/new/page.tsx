import { ProductForm } from "@/components/ProductForm";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const categoriesResult = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    where: { category: { not: null } }
  });
  const categories = categoriesResult.map(c => c.category as string).filter(c => c.trim() !== "").sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground ">Add New Product</h1>
        <p className="mt-1 text-sm text-muted-foreground ">
          Fill in the details below to add a new product to your inventory.
        </p>
      </div>

      <ProductForm existingCategories={categories} />
    </div>
  );
}

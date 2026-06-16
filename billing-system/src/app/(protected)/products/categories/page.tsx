import { prisma } from "@/lib/prisma";
import { ManageCategoriesList } from "@/components/ManageCategoriesList";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";

export default async function CategoriesPage() {
  await requireAdmin();

  const groupedCategories = await prisma.product.groupBy({
    by: ['category'],
    _count: { category: true },
    where: { category: { not: null } }
  });

  const categories = groupedCategories
    .map(g => ({
      name: g.category as string,
      count: g._count.category
    }))
    .filter(c => c.name.trim() !== "")
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-4xl animate-fade-in space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-border/50">
        <Link
          href="/products"
          className="p-2 rounded-xl text-muted-foreground/80 hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Tag className="h-6 w-6 text-indigo-500" />
            Manage Categories
          </h1>
          <p className="page-subtitle mt-1">
            Rename or delete categories across all your products
          </p>
        </div>
      </div>

      <ManageCategoriesList categories={categories} />
    </div>
  );
}

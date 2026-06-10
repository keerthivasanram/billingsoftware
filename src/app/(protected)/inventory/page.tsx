import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertTriangle, Edit, Package, CheckCircle, TrendingDown } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export default async function InventoryPage() {
  await requireAdmin();
  const LOW_STOCK_THRESHOLD = 10;

  const [lowStockProducts, totalProducts, outOfStockCount] = await Promise.all([
    prisma.product.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { stock: 0 } }),
  ]);

  const criticalCount = lowStockProducts.filter((p) => p.stock === 0).length;
  const warningCount = lowStockProducts.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-border/50">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Inventory Alerts</h1>
            <p className="page-subtitle mt-1">Monitor stock levels and reorder items before they run out</p>
          </div>
          {lowStockProducts.length > 0 && (
            <span className="badge badge-danger text-sm px-3 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              {lowStockProducts.length} item{lowStockProducts.length !== 1 ? "s" : ""} need attention
            </span>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground">{criticalCount}</p>
            <p className="text-sm text-muted-foreground font-medium">Out of Stock</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground">{warningCount}</p>
            <p className="text-sm text-muted-foreground font-medium">Low Stock</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground">{totalProducts}</p>
            <p className="text-sm text-muted-foreground font-medium">Total Products</p>
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-rose-50/30">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div>
            <h2 className="section-title text-rose-900">Low Stock Items</h2>
            <p className="section-subtitle text-rose-600/70">Items with stock ≤ {LOW_STOCK_THRESHOLD} units</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Unit Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                        <CheckCircle className="h-7 w-7 text-emerald-500" />
                      </div>
                      <p className="font-semibold text-foreground/90">All stocked up!</p>
                      <p className="text-sm mt-1">No products are currently low on stock.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${product.stock === 0 ? "bg-rose-50" : "bg-amber-50"}`}>
                          <Package className={`h-4 w-4 ${product.stock === 0 ? "text-rose-500" : "text-amber-500"}`} />
                        </div>
                        <span className="font-semibold text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td>
                      {product.barcode ? (
                        <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded-md text-muted-foreground">{product.barcode}</span>
                      ) : (
                        <span className="text-muted-foreground/80 text-xs">—</span>
                      )}
                    </td>
                    <td>
                      {product.category ? (
                        <span className="badge badge-default">{product.category}</span>
                      ) : (
                        <span className="text-muted-foreground/80 text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold text-sm ${
                          product.stock === 0 ? "text-rose-600" : "text-amber-600"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${product.stock === 0 ? "bg-rose-500 animate-pulse" : "bg-amber-500"}`} />
                        {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                      </span>
                    </td>
                    <td className="font-semibold text-foreground">₹{product.price.toFixed(2)}</td>
                    <td>
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Restock
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

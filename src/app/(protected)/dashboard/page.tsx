import { prisma } from "@/lib/prisma";
import {
  IndianRupee,
  Package,
  ReceiptText,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  PieChart as PieChartIcon
} from "lucide-react";
import { RevenueBarChart } from "@/components/dashboard/RevenueBarChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdmin();
  const resolvedSearchParams = await searchParams;
  const { range = "7d" } = resolvedSearchParams;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Determine chart range date
  const chartStartDate = new Date();
  let daysInChart = 7;
  
  if (range === "30d") {
    daysInChart = 30;
    chartStartDate.setDate(chartStartDate.getDate() - 29);
  } else if (range === "6m") {
    daysInChart = 180;
    chartStartDate.setMonth(chartStartDate.getMonth() - 6);
  } else {
    // Default 7 days
    chartStartDate.setDate(chartStartDate.getDate() - 6);
  }
  chartStartDate.setHours(0, 0, 0, 0);

  const [
    todaySalesResult,
    totalProducts,
    totalBills,
    lowStockItems,
    recentInvoices,
    chartDataRaw,
    categoryDataRaw,
    expensesRaw,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.product.count(),
    prisma.invoice.count(),
    prisma.product.count({ where: { stock: { lt: 10 } } }),
    prisma.invoice.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, invoiceNumber: true, total: true, createdAt: true },
    }),
    prisma.invoice.findMany({
      where: { createdAt: { gte: chartStartDate } },
      select: { 
        total: true, 
        createdAt: true, 
        subtotal: true, 
        discountAmount: true,
        items: { select: { qty: true, costPrice: true, returnedQty: true } } 
      },
    }),
    prisma.invoiceItem.findMany({
      where: { invoice: { createdAt: { gte: chartStartDate } } },
      include: { product: { select: { category: true } } },
    }),
    prisma.expense.findMany({
      where: { date: { gte: chartStartDate } }
    }),
  ]);

  const todaySales = todaySalesResult._sum.total || 0;

  // Calculate Today's Expenses
  const todayExpenses = expensesRaw.filter(e => e.date >= startOfDay && e.date <= endOfDay)
                                  .reduce((sum, e) => sum + e.amount, 0);

  // Calculate Today's Profit
  const todayInvoices = chartDataRaw.filter(inv => inv.createdAt >= startOfDay && inv.createdAt <= endOfDay);
  let todayProfit = 0;
  todayInvoices.forEach(inv => {
    let costOfGoods = 0;
    inv.items.forEach(item => {
      const soldQty = item.qty - item.returnedQty;
      costOfGoods += soldQty * item.costPrice;
    });
    // Profit = (Subtotal - Discount) - COGS (ignoring GST)
    const revenueWithoutTax = inv.subtotal - inv.discountAmount;
    todayProfit += (revenueWithoutTax - costOfGoods);
  });
  
  // Deduct today's operational expenses from profit
  todayProfit -= todayExpenses;

  // Process Bar Chart Data (aggregate by day or month)
  const chartMap: Record<string, { revenue: number, profit: number }> = {};
  
  if (range === "6m") {
    for (let i = 0; i <= 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      chartMap[key] = { revenue: 0, profit: 0 };
    }
    chartDataRaw.forEach((invoice) => {
      const key = invoice.createdAt.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (chartMap[key]) {
        chartMap[key].revenue += invoice.total;
        
        let costOfGoods = 0;
        invoice.items.forEach(item => {
          costOfGoods += (item.qty - item.returnedQty) * item.costPrice;
        });
        chartMap[key].profit += ((invoice.subtotal - invoice.discountAmount) - costOfGoods);
      }
    });
    expensesRaw.forEach((expense) => {
      const key = expense.date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (chartMap[key]) {
        chartMap[key].profit -= expense.amount;
      }
    });
  } else {
    for (let i = 0; i < daysInChart; i++) {
      const d = new Date(chartStartDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      chartMap[dateStr] = { revenue: 0, profit: 0 };
    }
    chartDataRaw.forEach((invoice) => {
      const dateStr = invoice.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (chartMap[dateStr]) {
        chartMap[dateStr].revenue += invoice.total;
        
        let costOfGoods = 0;
        invoice.items.forEach(item => {
          costOfGoods += (item.qty - item.returnedQty) * item.costPrice;
        });
        chartMap[dateStr].profit += ((invoice.subtotal - invoice.discountAmount) - costOfGoods);
      }
    });
    expensesRaw.forEach((expense) => {
      const dateStr = expense.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (chartMap[dateStr]) {
        chartMap[dateStr].profit -= expense.amount;
      }
    });
  }

  let chartDataKeys = Object.keys(chartMap);
  if (range === "6m") chartDataKeys = chartDataKeys.reverse();

  const chartData = chartDataKeys.map((date) => ({
    date,
    total: chartMap[date].revenue,
    profit: chartMap[date].profit > 0 ? chartMap[date].profit : 0, // Avoid negative on chart unless desired
  }));

  // Process Pie Chart Data
  const catMap: Record<string, number> = {};
  categoryDataRaw.forEach((item) => {
    const cat = item.product.category || "Uncategorized";
    catMap[cat] = (catMap[cat] || 0) + item.qty;
  });
  const pieData = Object.keys(catMap).map((cat) => ({
    name: cat,
    value: catMap[cat],
  })).sort((a, b) => b.value - a.value);

  const stats = [
    {
      name: "Today's Revenue",
      value: `₹${todaySales.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: IndianRupee,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Today's Net Profit",
      value: `₹${todayProfit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      name: "Total Bills",
      value: totalBills.toLocaleString(),
      icon: ReceiptText,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      name: "Low Stock Items",
      value: lowStockItems.toLocaleString(),
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="animate-fade-in pb-12 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6 mb-6">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle mt-1">
            Welcome back! Here's a detailed look at your store's performance.
          </p>
        </div>
        
        <div className="flex items-center p-1 bg-muted/50/80 rounded-xl shadow-sm self-start">
          <Link 
            href="?range=7d" 
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${range === '7d' ? 'bg-card text-indigo-700 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            7 Days
          </Link>
          <Link 
            href="?range=30d" 
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${range === '30d' ? 'bg-card text-indigo-700 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            30 Days
          </Link>
          <Link 
            href="?range=6m" 
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${range === '6m' ? 'bg-card text-indigo-700 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            6 Months
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="stat-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{item.name}</p>
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight mt-0.5">
                {item.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Revenue Trends</h2>
              <p className="section-subtitle mt-1">Earnings across the selected timeframe</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
               <ArrowUpRight className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <RevenueBarChart data={chartData} />
        </div>

        {/* Category Pie Chart */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
               <h2 className="section-title">Top Categories</h2>
               <p className="section-subtitle mt-1">Items sold by category</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
               <PieChartIcon className="h-5 w-5 text-violet-600" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <CategoryPieChart data={pieData} />
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
          <div>
            <h2 className="section-title">Recent Transactions</h2>
            <p className="section-subtitle mt-1">Latest billing activities in the system</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-sky-600" />
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {recentInvoices.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <ReceiptText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">No recent transactions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {recentInvoices.map((inv, idx) => (
                <Link 
                  href={`/invoices/${inv.id}`}
                  key={inv.id} 
                  className={`p-5 hover:bg-muted transition-colors ${idx !== recentInvoices.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-border/50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground/80 bg-muted/50 px-2 py-1 rounded-md">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {inv.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {inv.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <p className="text-xl font-black text-foreground">
                      ₹{inv.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

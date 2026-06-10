"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  BarChart3,
  Settings,
  Store,
  ShoppingCart,
  AlertTriangle,
  Users,
  Receipt,
  PackagePlus,
  ChevronRight,
  Briefcase,
  BookOpen,
} from "lucide-react";

const allNavItems = [
  { name: "Billing", href: "/billing", icon: ShoppingCart, color: "text-emerald-400" },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-indigo-400" },
  { name: "Customers", href: "/customers", icon: Users, color: "text-sky-400" },
  { name: "Products", href: "/products", icon: Package, color: "text-violet-400" },
  { name: "Inventory", href: "/inventory", icon: AlertTriangle, color: "text-amber-400" },
  { name: "Purchases", href: "/purchases", icon: PackagePlus, color: "text-teal-400" },
  { name: "Expenses", href: "/expenses", icon: Receipt, color: "text-rose-400" },
  { name: "Shifts", href: "/shifts", icon: Store, color: "text-orange-400" },
  { name: "Reports", href: "/reports", icon: BarChart3, color: "text-pink-400" },
  { name: "Tally", href: "/tally", icon: BookOpen, color: "text-purple-400" },
  { name: "Staff", href: "/staff", icon: Briefcase, color: "text-cyan-400" },
  { name: "Settings", href: "/settings", icon: Settings, color: "text-slate-400" },
];

export function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname();

  const navItems =
    userRole === "Admin"
      ? allNavItems
      : allNavItems.filter(
          (item) => item.name === "Billing" || item.name === "Customers" || item.name === "Shifts"
        );

  const mainItems = navItems.filter((i) => i.name !== "Settings");
  const bottomItems = navItems.filter((i) => i.name === "Settings");

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-[var(--sidebar-bg)] border-r border-white/5 shadow-2xl print:hidden z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 h-[4.5rem] px-5 border-b border-white/6 flex-shrink-0">
        <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/30 flex-shrink-0">
          <Store className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-base tracking-tight leading-none truncate">BillingSystem</p>
          <p className="text-indigo-400 text-xs font-medium mt-0.5">Enterprise Edition</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col overflow-y-auto px-3 pt-4 pb-2 scrollbar-thin">
        <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Main Menu
        </p>
        <nav className="flex-1 space-y-0.5">
          {mainItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-500/15 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-indigo-400 rounded-r-full" />
                )}
                <item.icon
                  className={`h-[1.125rem] w-[1.125rem] flex-shrink-0 transition-colors ${
                    isActive ? item.color : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom nav */}
        {bottomItems.length > 0 && (
          <>
            <div className="h-px bg-white/6 my-3" />
            <nav className="space-y-0.5 mb-1">
              {bottomItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-500/15 text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-indigo-400 rounded-r-full" />
                    )}
                    <item.icon
                      className={`h-[1.125rem] w-[1.125rem] flex-shrink-0 ${
                        isActive ? item.color : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>

      {/* Role badge */}
      <div className="px-4 py-4 border-t border-white/6 flex-shrink-0">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {userRole === "Admin" ? "A" : "C"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{userRole === "Admin" ? "Administrator" : "Cashier"}</p>
            <p className="text-slate-500 text-xs truncate">{userRole === "Admin" ? "Full access" : "Limited access"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

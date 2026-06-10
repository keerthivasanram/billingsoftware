"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="h-16 bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm flex items-center px-6 gap-4 print:hidden sticky top-0 z-30 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all group">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* User Menu */}
        <div className="flex items-center gap-2 pl-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-foreground leading-none">Admin</p>
            <p className="text-xs text-muted-foreground mt-0.5">Administrator</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className="ml-2 p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-destructive/10 transition-all"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

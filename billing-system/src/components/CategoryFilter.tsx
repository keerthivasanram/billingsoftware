"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Filter } from "lucide-react";

export function CategoryFilter({ categories }: { categories: string[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentCategory = searchParams.get("category") || "";

  function handleChange(value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (value) {
        params.set("category", value);
      } else {
        params.delete("category");
      }
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative flex flex-shrink-0 items-center w-full sm:w-[180px]">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80 pointer-events-none" />
      <select
        className="input-field pl-9 py-2 pr-8 text-sm h-[42px] w-full appearance-none cursor-pointer"
        value={currentCategory}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-muted-foreground/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      {isPending && (
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-500 rounded-full animate-ping" />
      )}
    </div>
  );
}

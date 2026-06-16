"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function renameCategory(oldName: string, newName: string) {
  try {
    await requireAdmin();
    if (!oldName || !newName) return { error: "Missing category names" };
    
    await prisma.product.updateMany({
      where: { category: oldName },
      data: { category: newName }
    });
    
    revalidatePath("/products");
    revalidatePath("/products/categories");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to rename category" };
  }
}

export async function deleteCategory(name: string) {
  try {
    await requireAdmin();
    if (!name) return { error: "Missing category name" };
    
    await prisma.product.updateMany({
      where: { category: name },
      data: { category: null }
    });
    
    revalidatePath("/products");
    revalidatePath("/products/categories");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete category" };
  }
}

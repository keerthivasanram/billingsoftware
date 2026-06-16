"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name) return { error: "Name is required" };

  try {
    await prisma.client.create({
      data: { name, email }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create client" };
  }
}

export async function generateLicense(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const durationMonths = parseInt(formData.get("duration") as string);

  if (!clientId || !durationMonths) return { error: "Invalid data" };

  // Generate a random secure key like BILL-XXXX-XXXX-XXXX
  const randomPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const key = `BILL-${randomPart()}-${randomPart()}-${randomPart()}`;

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  try {
    await prisma.license.create({
      data: {
        key,
        clientId,
        expiresAt,
        status: "ACTIVE"
      }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to generate license" };
  }
}

export async function revokeLicense(formData: FormData) {
  const licenseId = formData.get("licenseId") as string;

  try {
    await prisma.license.update({
      where: { id: licenseId },
      data: { status: "REVOKED" }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to revoke license" };
  }
}

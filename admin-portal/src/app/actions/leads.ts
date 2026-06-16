"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveLead(leadId: string) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.status !== "PENDING") {
      return { error: "Lead not found or already processed" };
    }

    // Convert Lead to Client
    const client = await prisma.client.create({
      data: {
        name: lead.businessName,
        email: lead.email || undefined,
        phone: lead.phone,
      }
    });

    // Mark Lead as CONVERTED
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "CONVERTED" }
    });

    revalidatePath("/");
    return { success: true, clientId: client.id };
  } catch (err) {
    console.error("Failed to approve lead:", err);
    return { error: "Internal server error" };
  }
}

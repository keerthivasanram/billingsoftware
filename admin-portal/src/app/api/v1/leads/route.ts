import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, businessName, email, phone } = body;

    if (!name || !businessName || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        businessName,
        email,
        phone,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to submit lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

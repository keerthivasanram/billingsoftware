import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { licenseKey } = body;

    if (!licenseKey) {
      return NextResponse.json({ valid: false, reason: "Missing license key" }, { status: 400 });
    }

    const license = await prisma.license.findUnique({
      where: { key: licenseKey },
      include: { client: true }
    });

    if (!license) {
      return NextResponse.json({ valid: false, reason: "License key not found" }, { status: 404 });
    }

    if (license.status !== "ACTIVE") {
      return NextResponse.json({ valid: false, reason: `License is ${license.status.toLowerCase()}` }, { status: 403 });
    }

    if (new Date() > new Date(license.expiresAt)) {
      // Auto-update status to EXPIRED
      await prisma.license.update({
        where: { id: license.id },
        data: { status: "EXPIRED" }
      });
      return NextResponse.json({ valid: false, reason: "License has expired" }, { status: 403 });
    }

    return NextResponse.json({
      valid: true,
      expiry: license.expiresAt,
      clientName: license.client.name
    });

  } catch (error) {
    console.error("License Verification API Error:", error);
    return NextResponse.json({ valid: false, reason: "Internal server error" }, { status: 500 });
  }
}

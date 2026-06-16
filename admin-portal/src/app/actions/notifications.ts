"use server";

import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function sendNotification(formData: FormData) {
  const audience = formData.get("audience") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!audience || !subject || !message) {
    throw new Error("Missing required fields");
  }

  // 1. Determine recipients
  let emails: string[] = [];

  if (audience === "all_clients") {
    const clients = await prisma.client.findMany({
      where: { email: { not: null } },
      select: { email: true }
    });
    emails = clients.map((c) => c.email as string).filter(Boolean);
  } else if (audience === "active_licenses") {
    const clients = await prisma.client.findMany({
      where: {
        email: { not: null },
        licenses: {
          some: {
            status: "ACTIVE"
          }
        }
      },
      select: { email: true }
    });
    emails = clients.map((c) => c.email as string).filter(Boolean);
  } else if (audience === "leads") {
    const leads = await prisma.lead.findMany({
      where: { email: { not: null } },
      select: { email: true }
    });
    emails = leads.map((l) => l.email as string).filter(Boolean);
  }

  // Deduplicate emails
  emails = Array.from(new Set(emails));

  if (emails.length === 0) {
    return { success: false, error: "No recipients found for the selected audience." };
  }

  // 2. Configure NodeMailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 3. Send Emails
  try {
    const info = await transporter.sendMail({
      from: `Admin Portal <${process.env.FROM_EMAIL || "admin@example.com"}>`,
      bcc: emails.join(", "), // Use BCC to hide emails from each other
      subject: subject,
      text: message,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, count: emails.length };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email. Check SMTP configuration." };
  }
}

"use server";

import { prisma } from "@/lib/prisma";

export async function exportGSTReportCSV(startDate?: Date, endDate?: Date) {
  const whereClause = (startDate && endDate) 
    ? { createdAt: { gte: startDate, lte: endDate } } 
    : {};

  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      order: true,
      items: {
        include: { product: true }
      }
    }
  });

  const headers = [
    "Invoice Number",
    "Date",
    "Customer",
    "Product Name",
    "Quantity",
    "Item Price",
    "GST Rate (%)",
    "GST Amount",
    "Subtotal",
    "Total (inc. GST)",
    "Payment Method",
    "Order Mode"
  ];

  const rows = [];
  rows.push(headers.join(","));

  for (const inv of invoices) {
    const dateStr = new Date(inv.createdAt).toISOString().split('T')[0];
    const customerName = inv.customer?.name || "Walk-in";
    const paymentMethod = inv.paymentMethod || "Cash";
    const orderMode = inv.order?.source || "DINE_IN";

    for (const item of inv.items) {
      const productName = item.product.name.replace(/,/g, " "); // safe CSV
      const gstRate = item.product.gstRate || 0;
      const subtotal = item.qty * item.price;
      const gstAmount = (subtotal * gstRate) / 100;
      
      const row = [
        inv.invoiceNumber,
        dateStr,
        customerName,
        productName,
        item.qty,
        item.price.toFixed(2),
        gstRate.toFixed(2),
        gstAmount.toFixed(2),
        subtotal.toFixed(2),
        (subtotal + gstAmount).toFixed(2),
        paymentMethod,
        orderMode
      ];
      rows.push(row.join(","));
    }
  }

  return rows.join("\n");
}

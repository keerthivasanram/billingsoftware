"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ReturnItemInput = {
  invoiceItemId: number;
  productId: number;
  qtyToReturn: number;
};

export async function processReturn(invoiceId: number, returnItems: ReturnItemInput[]) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch invoice to ensure it exists and get current values
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { items: true },
      });

      if (!invoice) throw new Error("Invoice not found.");

      let totalRefundAmount = 0;

      // 2. Process each returned item
      for (const returnItem of returnItems) {
        if (returnItem.qtyToReturn <= 0) continue;

        const itemRecord = invoice.items.find(i => i.id === returnItem.invoiceItemId);
        if (!itemRecord) throw new Error(`InvoiceItem ${returnItem.invoiceItemId} not found.`);

        const maxReturnable = itemRecord.qty - itemRecord.returnedQty;
        if (returnItem.qtyToReturn > maxReturnable) {
          throw new Error(`Cannot return more than ${maxReturnable} for item ${itemRecord.id}`);
        }

        // Calculate amount being refunded for this item
        const refundAmountForItem = (itemRecord.price / itemRecord.qty) * returnItem.qtyToReturn;
        totalRefundAmount += refundAmountForItem;

        // Update InvoiceItem
        await tx.invoiceItem.update({
          where: { id: itemRecord.id },
          data: {
            returnedQty: { increment: returnItem.qtyToReturn }
          }
        });

        // Restock Product
        await tx.product.update({
          where: { id: returnItem.productId },
          data: {
            stock: { increment: returnItem.qtyToReturn }
          }
        });
      }

      if (totalRefundAmount === 0) return { success: true };

      // 3. Recalculate Invoice Totals
      const refundSubtotal = totalRefundAmount;
      const refundGst = (refundSubtotal * invoice.gstRate) / 100;
      const refundGrandTotal = refundSubtotal + refundGst; // Assuming discount is fixed, might need proportional reduction for complex setups

      const newSubtotal = invoice.subtotal - refundSubtotal;
      const newGstAmount = invoice.gstAmount - refundGst;
      const newTotal = invoice.total - refundGrandTotal;

      // Determine new status
      let newStatus = "PARTIAL_REFUND";
      const allItemsFullyReturned = invoice.items.every(i => {
        const matchingReturn = returnItems.find(r => r.invoiceItemId === i.id);
        const returningNow = matchingReturn ? matchingReturn.qtyToReturn : 0;
        return (i.returnedQty + returningNow) >= i.qty;
      });

      if (allItemsFullyReturned) {
        newStatus = "REFUNDED";
      }

      // Update Invoice
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          subtotal: Math.max(0, newSubtotal),
          gstAmount: Math.max(0, newGstAmount),
          total: Math.max(0, newTotal),
          status: newStatus,
        }
      });

      // 4. Update Customer Balance if CREDIT payment
      if (invoice.paymentMethod === "CREDIT" && invoice.customerId) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: {
            balance: { decrement: refundGrandTotal }
          }
        });
      }

      return { success: true, refundedAmount: refundGrandTotal };
    });

    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/reports");
    revalidatePath("/inventory");
    revalidatePath("/customers");

    return result;
  } catch (error: any) {
    console.error("Return Process Error:", error);
    return { error: error.message || "Failed to process return." };
  }
}

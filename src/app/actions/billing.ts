"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function searchProductsForBilling(query: string) {
  if (!query || query.trim() === "") {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [{ name: { contains: query } }, { barcode: { contains: query } }],
    },
    take: 10,
  });

  return products;
}

export async function getAllProductsForBilling() {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' }
  });
  return products;
}

export async function getAllCustomersForBilling() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, phone: true }
  });
  return customers;
}

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  costPrice: number;
  gstRate?: number;
  gstAmount?: number;
  qty: number;
};

export async function createInvoice(
  cart: CartItem[],
  customerData: { name: string; phone: string },
  billingDetails: {
    subtotal: number;
    gstRate: number;
    gstAmount: number;
    discountAmount: number;
    total: number;
    paymentMethod: string;
    orderId?: number;
    orderMode?: string;
  }
) {
  if (cart.length === 0) {
    return { error: "Cart is empty" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let customerId: number | undefined;

      // 1. Create or find Customer if data is provided
      if (customerData.name) {
        if (customerData.phone) {
          const existingCustomer = await tx.customer.findFirst({
            where: { phone: customerData.phone },
          });
          if (existingCustomer) {
            customerId = existingCustomer.id;
          }
        }

        if (!customerId) {
          const newCustomer = await tx.customer.create({
            data: {
              name: customerData.name,
              phone: customerData.phone || null,
            },
          });
          customerId = newCustomer.id;
        }
      }

      // 2. Generate unique invoice number (INV-YYYYMMDD-XXXX)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomStr = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      const invoiceNumber = `INV-${dateStr}-${randomStr}`;

      // 3. Create or Update Order if needed
      let linkedOrderId = billingDetails.orderId;
      if (linkedOrderId) {
        await tx.order.update({
          where: { id: linkedOrderId },
          data: { 
            status: "COMPLETED",
            source: billingDetails.orderMode || "DINE_IN"
          }
        });
      } else {
        // Create an implicit order to track the orderMode (source)
        const newOrder = await tx.order.create({
          data: {
            status: "COMPLETED",
            source: billingDetails.orderMode || "DINE_IN",
            items: {
              create: cart.map((item) => ({
                productId: item.productId,
                qty: item.qty,
                price: item.price,
                costPrice: item.costPrice,
                gstRate: item.gstRate || 0,
                gstAmount: item.gstAmount || 0,
              }))
            }
          }
        });
        linkedOrderId = newOrder.id;
      }

      // 4. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId,
          subtotal: billingDetails.subtotal,
          gstRate: billingDetails.gstRate,
          gstAmount: billingDetails.gstAmount,
          discountAmount: billingDetails.discountAmount,
          total: billingDetails.total,
          paymentMethod: billingDetails.paymentMethod,
          orderId: linkedOrderId,
          items: {
            create: cart.map((item) => ({
              productId: item.productId,
              qty: item.qty,
              price: item.price,
              costPrice: item.costPrice,
            })),
          },
        },
      });

      // 4. Update Customer Balance if CREDIT
      if (billingDetails.paymentMethod === "CREDIT") {
        if (!customerId) {
          throw new Error("Customer information is required for CREDIT payments.");
        }
        await tx.customer.update({
          where: { id: customerId },
          data: {
            balance: {
              increment: billingDetails.total,
            },
          },
        });
      }

      // 5. Decrement Stock
      for (const item of cart) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.qty,
            },
          },
        });
      }

      return invoice;
    });

    revalidatePath("/dashboard");
    revalidatePath("/products");
    revalidatePath("/billing");
    revalidatePath("/reports");

    return { success: true, invoiceId: result.id };
  } catch (error) {
    console.error("Invoice Creation Error:", error);
    return { error: "Failed to complete transaction" };
  }
}

export async function saveKOT(cart: CartItem[], orderId?: number) {
  if (cart.length === 0) return { error: "Cart is empty" };

  try {
    let finalOrderId = orderId;

    if (orderId) {
      // Update existing order: delete old items, create new
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.update({
        where: { id: orderId },
        data: {
          items: {
            create: cart.map(item => ({
              productId: item.productId,
              qty: item.qty,
              price: item.price,
              costPrice: item.costPrice,
              gstRate: item.gstRate || 0,
              gstAmount: item.gstAmount || 0,
            }))
          }
        }
      });
    } else {
      // Create new
      const order = await prisma.order.create({
        data: {
          source: "DINE_IN",
          status: "RECEIVED",
          items: {
            create: cart.map(item => ({
              productId: item.productId,
              qty: item.qty,
              price: item.price,
              costPrice: item.costPrice,
              gstRate: item.gstRate || 0,
              gstAmount: item.gstAmount || 0,
            }))
          }
        }
      });
      finalOrderId = order.id;
    }

    revalidatePath("/billing");
    revalidatePath("/kds");
    return { success: true, orderId: finalOrderId };
  } catch (error) {
    console.error("Save KOT error:", error);
    return { error: "Failed to save KOT" };
  }
}

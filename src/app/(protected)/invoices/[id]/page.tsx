import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ReturnModal } from "./ReturnModal";

export default async function InvoiceReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const invoiceId = parseInt(resolvedParams.id, 10);
  if (isNaN(invoiceId)) {
    notFound();
  }

  const [invoice, setting] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.setting.findFirst(),
  ]);

  if (!invoice) {
    notFound();
  }

  const storeName = setting?.storeName || "Billing System";
  const gstNumber = setting?.gstNumber;
  const address = setting?.address;

  // Render receipt layout
  return (
    <div className="flex flex-col items-center pb-20 print:block print:pb-0 print:m-0 print:p-0 w-full animate-fade-in">
      
      {/* ── Screen Only Action Bar ── */}
      <div className="w-full max-w-xl mb-8 flex justify-between items-center print:hidden bg-card p-4 rounded-2xl border border-border shadow-sm">
        <Link
          href="/billing"
          className="btn btn-ghost btn-sm"
        >
          <ArrowLeft className="h-4 w-4" /> 
          Back to Billing
        </Link>
        <div className="flex gap-2 items-center">
          <ReturnModal invoice={invoice} />
          <PrintButton />
        </div>
      </div>

      {/* ── Thermal Receipt Simulation Layout ── */}
      <div className="w-full max-w-[320px] bg-card text-foreground p-6 rounded-lg shadow-xl border border-border print:shadow-none print:border-none print:max-w-[80mm] print:w-[80mm] print:p-0 print:m-0 print:bg-white print:text-black font-mono text-sm mx-auto print:mx-0 relative overflow-hidden">
        
        {/* Receipt Zig-Zag Top Edge Simulation (Screen Only) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIGZpbGw9IiNmMThmNWIiIHBvaW50cz0iMCAwLCA0IDQsIDggMCwgOCA4LCAwIDgiLz48L3N2Zz4=')] opacity-5 print:hidden"></div>

        {/* ── Receipt Header ── */}
        <div className="text-center mb-6 pt-2">
          <h1 className="text-2xl font-black uppercase tracking-widest mb-1 leading-none text-foreground">
            {storeName}
          </h1>
          {address && (
            <p className="text-[11px] text-foreground/90 whitespace-pre-wrap leading-tight mt-2 px-4">
              {address}
            </p>
          )}
          {gstNumber && (
            <p className="text-[11px] font-bold text-foreground print:text-black mt-2">GSTIN: {gstNumber}</p>
          )}
          <div className="border-b-2 border-dashed border-border/80 print:border-black my-4 w-full"></div>

          <div className="text-left text-xs space-y-1.5 px-1">
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Invoice No</span>
              <span className="font-bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Date</span>
              <span>{invoice.createdAt.toLocaleString("en-IN", { 
                day: "2-digit", month: "short", year: "numeric", 
                hour: "2-digit", minute: "2-digit" 
              })}</span>
            </div>
            
            {invoice.customer && (
              <>
                <div className="border-b border-dashed border-border my-2"></div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Customer</span>
                  <span className="font-bold truncate max-w-[150px]">{invoice.customer.name}</span>
                </div>
                {invoice.customer.phone && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Phone</span>
                    <span>{invoice.customer.phone}</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="border-b-2 border-dashed border-border/80 my-4 w-full"></div>
        </div>

        {/* ── Receipt Items ── */}
        <div className="mb-5">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-dashed border-border print:border-black text-muted-foreground print:text-black">
                <th className="pb-2 font-semibold uppercase tracking-wider text-[10px]">Item</th>
                <th className="pb-2 font-semibold uppercase tracking-wider text-[10px] text-right">Qty</th>
                <th className="pb-2 font-semibold uppercase tracking-wider text-[10px] text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-slate-100 print:divide-black">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-2 align-top">
                    <div className="font-bold text-foreground leading-tight">
                      {item.product.name}
                      {item.returnedQty > 0 && (
                        <span className="block text-[10px] text-rose-500 mt-0.5">
                          (-{item.returnedQty} returned)
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">@ ₹{item.price.toFixed(2)}</div>
                  </td>
                  <td className="py-3 text-right align-top font-semibold pt-3.5">{item.qty}</td>
                  <td className="py-3 text-right align-top font-bold text-foreground pt-3.5">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-b-2 border-dashed border-border/80 print:border-black mt-2 mb-4 w-full"></div>
        </div>

        {/* ── Receipt Totals ── */}
        <div className="space-y-1.5 text-sm text-right mb-8 px-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-semibold">₹{(invoice.subtotal ?? invoice.total).toFixed(2)}</span>
          </div>
          {(invoice.gstAmount ?? 0) > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>GST ({invoice.gstRate}%)</span>
              <span className="font-semibold">+ ₹{invoice.gstAmount?.toFixed(2)}</span>
            </div>
          )}
          {(invoice.discountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-xs text-emerald-600 print:text-black">
              <span>Discount</span>
              <span className="font-semibold">- ₹{invoice.discountAmount?.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-b-2 border-foreground print:border-black my-2"></div>
          
          <div className="flex justify-between font-black text-lg py-1 text-foreground print:text-black">
            <span>TOTAL</span>
            <span>₹{invoice.total.toFixed(2)}</span>
          </div>
          
          <div className="border-b-2 border-foreground print:border-black my-2"></div>

          <div className="flex justify-between text-xs mt-3 pt-1">
            <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Payment Mode</span>
            <span className="uppercase font-bold px-2 py-0.5 bg-muted/50 rounded text-foreground">
              {invoice.paymentMethod || "CASH"}
            </span>
          </div>
          
          {invoice.status === "REFUNDED" || invoice.status === "PARTIAL_REFUND" ? (
             <div className="flex justify-between text-xs mt-2 text-rose-600 font-bold border border-rose-200 bg-rose-50 px-2 py-1 rounded">
               <span className="uppercase tracking-wider text-[10px]">Status</span>
               <span className="uppercase">{invoice.status.replace("_", " ")}</span>
             </div>
          ) : null}
        </div>

        {/* ── Receipt Footer ── */}
        <div className="text-center text-xs text-muted-foreground mt-8 space-y-1 pb-4">
          <div className="mb-3 flex justify-center">
             <svg className="w-24 h-8 text-muted-foreground/50" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,0 L2,20 L4,0 L6,20 L8,0 L10,20 L12,0 L14,20 L16,0 L18,20 L20,0 L22,20 L24,0 L26,20 L28,0 L30,20 L32,0 L34,20 L36,0 L38,20 L40,0 L42,20 L44,0 L46,20 L48,0 L50,20 L52,0 L54,20 L56,0 L58,20 L60,0 L62,20 L64,0 L66,20 L68,0 L70,20 L72,0 L74,20 L76,0 L78,20 L80,0 L82,20 L84,0 L86,20 L88,0 L90,20 L92,0 L94,20 L96,0 L98,20 L100,0" stroke="currentColor" fill="none" strokeWidth="1"></path>
             </svg>
          </div>
          <p className="font-semibold text-foreground">Thank you for your business!</p>
          <p className="text-[10px]">Please keep this receipt for your records.</p>
        </div>
      </div>
      
      {/* ── Debug / Receipt Bottom Info (Screen Only) ── */}
      <div className="mt-6 text-center text-xs font-medium text-muted-foreground/80 print:hidden flex items-center justify-center gap-2">
         <ExternalLink className="h-3 w-3" />
         Optimized for 80mm thermal printers
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { AutoPrint } from "@/components/AutoPrint";
import Link from "next/link";
import { ArrowLeft, Printer, UtensilsCrossed } from "lucide-react";
import { ReturnModal } from "./ReturnModal";
import { KitchenCopyButton } from "./KitchenCopyButton";
import { EditInvoiceModal } from "./EditInvoiceModal";
import { DeleteInvoiceButton } from "./DeleteInvoiceButton";
import { Kavivanar } from "next/font/google";

const tamilFont = Kavivanar({
  weight: "400",
  subsets: ["tamil"],
  display: "swap",
});

export default async function InvoiceReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoprint?: string }>;
}) {
  const [resolvedParams, resolvedSearch] = await Promise.all([params, searchParams]);
  const invoiceId = parseInt(resolvedParams.id, 10);
  const autoPrint = resolvedSearch?.autoprint === "1";
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

  const gst = invoice.gstAmount ?? 0;
  const cgst = parseFloat((gst / 2).toFixed(2));
  const sgst = parseFloat((gst - cgst).toFixed(2));
  const beforeRounding = parseFloat((invoice.total).toFixed(2));
  const roundedTotal = Math.round(beforeRounding);
  const roundOff = parseFloat((roundedTotal - beforeRounding).toFixed(2));

  return (
    <div className="flex flex-col items-center pb-20 print:block print:pb-0 print:m-0 print:p-0 w-full animate-fade-in">
      {/* Auto-print customer bill when coming from dual-print checkout */}
      {autoPrint && <AutoPrint />}

      {/* ── Screen Only Action Bar ── */}
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center print:hidden bg-card p-4 rounded-2xl border border-border shadow-sm gap-3">
        <Link href="/billing" className="btn btn-ghost btn-sm flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex gap-2 items-center flex-wrap">
          <EditInvoiceModal invoice={invoice} />
          <ReturnModal invoice={invoice} />
          <KitchenCopyButton invoice={invoice} storeName={storeName} />
          <PrintButton />
          <DeleteInvoiceButton invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} />
        </div>
      </div>
      {/* ── Screen: Thermal Print Wrapper ── */}
      <div className="w-full max-w-sm mt-4 print:max-w-none print:w-auto print:shadow-none print:mt-0">

        <div className="bg-white text-black font-mono text-[13px] leading-tight print:text-[12px] p-4 print:p-0 mx-auto print:mx-0 shadow-xl border border-border print:shadow-none print:border-none" style={{ maxWidth: "80mm" }}>
          
          {/* Header */}
          <div className="text-center flex flex-col items-center justify-center mb-3">
            <img src="/logo.png" alt="Hotel Maamannar Biriyani Logo" className="w-full max-w-[150px] object-contain mb-1 mix-blend-multiply" style={{ WebkitFilter: 'grayscale(100%) contrast(1.2)' }} />
          </div>

          <div className="text-center space-y-0.5 mb-3">
            <p className="font-bold text-[14px]">Hotel Maamannar Biriyani</p>
            <p>Ph: 9944970360</p>
            <p className="px-1 text-[12px] leading-snug">TNC Rice Gowdown Opp , Tindivanam Road , Gingee - 640202</p>
          </div>

          {/* Date & Bill No */}
          <div className="mb-2">
            <p>{invoice.createdAt.toLocaleString("en-GB", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit", hour12: false
            }).replace(",", "")}</p>
            <p>Bill No:{invoice.invoiceNumber}</p>
          </div>

          {/* Table Header */}
          <table className="w-full text-left">
            <thead>
              <tr><td colSpan={4}><div className="border-t border-dashed border-black mb-1 mt-1" style={{ borderWidth: '1px' }} /></td></tr>
              <tr className="uppercase tracking-tight">
                <th className="py-1 font-normal w-[45%]">ITEM</th>
                <th className="py-1 font-normal text-right w-[20%]">BASE PRICE</th>
                <th className="py-1 font-normal text-center w-[15%]">QTY</th>
                <th className="py-1 font-normal text-right w-[20%]">T.VALUE</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={4}><div className="border-t border-dashed border-black mb-1 mt-1" style={{ borderWidth: '1px' }} /></td></tr>
              
              {invoice.items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="py-1 pr-1 truncate">{item.product.name}</td>
                  <td className="py-1 text-right">{item.price.toFixed(2)}</td>
                  <td className="py-1 text-center">{item.qty}</td>
                  <td className="py-1 text-right">{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Separator */}
          <div className="border-t border-dashed border-black my-1 mt-2" style={{ borderWidth: '1px' }} />

          {/* Totals */}
          <div className="flex flex-col items-end w-full pr-1 space-y-0.5 mb-2 mt-2">
            <div className="flex justify-between w-[65%]">
              <span>Sub Total:</span>
              <span>{(invoice.subtotal ?? invoice.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-[65%] text-[15px]">
              <span>Grand Total:</span>
              <span>{roundedTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Tender / Change / Payment Mode */}
          <div className="space-y-0.5">
            <p>Tender: {roundedTotal.toFixed(2)}</p>
            <p>Change: 0.00</p>
            <p>Payment Mode: {invoice.paymentMethod || "Cash"}</p>
          </div>

          {/* Separator */}
          <div className="border-t border-dashed border-black my-1 mt-3" style={{ borderWidth: '1px' }} />

          <div className="text-center mt-2 mb-4">
            <p>Thank You! Visit Again!!</p>
          </div>

        </div>{/* end receipt card */}

        <div className="mt-4 text-center text-xs font-medium text-muted-foreground print:hidden flex items-center justify-center gap-2">
          <Printer className="h-3.5 w-3.5" />
          Optimized for 80mm (3-inch) thermal paper
        </div>
      </div>
    </div>
  );
}

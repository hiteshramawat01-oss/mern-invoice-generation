import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { invoiceApi } from "../../services/api";
import { Invoice } from "../../types";
import { Button } from "../ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2pdf from "html2pdf.js";

export default function InvoicePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { business } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const brandColor = business?.brandColor || "#3b82f6";
  const logo = business?.logo || "";

  useEffect(() => {
    if (!id) return;
    invoiceApi.getOne(id)
      .then(({ invoice }) => setInvoice(invoice))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!invoice) return null;

  const subtotal = invoice.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;

  const upiString = invoice.paymentUPI
    ? `upi://pay?pa=${invoice.paymentUPI}&pn=${encodeURIComponent(invoice.shopName || "Shop")}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent("Invoice " + invoice.invoiceNumber)}`
    : "";

  const handleDownload = () => {
    const el = document.getElementById("invoice-preview");
    if (!el) return;
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    document.body.appendChild(clone);
    html2pdf(clone, {
      margin: 10,
      filename: `Invoice_${invoice.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    }).then(() => document.body.removeChild(clone))
      .catch(() => { document.body.removeChild(clone); alert("Use Print button instead."); });
  };

  return (
    <div className="w-full">
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; }
          .print-container { width: 210mm; min-height: 297mm; padding: 15mm 12mm; margin: 0; box-sizing: border-box; }
        }
      `}</style>

      <div className="print:hidden sticky top-0 bg-white border-b z-10 p-4 flex gap-2">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />Dashboard
        </Button>
        <Button variant="outline" onClick={() => navigate(`/invoice/${id}/edit`)} className="flex-1">
          Edit
        </Button>
        <Button onClick={() => window.print()} className="flex-1">
          <Printer className="w-4 h-4 mr-2" />Print
        </Button>
        <Button variant="outline" onClick={handleDownload} className="flex-1">
          <Download className="w-4 h-4 mr-2" />PDF
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white print-container" id="invoice-preview">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4 pb-3 border-b-2" style={{ borderColor: brandColor }}>
            <div className="flex items-center gap-4">
              {logo && <img src={logo} alt="Logo" className="h-[52px] object-contain" />}
              <div className="border-l-2 pl-4" style={{ borderColor: brandColor }}>
                <h1 className="text-2xl font-bold" style={{ color: brandColor }}>INVOICE</h1>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-600">Invoice #</p>
                <p className="font-semibold text-sm">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Date</p>
                <p className="font-semibold text-sm">{invoice.date ? new Date(invoice.date).toLocaleDateString() : ""}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-2">
            <div>
              <h3 className="font-semibold mb-1.5 text-gray-600 text-xs">FROM</h3>
              <p className="font-semibold text-sm">{invoice.shopName}</p>
              <p className="text-xs text-gray-700">{invoice.shopAddress}</p>
              <p className="text-xs text-gray-700">{invoice.shopPhone}</p>
              {invoice.shopEmail && <p className="text-xs text-gray-700">{invoice.shopEmail}</p>}
            </div>
            <div>
              <h3 className="font-semibold mb-1.5 text-gray-600 text-xs">BILL TO</h3>
              <p className="font-semibold text-sm">{invoice.customerName}</p>
              <p className="text-xs text-gray-700">{invoice.customerAddress}</p>
              <p className="text-xs text-gray-700">{invoice.customerPhone}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-2 font-semibold text-sm">Item</th>
                <th className="text-center py-2 font-semibold text-sm w-16">Qty</th>
                <th className="text-right py-2 font-semibold text-sm w-24">Price</th>
                <th className="text-right py-2 font-semibold text-sm w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 text-sm">{item.description}</td>
                  <td className="text-center py-2 text-sm">{item.quantity}</td>
                  <td className="text-right py-2 text-sm">₹{item.price.toFixed(2)}</td>
                  <td className="text-right py-2 text-sm">₹{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals + QR */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          {(invoice.paymentQRCode || invoice.paymentUPI) && (
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-semibold mb-2 text-xs text-gray-600">SCAN TO PAY</h3>
              <div className="bg-white p-2 border-2 rounded-lg shadow-sm" style={{ borderColor: brandColor }}>
                {invoice.paymentQRCode ? (
                  <img src={invoice.paymentQRCode} alt="QR" className="w-32 h-32 object-contain" />
                ) : upiString ? (
                  <QRCodeSVG value={upiString} size={128} level="H" includeMargin fgColor="#000" bgColor="#fff" />
                ) : null}
              </div>
              <p className="text-xs font-semibold text-gray-700 mt-1">{invoice.paymentUPI}</p>
              <p className="text-xs text-gray-500">₹{total.toFixed(2)}</p>
            </div>
          )}
          <div className="flex-1 flex justify-end">
            <div className="w-full md:w-56 space-y-1.5">
              <div className="flex justify-between py-1.5 text-sm"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
              {invoice.taxRate > 0 && <div className="flex justify-between py-1.5 text-sm"><span>Tax ({invoice.taxRate}%):</span><span>₹{tax.toFixed(2)}</span></div>}
              <div className="flex justify-between py-2 border-t-2 font-bold text-base" style={{ borderColor: brandColor }}>
                <span>Total:</span>
                <span style={{ color: brandColor }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {invoice.paymentInfo && (
          <div className="mb-4">
            <h3 className="font-semibold mb-1 text-xs text-gray-600">PAYMENT INFORMATION</h3>
            <p className="text-sm">{invoice.paymentInfo}</p>
          </div>
        )}
        {invoice.notes && (
          <div className="mb-4">
            <h3 className="font-semibold mb-1 text-xs text-gray-600">NOTES</h3>
            <p className="text-sm">{invoice.notes}</p>
          </div>
        )}
        <div className="text-center text-xs text-gray-600 pt-4 border-t">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}

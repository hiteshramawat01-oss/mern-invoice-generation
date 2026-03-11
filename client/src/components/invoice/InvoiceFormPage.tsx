import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { invoiceApi, itemApi } from "../../services/api";
import { Invoice, InvoiceItem, MasterItem } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function newItem(): InvoiceItem {
  return { id: Date.now().toString(), description: "", quantity: 1, price: 0 };
}

export default function InvoiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { business } = useAuth();
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Invoice>({
    invoiceNumber: "INV-001", date: new Date().toISOString().split("T")[0],
    shopName: "", shopAddress: "", shopPhone: "", shopEmail: "",
    paymentUPI: "", paymentInfo: "", paymentQRCode: "",
    customerName: "", customerAddress: "", customerPhone: "",
    items: [], taxRate: 0, notes: "",
  });

  // Load next invoice number and master items
  useEffect(() => {
    itemApi.getAll().then(({ items }) => setMasterItems(items)).catch(() => {});

    if (!id) {
      invoiceApi.getNextNumber().then(({ nextNumber }) => {
        setForm(prev => ({
          ...prev, invoiceNumber: nextNumber,
          shopName: business?.shopName || "",
          shopAddress: business?.shopAddress || "",
          shopPhone: business?.shopPhone || "",
          shopEmail: business?.shopEmail || "",
          paymentUPI: business?.paymentUPI || "",
          paymentInfo: business?.paymentInfo || "",
          paymentQRCode: business?.paymentQRCode || "",
        }));
      });
    } else {
      invoiceApi.getOne(id).then(({ invoice }) => setForm(invoice)).catch(() => navigate("/dashboard"));
    }
  }, [id]);

  const updateField = (field: keyof Invoice, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, newItem()] }));
  const removeItem = (idx: number) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, field: keyof InvoiceItem, value: any) =>
    setForm(prev => ({ ...prev, items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));

  const handleMasterSelect = (idx: number, masterId: string) => {
    const master = masterItems.find(m => m._id === masterId);
    if (master) updateItem(idx, "description", master.name) || updateItem(idx, "price", master.price);
    // Two updates at once:
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, description: master!.name, price: master!.price } : item)
    }));
  };

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const tax = subtotal * (form.taxRate / 100);
  const total = subtotal + tax;

  const handlePreview = async () => {
    if (!form.customerName || form.items.length === 0) {
      toast.error("Customer name and at least one item required");
      return;
    }
    setSaving(true);
    try {
      let saved;
      if (id) {
        saved = await invoiceApi.update(id, form);
      } else {
        saved = await invoiceApi.create(form);
      }
      navigate(`/invoice/${saved.invoice._id}/preview`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b p-4 flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard
        </Button>
        <span className="text-sm text-gray-600 font-medium">{form.invoiceNumber}</span>
      </div>

      <div className="w-full max-w-2xl mx-auto p-4 pb-28">
        {/* Customer Info */}
        <Card className="p-4 mb-4">
          <h2 className="font-semibold mb-3">Bill To</h2>
          <div className="space-y-3">
            <div>
              <Label>Customer Name *</Label>
              <Input value={form.customerName} onChange={e => updateField("customerName", e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input type="tel" value={form.customerPhone} onChange={e => updateField("customerPhone", e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label>Address (Optional)</Label>
              <Input value={form.customerAddress} onChange={e => updateField("customerAddress", e.target.value)} placeholder="456 Oak Ave" />
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Items</h2>
            <Button size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" />Add Item</Button>
          </div>

          <div className="space-y-3">
            {form.items.map((item, idx) => (
              <div key={item.id || idx} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <Label className="text-sm">Item {idx + 1}</Label>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="h-6 w-6 p-0">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                {masterItems.length > 0 && (
                  <div>
                    <Label className="text-xs text-gray-600">Quick Select</Label>
                    <select className="w-full p-2 border rounded text-sm" value="" onChange={e => handleMasterSelect(idx, e.target.value)}>
                      <option value="">-- Select from saved items --</option>
                      {masterItems.map(mi => (
                        <option key={mi._id} value={mi._id}>{mi.name} — ₹{mi.price.toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <Label className="text-xs">Item Name</Label>
                  <Input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Item description" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, "quantity", parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    <Label className="text-xs">Price (₹)</Label>
                    <Input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(idx, "price", parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="text-sm text-right font-semibold">Total: ₹{(item.quantity * item.price).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {form.items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3">No items added yet</p>
              <Button variant="outline" onClick={addItem}><Plus className="w-4 h-4 mr-2" />Add First Item</Button>
            </div>
          )}
        </Card>

        {form.items.length > 0 && (
          <>
            <Card className="p-4 mb-4">
              <div className="space-y-3">
                <div>
                  <Label>Tax Rate (%) — Optional</Label>
                  <Input type="number" min="0" step="0.01" value={form.taxRate} onChange={e => updateField("taxRate", parseFloat(e.target.value) || 0)} placeholder="0" />
                </div>
                <div>
                  <Label>Notes — Optional</Label>
                  <Input value={form.notes} onChange={e => updateField("notes", e.target.value)} placeholder="Additional notes or terms" />
                </div>
              </div>
            </Card>

            <Card className="p-4 mb-4 bg-gray-50">
              <h2 className="font-semibold mb-3">Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
                {form.taxRate > 0 && <div className="flex justify-between"><span>Tax ({form.taxRate}%):</span><span>₹{tax.toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total:</span><span>₹{total.toFixed(2)}</span></div>
              </div>
            </Card>
          </>
        )}
      </div>

      {form.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button className="w-full max-w-2xl mx-auto block" size="lg" onClick={handlePreview} disabled={saving}>
            {saving ? "Saving..." : "Preview & Save Invoice"}
          </Button>
        </div>
      )}
    </div>
  );
}

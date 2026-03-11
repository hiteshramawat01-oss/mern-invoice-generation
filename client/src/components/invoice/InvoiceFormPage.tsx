import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { invoiceApi, itemApi } from "../../services/api";
import { Invoice, InvoiceItem, MasterItem } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Plus, Trash2, ArrowLeft, Copy, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
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
  const [showMultiSelectDialog, setShowMultiSelectDialog] = useState(false);
  const [selectedMasterItems, setSelectedMasterItems] = useState<{ [key: string]: number }>({});

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
  const cloneItem = (idx: number) => {
    setForm(prev => {
      const itemToClone = prev.items[idx];
      const clonedItem = { ...itemToClone, id: Date.now().toString() };
      return { ...prev, items: [...prev.items.slice(0, idx + 1), clonedItem, ...prev.items.slice(idx + 1)] };
    });
  };

  const toggleMasterItemSelection = (masterId: string) => {
    setSelectedMasterItems(prev => {
      const newState = { ...prev };
      if (newState[masterId]) {
        delete newState[masterId];
      } else {
        newState[masterId] = 1; // Default quantity
      }
      return newState;
    });
  };

  const updateMasterItemQuantity = (masterId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedMasterItems(prev => ({
      ...prev,
      [masterId]: quantity,
    }));
  };

  const addSelectedMasterItems = () => {
    const selectedItemIds = Object.keys(selectedMasterItems);
    const newInvoiceItems = selectedItemIds.map(masterId => {
      const master = masterItems.find(m => m._id === masterId);
      const quantity = selectedMasterItems[masterId];
      return {
        id: Date.now().toString() + Math.random(),
        description: master!.name,
        quantity,
        price: master!.price
      };
    });
    setForm(prev => ({ ...prev, items: [...prev.items, ...newInvoiceItems] }));
    setSelectedMasterItems({});
    setShowMultiSelectDialog(false);
    toast.success(`Added ${newInvoiceItems.length} item(s) to invoice`);
  };
  const updateItem = (idx: number, field: keyof InvoiceItem, value: any) =>
    setForm(prev => ({ ...prev, items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));

  const handleMasterSelect = (idx: number, masterId: string) => {
    const master = masterItems.find(m => m._id === masterId);
    if (master) {
      setForm(prev => ({
        ...prev,
        items: prev.items.map((item, i) => i === idx ? { ...item, description: master.name, price: master.price } : item)
      }));
    }
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
            <h2 className="font-semibold">Items ({form.items.length})</h2>
            <div className="flex gap-2">
              {masterItems.length > 0 && (
                <Button size="sm" variant="outline" onClick={() => setShowMultiSelectDialog(true)} className="border-green-500 text-green-600 hover:bg-green-50">
                  <Plus className="w-4 h-4 mr-1" />Multi-Select
                </Button>
              )}
              <Button size="sm" onClick={addItem} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-1" />Add Item</Button>
            </div>
          </div>

          <div className="space-y-3">
            {form.items.map((item, idx) => (
              <div key={item.id || idx} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <Label className="text-sm">Item {idx + 1}</Label>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => cloneItem(idx)} className="h-6 w-6 p-0" title="Duplicate item">
                      <Copy className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="h-6 w-6 p-0" title="Remove item">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
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
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4 font-medium">No items added yet</p>
              <p className="text-gray-500 text-sm mb-4">Add items to your invoice</p>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={addItem} size="lg"><Plus className="w-5 h-5 mr-2" />Add First Item</Button>
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

      {/* Multi-Select Items Dialog */}
      <Dialog open={showMultiSelectDialog} onOpenChange={setShowMultiSelectDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Items to Add</DialogTitle>
          </DialogHeader>

          {masterItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No saved items available</p>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              {masterItems.map(item => {
                const isSelected = item._id in selectedMasterItems;
                const quantity = selectedMasterItems[item._id] || 1;
                return (
                  <div key={item._id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`} onClick={() => toggleMasterItemSelection(item._id)}>
                    <Checkbox checked={isSelected} onChange={(checked) => {
                      if (checked !== isSelected) toggleMasterItemSelection(item._id);
                    }} onClick={(e) => e.stopPropagation()} />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.description || "No description"}</p>
                    </div>
                    <div className="text-right" onClick={(e) => e.stopPropagation()}>
                      <p className="font-semibold">₹{item.price.toFixed(2)}</p>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-2 border rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => updateMasterItemQuantity(item._id, quantity - 1)}
                          className="h-6 w-6 p-0 text-gray-600"
                        >
                          −
                        </Button>
                        <input 
                          type="number" 
                          min="1" 
                          value={quantity} 
                          onChange={(e) => updateMasterItemQuantity(item._id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 text-center border-0 outline-none text-sm font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => updateMasterItemQuantity(item._id, quantity + 1)}
                          className="h-6 w-6 p-0 text-gray-600"
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowMultiSelectDialog(false)}>
              Cancel
            </Button>
            <div className="text-sm text-gray-600">
              {Object.keys(selectedMasterItems).length} item type(s) selected ({Object.values(selectedMasterItems).reduce((a, b) => a + b, 0)} total qty)
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={addSelectedMasterItems}
              disabled={Object.keys(selectedMasterItems).length === 0}
            >
              Add {Object.keys(selectedMasterItems).length > 0 ? `${Object.keys(selectedMasterItems).length} Item Type(s)` : "Items"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

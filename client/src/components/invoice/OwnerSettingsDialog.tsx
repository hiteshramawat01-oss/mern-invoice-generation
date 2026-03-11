import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Settings, Upload } from "lucide-react";
import { toast } from "sonner";

export default function OwnerSettingsDialog() {
  const { business, updateBusiness } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shopName: "", shopAddress: "", shopPhone: "", shopEmail: "",
    paymentUPI: "", paymentInfo: "", paymentQRCode: "", logo: "", brandColor: "#3b82f6",
  });

  useEffect(() => {
    if (business) setForm({ ...form, ...business });
  }, [business]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFileUpload = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => update(field, reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusiness(form);
      setOpen(false);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />Shop Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Shop Owner Details</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Shop Name</Label>
            <Input value={form.shopName} onChange={e => update("shopName", e.target.value)} placeholder="My Store" />
          </div>
          <div>
            <Label>Address</Label>
            <Input value={form.shopAddress} onChange={e => update("shopAddress", e.target.value)} placeholder="123 Main St" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.shopPhone} onChange={e => update("shopPhone", e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.shopEmail} onChange={e => update("shopEmail", e.target.value)} placeholder="shop@example.com" />
          </div>
          <div>
            <Label>UPI ID</Label>
            <Input value={form.paymentUPI} onChange={e => update("paymentUPI", e.target.value)} placeholder="shop@upi" />
          </div>
          <div>
            <Label>Payment Info</Label>
            <Input value={form.paymentInfo} onChange={e => update("paymentInfo", e.target.value)} placeholder="Bank details, terms..." />
          </div>
          <div>
            <Label>Brand Color</Label>
            <div className="flex gap-2 mt-1">
              <input type="color" value={form.brandColor} onChange={e => update("brandColor", e.target.value)} className="h-10 w-16 rounded border cursor-pointer" />
              <Input value={form.brandColor} onChange={e => update("brandColor", e.target.value)} className="flex-1" />
            </div>
          </div>
          <div>
            <Label>Logo</Label>
            {form.logo ? (
              <div className="mt-2 space-y-2">
                <img src={form.logo} alt="Logo" className="max-h-24 border rounded p-1" />
                <Button variant="outline" size="sm" onClick={() => update("logo", "")}>Remove</Button>
              </div>
            ) : (
              <label className="flex items-center gap-2 border rounded p-3 cursor-pointer hover:bg-gray-50 mt-1">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Upload logo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload("logo")} className="hidden" />
              </label>
            )}
          </div>
          <div>
            <Label>Payment QR Code</Label>
            {form.paymentQRCode ? (
              <div className="mt-2 space-y-2">
                <img src={form.paymentQRCode} alt="QR" className="max-h-32 border rounded" />
                <Button variant="outline" size="sm" onClick={() => update("paymentQRCode", "")}>Remove</Button>
              </div>
            ) : (
              <label className="flex items-center gap-2 border rounded p-3 cursor-pointer hover:bg-gray-50 mt-1">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Upload QR code</span>
                <input type="file" accept="image/*" onChange={handleFileUpload("paymentQRCode")} className="hidden" />
              </label>
            )}
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

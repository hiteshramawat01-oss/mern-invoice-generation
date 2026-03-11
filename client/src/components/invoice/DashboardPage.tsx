import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { invoiceApi } from "../../services/api";
import { Invoice } from "../../types";
import { Button } from "../ui/button";
import { Plus, FileText, Trash2, Eye, LogOut, Package } from "lucide-react";
import OwnerSettingsDialog from "./OwnerSettingsDialog";
import MasterItemsDialog from "./MasterItemsDialog";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, business, logout } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceApi.getAll()
      .then(({ invoices }) => setInvoices(invoices))
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      await invoiceApi.delete(id);
      setInvoices(prev => prev.filter(inv => inv._id !== id));
      toast.success("Invoice deleted");
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  const calcTotal = (inv: Invoice) => {
    const sub = inv.items.reduce((s, i) => s + i.quantity * i.price, 0);
    return sub + sub * (inv.taxRate / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Invoice Dashboard</h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              {business?.shopName || user?.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <MasterItemsDialog />
            <OwnerSettingsDialog />
            <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/login"); }}>
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button size="lg" className="w-full md:w-auto mb-8" onClick={() => navigate("/invoice/new")}>
          <Plus className="w-5 h-5 mr-2" />Create New Invoice
        </Button>

        <h2 className="text-xl font-semibold mb-4">Saved Invoices ({invoices.length})</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-gray-600 mb-4">Create your first invoice to get started</p>
            <Button onClick={() => navigate("/invoice/new")}>
              <Plus className="w-4 h-4 mr-2" />Create Invoice
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {invoices.map(inv => (
              <div key={inv._id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{inv.invoiceNumber}</h3>
                    <p className="text-sm text-gray-600">{new Date(inv.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/invoice/${inv._id}/preview`)} className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(inv._id!)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="text-sm font-medium">{inv.customerName}</p>
                  <p className="text-xs text-gray-500">{inv.items.length} item(s)</p>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-lg font-bold">₹{calcTotal(inv).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

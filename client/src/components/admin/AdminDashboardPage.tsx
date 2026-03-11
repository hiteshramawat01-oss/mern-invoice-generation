import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminApi, itemApi, customerApi } from "../../services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Trash2, Edit2, Plus, LogOut, Users, Package, BarChart3, Phone, Mail, MapPin } from "lucide-react";
import { MasterItem } from "../../types";
import { toast } from "sonner";

interface AdminUser {
  id: string; email: string; isActive: boolean; createdAt: string; invoiceCount: number;
}

interface Customer {
  _id: string; name: string; email?: string; phone?: string; address?: string; createdAt: string;
}

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"stats" | "users" | "items" | "customers">("customers");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<MasterItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalInvoices: 0 });
  const [itemForm, setItemForm] = useState({ name: "", price: "", description: "" });
  const [customerForm, setCustomerForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getStats().then(({ totalUsers, totalInvoices }) => setStats({ totalUsers, totalInvoices })).catch(() => {});
    itemApi.getAll().then(({ items }) => setItems(items)).catch(() => {});
    customerApi.getAll().then(({ customers }) => setCustomers(customers)).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "users") {
      adminApi.getUsers().then(({ users }) => setUsers(users)).catch(() => toast.error("Failed to load users"));
    } else if (tab === "customers") {
      customerApi.getAll().then(({ customers }) => setCustomers(customers)).catch(() => toast.error("Failed to load customers"));
    }
  }, [tab]);

  const handleToggleUser = async (id: string) => {
    try {
      const { user } = await adminApi.toggleUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: user.isActive } : u));
      toast.success(user.isActive ? "User activated" : "User deactivated");
    } catch { toast.error("Failed to update user"); }
  };

  const handleSaveItem = async () => {
    if (!itemForm.name || !itemForm.price) { toast.error("Name and price required"); return; }
    setSaving(true);
    try {
      const payload = { name: itemForm.name, price: parseFloat(itemForm.price), description: itemForm.description };
      if (editingId) {
        const { item } = await itemApi.update(editingId, payload);
        setItems(prev => prev.map(i => i._id === editingId ? item : i));
        toast.success("Item updated");
      } else {
        const { item } = await itemApi.create(payload);
        setItems(prev => [...prev, item]);
        toast.success("Item created");
      }
      setItemForm({ name: "", price: "", description: "" });
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await itemApi.delete(id);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success("Item deleted");
    } catch { toast.error("Failed to delete item"); }
  };

  const startEdit = (item: MasterItem) => {
    setEditingId(item._id);
    setItemForm({ name: item.name, price: item.price.toString(), description: item.description || "" });
  };

  const handleSaveCustomer = async () => {
    if (!customerForm.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (editingCustomerId) {
        const { customer } = await customerApi.update(editingCustomerId, customerForm);
        setCustomers(prev => prev.map(c => c._id === editingCustomerId ? customer : c));
        toast.success("Customer updated");
      } else {
        const { customer } = await customerApi.create(customerForm);
        setCustomers(prev => [...prev, customer]);
        toast.success("Customer added");
      }
      setCustomerForm({ name: "", email: "", phone: "", address: "" });
      setEditingCustomerId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    try {
      await customerApi.delete(id);
      setCustomers(prev => prev.filter(c => c._id !== id));
      toast.success("Customer deleted");
    } catch { toast.error("Failed to delete customer"); }
  };

  const startEditCustomer = (customer: Customer) => {
    setEditingCustomerId(customer._id);
    setCustomerForm({ name: customer.name, email: customer.email || "", phone: customer.phone || "", address: customer.address || "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-slate-800 text-white border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" size="sm" className="border-slate-500 text-white hover:bg-slate-700"
            onClick={() => { logout(); navigate("/login"); }}>
            <LogOut className="w-4 h-4 mr-2" />Logout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 flex gap-4">
          {[
            { key: "stats", icon: <BarChart3 className="w-4 h-4" />, label: "Stats" },
            { key: "customers", icon: <Users className="w-4 h-4" />, label: "Customers" },
            { key: "items", icon: <Package className="w-4 h-4" />, label: "Master Items" },
            { key: "users", icon: <Users className="w-4 h-4" />, label: "App Users" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        {tab === "stats" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-gray-600 mt-1">Total Users</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.totalInvoices}</p>
              <p className="text-gray-600 mt-1">Total Invoices</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">{items.length}</p>
              <p className="text-gray-600 mt-1">Master Items</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">{customers.length}</p>
              <p className="text-gray-600 mt-1">Customers</p>
            </Card>
          </div>
        )}

        {/* Customers */}
        {tab === "customers" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h2 className="font-semibold mb-4">{editingCustomerId ? "Edit Customer" : "Add New Customer"}</h2>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={customerForm.name} onChange={e => setCustomerForm(p => ({ ...p, name: e.target.value }))} placeholder="Customer name" /></div>
                <div><Label>Email</Label><Input type="email" value={customerForm.email} onChange={e => setCustomerForm(p => ({ ...p, email: e.target.value }))} placeholder="customer@example.com" /></div>
                <div><Label>Phone</Label><Input type="tel" value={customerForm.phone} onChange={e => setCustomerForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" /></div>
                <div><Label>Address</Label><Input value={customerForm.address} onChange={e => setCustomerForm(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St" /></div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleSaveCustomer} disabled={saving}>
                    {saving ? "Saving..." : editingCustomerId ? "Update" : <><Plus className="w-4 h-4 mr-2" />Add Customer</>}
                  </Button>
                  {editingCustomerId && (
                    <Button variant="outline" onClick={() => { setEditingCustomerId(null); setCustomerForm({ name: "", email: "", phone: "", address: "" }); }}>Cancel</Button>
                  )}
                </div>
              </div>
            </Card>

            <div>
              <h2 className="font-semibold mb-4">Customers ({customers.length})</h2>
              {customers.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p>No customers yet. Add your first customer.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {customers.map(customer => (
                    <div key={customer._id} className="p-3 bg-white border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{customer.name}</p>
                          {customer.email && <div className="flex items-center gap-1 text-sm text-gray-600 mt-1"><Mail className="w-3 h-3" />{customer.email}</div>}
                          {customer.phone && <div className="flex items-center gap-1 text-sm text-gray-600"><Phone className="w-3 h-3" />{customer.phone}</div>}
                          {customer.address && <div className="flex items-center gap-1 text-sm text-gray-600"><MapPin className="w-3 h-3" />{customer.address}</div>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEditCustomer(customer)} className="h-8 w-8 p-0">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer._id)} className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Master Items */}
        {tab === "items" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h2 className="font-semibold mb-4">{editingId ? "Edit Item" : "Add New Item"}</h2>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))} placeholder="Item name" /></div>
                <div><Label>Price (₹) *</Label><Input type="number" min="0" step="0.01" value={itemForm.price} onChange={e => setItemForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" /></div>
                <div><Label>Description</Label><Input value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" /></div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleSaveItem} disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update" : <><Plus className="w-4 h-4 mr-2" />Add Item</>}
                  </Button>
                  {editingId && (
                    <Button variant="outline" onClick={() => { setEditingId(null); setItemForm({ name: "", price: "", description: "" }); }}>Cancel</Button>
                  )}
                </div>
              </div>
            </Card>

            <div>
              <h2 className="font-semibold mb-4">Items ({items.length})</h2>
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                  <Package className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p>No items yet. Add your first item.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item._id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="ml-2 text-green-600 font-semibold">₹{item.price.toFixed(2)}</span>
                        {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(item)} className="h-8 w-8 p-0">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item._id)} className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* App Users */}
        {tab === "users" && (
          <div>
            <h2 className="font-semibold mb-4">App Users ({users.length})</h2>
            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p>No users yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="flex justify-between items-center p-4 bg-white border rounded-lg">
                    <div>
                      <p className="font-medium">{u.email}</p>
                      <p className="text-sm text-gray-500">{u.invoiceCount} invoice(s) · Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline" size="sm"
                      className={u.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}
                      onClick={() => handleToggleUser(u.id)}>
                      {u.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

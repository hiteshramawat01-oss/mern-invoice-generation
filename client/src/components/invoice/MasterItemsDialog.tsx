import { useState, useEffect } from "react";
import { itemApi } from "../../services/api";
import { MasterItem } from "../../types";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Package } from "lucide-react";

export default function MasterItemsDialog() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MasterItem[]>([]);

  useEffect(() => {
    if (open) {
      itemApi.getAll().then(({ items }) => setItems(items)).catch(() => {});
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Package className="w-4 h-4 mr-2" />Master Items</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Master Items List</DialogTitle></DialogHeader>
        <p className="text-sm text-gray-600 mb-4">Available items for invoicing. Contact admin to add items.</p>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No items available. Contact admin to add items.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item._id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                <div>
                  <h4 className="font-semibold">{item.name}</h4>
                  {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                </div>
                <span className="font-bold text-green-600">₹{item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

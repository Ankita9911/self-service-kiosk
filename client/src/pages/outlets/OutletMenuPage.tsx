import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/lib/permissions";
import {
  getCategories,
  getMenuItems,
  createCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/services/menu.service";
import { getOutlets } from "@/services/outlet.service";
import type { Category, MenuItem } from "@/shared/types/menu.types";
import type { Outlet } from "@/shared/types/outlet.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ImageOff,
  ArrowLeft,
  Package,
} from "lucide-react";
import { ImageWithFallback } from "@/shared/components/figma/ImageWithFallback";
import { TablePagination } from "@/shared/components/ui/TablePagination";

const outletIdParam = (role: string, userOutletId?: string | null, paramOutletId?: string) => {
  if (role === "OUTLET_MANAGER") return userOutletId ?? undefined;
  return paramOutletId ?? undefined;
};

export default function OutletMenuPage() {
  const { outletId: paramOutletId } = useParams<{ outletId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const outletId = outletIdParam(user?.role ?? "", user?.outletId, paramOutletId);

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [itemForm, setItemForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    stockQuantity: "",
  });

  const canManage = hasPermission(PERMISSIONS.MENU_MANAGE);

  async function fetchData() {
    if (!canManage || !outletId) return;
    setLoading(true);
    try {
      const needsOutletId = user?.role === "FRANCHISE_ADMIN" || user?.role === "SUPER_ADMIN";
      const oid = needsOutletId ? outletId : undefined;
      const [catList, itemList, outletList] = await Promise.all([
        getCategories(oid),
        getMenuItems(oid),
        (user?.role === "FRANCHISE_ADMIN" || user?.role === "SUPER_ADMIN") ? getOutlets() : Promise.resolve([]),
      ]);
      setCategories(catList);
      setItems(itemList);
      setOutlets(outletList);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "OUTLET_MANAGER" && !user?.outletId) {
      navigate("/");
      return;
    }
    if ((user?.role === "FRANCHISE_ADMIN" || user?.role === "SUPER_ADMIN") && !paramOutletId) {
      navigate("/outlets");
      return;
    }
    fetchData();
  }, [outletId, paramOutletId, user?.role, user?.outletId]);

  const currentOutlet = outlets.find((o) => o._id === outletId) ?? null;
  const filteredItems =
    selectedCategoryId === "ALL"
      ? items
      : items.filter((i) => i.categoryId === selectedCategoryId);

  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId]);

  const oidForApi = user?.role === "FRANCHISE_ADMIN" || user?.role === "SUPER_ADMIN" ? outletId : undefined;

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    await createCategory({ name: catForm.name, description: catForm.description || undefined }, oidForApi);
    setCatForm({ name: "", description: "" });
    setAddCategoryOpen(false);
    fetchData();
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    await createMenuItem(
      {
        categoryId: itemForm.categoryId,
        name: itemForm.name,
        description: itemForm.description || undefined,
        imageUrl: itemForm.imageUrl || undefined,
        price: parseFloat(itemForm.price),
        stockQuantity: parseInt(itemForm.stockQuantity, 10) || 0,
      },
      oidForApi
    );
    setItemForm({ categoryId: "", name: "", description: "", imageUrl: "", price: "", stockQuantity: "" });
    setAddItemOpen(false);
    fetchData();
  }

  async function handleUpdateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    await updateMenuItem(
      editItem._id,
      {
        name: itemForm.name,
        description: itemForm.description || undefined,
        imageUrl: itemForm.imageUrl || undefined,
        price: parseFloat(itemForm.price),
        stockQuantity: parseInt(itemForm.stockQuantity, 10) ?? 0,
      },
      oidForApi
    );
    setEditItem(null);
    setItemForm({ categoryId: "", name: "", description: "", imageUrl: "", price: "", stockQuantity: "" });
    fetchData();
  }

  async function handleDeleteItem() {
    if (!deleteItem) return;
    await deleteMenuItem(deleteItem._id, oidForApi);
    setDeleteItem(null);
    fetchData();
  }

  function openEdit(item: MenuItem) {
    setEditItem(item);
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      price: String(item.price),
      stockQuantity: String(item.stockQuantity),
    });
  }

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <p className="font-semibold text-slate-600">Access Restricted</p>
        <p className="text-slate-400 text-sm">You don't have permission to manage menu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(user?.role === "OUTLET_MANAGER" ? "/menu" : "/outlets")}
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[11px] font-semibold text-orange-500 uppercase tracking-widest">
                Menu Management
              </span>
            </div>
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
              {currentOutlet ? currentOutlet.name : "Outlet Menu"}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage menu items. Changes reflect on all kiosks in this outlet.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddCategoryOpen(true)}
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setItemForm({ categoryId: categories[0]?._id ?? "", name: "", description: "", imageUrl: "", price: "", stockQuantity: "0" });
              setAddItemOpen(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategoryId("ALL")}
          className={`px-3 h-10 rounded-xl text-xs font-semibold transition-all ${
            selectedCategoryId === "ALL"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => setSelectedCategoryId(c._id)}
            className={`px-3 h-10 rounded-xl text-xs font-semibold transition-all ${
              selectedCategoryId === c._id
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Menu items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-2xl h-48 animate-pulse" />
          ))
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-semibold text-slate-600">No menu items</p>
            <p className="text-slate-400 text-sm mt-1">
              {selectedCategoryId === "ALL" ? "Add your first item" : "No items in this category"}
            </p>
            <Button
              className="mt-4 bg-orange-600 hover:bg-orange-700"
              onClick={() => setAddItemOpen(true)}
            >
              Add Item
            </Button>
          </div>
        ) : (
          paginatedItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="aspect-square bg-slate-100 relative">
                {item.imageUrl ? (
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(item)}
                    className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-orange-600 shadow"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteItem(item)}
                    className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-red-500 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-orange-600">₹{item.price}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {item.stockQuantity} in stock
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && filteredItems.length > 0 && (
        <TablePagination
          total={filteredItems.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      )}

      {/* Add Category Modal */}
      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                required
                placeholder="e.g. Beverages"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
              Create Category
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <Label>Category *</Label>
              <select
                className="w-full border rounded-md p-2 text-sm"
                value={itemForm.categoryId}
                onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                required
                placeholder="e.g. Masala Chai"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Short description"
              />
            </div>
            <div>
              <Label>Image URL (optional)</Label>
              <Input
                value={itemForm.imageUrl}
                onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Stock Qty *</Label>
                <Input
                  type="number"
                  min="0"
                  value={itemForm.stockQuantity}
                  onChange={(e) => setItemForm({ ...itemForm, stockQuantity: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
              Add Item
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateItem} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Image URL (optional)</Label>
              <Input
                value={itemForm.imageUrl}
                onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Stock Qty *</Label>
                <Input
                  type="number"
                  min="0"
                  value={itemForm.stockQuantity}
                  onChange={(e) => setItemForm({ ...itemForm, stockQuantity: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Item?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Remove &quot;{deleteItem?.name}&quot; from the menu? This cannot be undone.
          </p>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteItem(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem} className="flex-1">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

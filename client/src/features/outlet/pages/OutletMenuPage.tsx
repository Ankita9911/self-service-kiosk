import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/lib/permissions";
import {
  ArrowLeft,
  Package,
  Search,
  LayoutGrid,
  Table2,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from "lucide-react";

import { useOutletMenu } from "../hooks/useOutletMenu";
import { CategoryFilter } from "../components/CategoryFilter";
import { MenuItemCard } from "../components/MenuItemCard";
import { MenuItemTableRow } from "../components/MenuItemTableRow";
import { AddCategoryModal } from "../components/AddCategoryModal";
import { AddItemModal } from "../components/AddItemModal";
import { EditItemModal } from "../components/EditItemModal";
import { DeleteItemModal } from "../components/DeleteItemModal";
import { ItemViewModal } from "../components/ItemViewModal";

import { Button } from "@/shared/components/ui/button";
import { TablePagination } from "@/shared/components/ui/TablePagination";
import { GridPagination } from "@/shared/components/ui/GridPagination";

type Layout = "grid" | "table";

export default function OutletMenuPage() {
  const { outletId } = useParams<{ outletId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const canManage = hasPermission(PERMISSIONS.MENU_MANAGE);

  const {
    categories,
    items,
    loading,
    selectedCategoryId,
    setSelectedCategoryId,
    addCategory,
    addItem,
    updateItem,
    updatePrice,
    updateStock,
    removeItem,
    removeCategory,
    toggleItemStatus,
    catForm,
    setCatForm,
    itemForm,
    setItemForm,
  } = useOutletMenu(outletId, user?.role, canManage);

  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [priceItem, setPriceItem] = useState<any | null>(null);
  const [stockItem, setStockItem] = useState<any | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [stockInput, setStockInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState("");
  const [itemStatusFilter, setItemStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [layout, setLayout] = useState<Layout>(
    () => (localStorage.getItem("menu-layout") as Layout) ?? "grid"
  );

  const saveLayout = (l: Layout) => {
    setLayout(l);
    localStorage.setItem("menu-layout", l);
  };

  useEffect(() => {
    if (!canManage) { navigate("/"); return; }
    if (user?.role === "OUTLET_MANAGER" && !user?.outletId) { navigate("/"); return; }
    if ((user?.role === "FRANCHISE_ADMIN" || user?.role === "SUPER_ADMIN") && !outletId) {
      navigate("/outlets");
    }
  }, [user?.role, user?.outletId, outletId, canManage]);

  useEffect(() => { setPage(1); }, [selectedCategoryId, search, itemStatusFilter]);

  const categoryFiltered =
    selectedCategoryId === "ALL"
      ? items
      : items.filter((i) => i.categoryId === selectedCategoryId);

  const statusFiltered = categoryFiltered.filter((i) => {
    if (itemStatusFilter === "ACTIVE") return i.isActive !== false;
    if (itemStatusFilter === "INACTIVE") return i.isActive === false;
    return true;
  });

  const filteredItems = search
    ? statusFiltered.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      )
    : statusFiltered;

  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const activeCount = items.filter((i) => i.isActive !== false).length;
  const outOfStockCount = items.filter((i) => i.stockQuantity === 0).length;

  const openEdit = (item: any) => {
    setEditItem(item);
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? "",
      imageFile: null,
      price: String(item.price),
      stockQuantity: String(item.stockQuantity),
    });
  };

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <p className="font-semibold text-slate-700 dark:text-white">Access Restricted</p>
        <p className="text-slate-400 text-sm">You don’t have permission to manage menu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(user?.role === "OUTLET_MANAGER" ? "/" : "/menu")}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#1e2130] flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            {/* <div className="flex items-center gap-2 mb-0.5">
              <div className="h-5 w-5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <UtensilsCrossed className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Menu Management
              </span>
            </div> */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Outlet Menu</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Manage items — changes reflect on all kiosks in this outlet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setAddCategoryOpen(true)}
            className="rounded-xl h-9 text-xs bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/20"
          >
            <Tag className="w-3.5 h-3.5 mr-1.5" />
            Add Category
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setItemForm({ categoryId: categories[0]?._id ?? "", name: "", description: "", imageFile: null, price: "", stockQuantity: "0" });
              setAddItemOpen(true);
            }}
            className="rounded-xl h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Item
          </Button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Items", value: items.length, icon: Package, color: "indigo" },
          { label: "Active", value: activeCount, icon: CheckCircle2, color: "emerald" },
          { label: "Categories", value: categories.length, icon: Tag, color: "violet" },
          { label: "Out of Stock", value: outOfStockCount, icon: AlertTriangle, color: "red" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/[0.07] shadow-sm">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
              color === "indigo" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              : color === "emerald" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : color === "violet" ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
              : "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400"
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{value}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar: filter + search + layout toggle ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          onDeleteCategory={async (id) => {
            await removeCategory(id);
            if (selectedCategoryId === id) setSelectedCategoryId("ALL");
          }}
        />

        <div className="flex items-center gap-2 shrink-0">
          {/* Status filter tabs */}
          <div className="inline-flex items-center bg-white dark:bg-[#161920] border border-slate-200 dark:border-white/8 rounded-xl p-1 gap-0.5">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setItemStatusFilter(s)}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-all ${
                  itemStatusFilter === s
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              className="pl-8 pr-3 h-9 text-sm rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#161920] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all w-44"
            />
          </div>

          {/* Layout toggle */}
          <div className="inline-flex items-center bg-white dark:bg-[#161920] border border-slate-200 dark:border-white/8 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => saveLayout("grid")}
              className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                layout === "grid"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => saveLayout("table")}
              className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                layout === "table"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
              title="Table view"
            >
              <Table2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-white/4 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-100 dark:border-white/[0.07]">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="font-semibold text-slate-600 dark:text-white">No items found</p>
          <p className="text-slate-400 text-sm mt-1">
            {search ? "Try a different search term" : selectedCategoryId === "ALL" ? "Add your first item" : "No items in this category"}
          </p>
        </div>
      ) : layout === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => setDeleteItem(item)}
                onToggleStatus={() => toggleItemStatus(item._id)}
                onView={() => setViewItem(item)}
              />
            ))}
          </div>
          <GridPagination
            total={filteredItems.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      ) : (
        /* Table view */
        <div className="rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#1e2130] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/7 bg-slate-50/80 dark:bg-white/2">
                  {["#", "Item", "Category", "Price", "Stock", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ${
                        h === "#" ? "w-10" : h === "Actions" ? "w-24 text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, idx) => (
                  <MenuItemTableRow
                    key={item._id}
                    item={item}
                    categories={categories}
                    index={idx + 1}
                    onEdit={() => openEdit(item)}
                    onDelete={() => setDeleteItem(item)}
                    onUpdatePrice={() => { setPriceItem(item); setPriceInput(String(item.price)); }}
                    onUpdateStock={() => { setStockItem(item); setStockInput(String(item.stockQuantity)); }}
                    onToggleStatus={() => toggleItemStatus(item._id)}
                    onView={() => setViewItem(item)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination
            total={filteredItems.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </div>
      )}

      {/* ── Quick price update ── */}
      {priceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-100 dark:border-white/8 shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Update Price
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              {priceItem.name} — current: ₹{priceItem.price}
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full pl-7 pr-3 h-10 rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                autoFocus
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setPriceItem(null)}
                className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-white/8 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const p = parseFloat(priceInput);
                  if (!isNaN(p) && p >= 0) {
                    await updatePrice(priceItem._id, p);
                    setPriceItem(null);
                  }
                }}
                className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition-colors"
              >
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick stock update ── */}
      {stockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#1e2130] rounded-2xl border border-slate-100 dark:border-white/8 shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Update Stock
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              {stockItem.name} — current: {stockItem.stockQuantity} units
            </p>
            <input
              type="number"
              min="0"
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              placeholder="Enter quantity"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStockItem(null)}
                className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-white/8 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const q = parseInt(stockInput, 10);
                  if (!isNaN(q) && q >= 0) {
                    await updateStock(stockItem._id, q);
                    setStockItem(null);
                  }
                }}
                className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition-colors"
              >
                Save Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <AddCategoryModal
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        form={catForm}
        setForm={setCatForm}
        onSubmit={async () => { await addCategory(); setAddCategoryOpen(false); }}
      />
      <AddItemModal
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        categories={categories}
        form={itemForm}
        setForm={setItemForm}
        onSubmit={async () => { await addItem(); setAddItemOpen(false); }}
      />
      {editItem && (
        <EditItemModal
          open={!!editItem}
          onClose={() => setEditItem(null)}
          form={itemForm}
          setForm={setItemForm}
          onSubmit={async () => { await updateItem(editItem._id); setEditItem(null); }}
        />
      )}
      {deleteItem && (
        <DeleteItemModal
          open
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={async () => { await removeItem(deleteItem._id); setDeleteItem(null); }}
        />
      )}
      {viewItem && (
        <ItemViewModal
          item={viewItem}
          categories={categories}
          onClose={() => setViewItem(null)}
        />
      )}
    </div>
  );
}
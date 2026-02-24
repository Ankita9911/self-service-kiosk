import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "@/shared/hooks/useAuth";
import { usePermission } from "@/shared/hooks/usePermissions";
import { PERMISSIONS } from "@/shared/lib/permissions";
import { ArrowLeft, UtensilsCrossed, Package } from "lucide-react";

import { useOutletMenu } from "../hooks/useOutletMenu";
import { CategoryFilter } from "../components/CategoryFilter";
import { MenuItemCard } from "../components/MenuItemCard";
import { AddCategoryModal } from "../components/AddCategoryModal";
import { AddItemModal } from "../components/AddItemModal";
import { EditItemModal } from "../components/EditItemModal";
import { DeleteItemModal } from "../components/DeleteItemModal";

import { Button } from "@/shared/components/ui/button";
import { TablePagination } from "@/shared/components/ui/TablePagination";

export default function OutletMenuPage() {
  const { outletId } = useParams<{ outletId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const canManage = hasPermission(PERMISSIONS.MENU_MANAGE);

  const {
    outlets,
    categories,
    items,
    loading,
    selectedCategoryId,
    setSelectedCategoryId,
    addCategory,
    addItem,
    updateItem,
    removeItem,
    catForm,
    setCatForm,
    itemForm,
    setItemForm,
  } = useOutletMenu(outletId, user?.role, canManage);

  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    if (!canManage) {
      navigate("/");
      return;
    }

    if (user?.role === "OUTLET_MANAGER" && !user?.outletId) {
      navigate("/");
      return;
    }

    if (
      (user?.role === "FRANCHISE_ADMIN" ||
        user?.role === "SUPER_ADMIN") &&
      !outletId
    ) {
      navigate("/outlets");
    }
  }, [user?.role, user?.outletId, outletId, canManage]);

  const filteredItems =
    selectedCategoryId === "ALL"
      ? items
      : items.filter((i) => i.categoryId === selectedCategoryId);

  const paginatedItems = filteredItems.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId]);

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <p className="font-semibold text-slate-600">
          Access Restricted
        </p>
        <p className="text-slate-400 text-sm">
          You don't have permission to manage menu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navigate(
                user?.role === "OUTLET_MANAGER"
                  ? "/menu"
                  : "/outlets"
              )
            }
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
              Outlet Menu
            </h1>

            <p className="text-sm text-slate-500 mt-0.5">
              Manage menu items. Changes reflect on all kiosks in
              this outlet.
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
            Add Category
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setItemForm({
                categoryId: categories[0]?._id ?? "",
                name: "",
                description: "",
                imageUrl: "",
                price: "",
                stockQuantity: "0",
              });
              setAddItemOpen(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 rounded-xl"
          >
            Add Item
          </Button>
        </div>
      </div>

     
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

    
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-100 rounded-2xl h-48 animate-pulse"
            />
          ))
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-semibold text-slate-600">
              No menu items
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {selectedCategoryId === "ALL"
                ? "Add your first item"
                : "No items in this category"}
            </p>
          </div>
        ) : (
          paginatedItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onEdit={() => {
                setEditItem(item);
                setItemForm({
                  categoryId: item.categoryId,
                  name: item.name,
                  description: item.description ?? "",
                  imageUrl: item.imageUrl ?? "",
                  price: String(item.price),
                  stockQuantity: String(item.stockQuantity),
                });
              }}
              onDelete={() => setDeleteItem(item)}
            />
          ))
        )}
      </div>

      {!loading && filteredItems.length > 0 && (
        <TablePagination
          total={filteredItems.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      )}

    
      <AddCategoryModal
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        form={catForm}
        setForm={setCatForm}
        onSubmit={async () => {
          await addCategory();
          setAddCategoryOpen(false);
        }}
      />

      <AddItemModal
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        categories={categories}
        form={itemForm}
        setForm={setItemForm}
        onSubmit={async () => {
          await addItem();
          setAddItemOpen(false);
        }}
      />
{editItem && (
      <EditItemModal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        form={itemForm}
        setForm={setItemForm}
        onSubmit={async () => {
          await updateItem(editItem._id);
          setEditItem(null);
        }}
      />)}

      {deleteItem && (
  <DeleteItemModal
    open={true}
    item={deleteItem}
    onClose={() => setDeleteItem(null)}
    onConfirm={async () => {
      await removeItem(deleteItem._id);
      setDeleteItem(null);
    }}
  />
)}
    </div>
  );
}
import { useEffect, useState } from "react";
import { getCategories, getMenuItems, createCategory, createMenuItem, updateMenuItem, deleteMenuItem } from "@/features/kiosk/services/menu.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import type { Category, MenuItem } from "@/features/kiosk/types/menu.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

export function useOutletMenu(
  outletId: string | undefined,
  userRole?: string,
  canManage?: boolean
) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [itemForm, setItemForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    stockQuantity: "",
  });

  const needsOutletId =
    userRole === "FRANCHISE_ADMIN" || userRole === "SUPER_ADMIN";

  const oidForApi = needsOutletId ? outletId : undefined;

  async function fetchData() {
    if (!canManage || !outletId) return;

    setLoading(true);
    try {
      const [catList, itemList, outletList] = await Promise.all([
        getCategories(oidForApi),
        getMenuItems(oidForApi),
        needsOutletId ? getOutlets() : Promise.resolve([]),
      ]);

      setCategories(catList);
      setItems(itemList);
      setOutlets(outletList);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [outletId]);

  async function addCategory() {
    await createCategory(
      { name: catForm.name, description: catForm.description || undefined },
      oidForApi
    );
    setCatForm({ name: "", description: "" });
    await fetchData();
  }

  async function addItem() {
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
    setItemForm({
      categoryId: "",
      name: "",
      description: "",
      imageUrl: "",
      price: "",
      stockQuantity: "",
    });
    await fetchData();
  }

  async function updateItem(id: string) {
    await updateMenuItem(
      id,
      {
        name: itemForm.name,
        description: itemForm.description || undefined,
        imageUrl: itemForm.imageUrl || undefined,
        price: parseFloat(itemForm.price),
        stockQuantity: parseInt(itemForm.stockQuantity, 10) ?? 0,
      },
      oidForApi
    );
    await fetchData();
  }

  async function removeItem(id: string) {
    await deleteMenuItem(id, oidForApi);
    await fetchData();
  }

  return {
    outlets,
    categories,
    items,
    loading,
    selectedCategoryId,
    setSelectedCategoryId,
    catForm,
    setCatForm,
    itemForm,
    setItemForm,
    addCategory,
    addItem,
    updateItem,
    removeItem,
  };
}
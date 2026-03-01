import { useEffect, useState, useCallback } from "react";
import {
  getCategories,
  getMenuItems,
  createCategory,
  createMenuItem,
  updateMenuItem,
  updateMenuItemPrice,
  updateMenuItemStock,
  deleteMenuItem,
  deleteCategory,
  toggleMenuItemStatus,
} from "@/features/kiosk/services/menu.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import type { Category, MenuItem } from "@/features/kiosk/types/menu.types";
import type {
  Outlet,
  ItemFormState,
} from "@/features/outlet/types/outlet.types";
import {
  getUploadUrl,
  uploadFileToS3,
} from "@/features/upload/service/upload.service";
import { useMenuSocket } from "@/shared/hooks/useMenuSocket";

export function useOutletMenu(
  outletId: string | undefined,
  userRole?: string,
  canManage?: boolean,
) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [itemForm, setItemForm] = useState<ItemFormState>({
    categoryId: "",
    name: "",
    description: "",
    imageFile: null,
    price: "",
    stockQuantity: "",
    serviceType: "BOTH",
  });

  const needsOutletId =
    userRole === "FRANCHISE_ADMIN" || userRole === "SUPER_ADMIN";

  const oidForApi = needsOutletId ? outletId : undefined;

  const fetchData = useCallback(async () => {
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
  }, [outletId, canManage, oidForApi, needsOutletId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Silently reload whenever the queue worker finishes a menu change.
  // Pass outletId so admin users (who have no outletId in their JWT) can
  // join the correct outlet socket room via join:outlet.
  useMenuSocket(fetchData, outletId);

  async function addCategory() {
    await createCategory(
      { name: catForm.name, description: catForm.description || undefined },
      oidForApi,
    );
    setCatForm({ name: "", description: "" });
    await fetchData();
  }

  async function addItem() {
    let imageUrl: string | undefined;

    if (itemForm.imageFile) {
      const { uploadUrl, publicUrl } = await getUploadUrl(
        itemForm.imageFile,
        "menu",
        oidForApi,
      );
      console.log("image upload to getuplaodurl");
      await uploadFileToS3(uploadUrl, itemForm.imageFile);

      imageUrl = publicUrl;
    }

    await createMenuItem(
      {
        categoryId: itemForm.categoryId,
        name: itemForm.name,
        description: itemForm.description || undefined,
        imageUrl,
        price: parseFloat(itemForm.price),
        stockQuantity: parseInt(itemForm.stockQuantity, 10) || 0,
        serviceType: itemForm.serviceType ?? "BOTH",
      },
      oidForApi,
    );
  
    setItemForm({
      categoryId: "",
      name: "",
      description: "",
      imageFile: null,
      price: "",
      stockQuantity: "",
      serviceType: "BOTH",
    });

    await fetchData();
  }

  async function updateItem(id: string) {
    let payload: any = {
      name: itemForm.name,
      description: itemForm.description || undefined,
      price: parseFloat(itemForm.price),
      stockQuantity: parseInt(itemForm.stockQuantity, 10) || 0,
      serviceType: itemForm.serviceType ?? "BOTH",
      ...(itemForm.categoryId && { categoryId: itemForm.categoryId }),
    };

    if (itemForm.imageFile) {
      const { uploadUrl, publicUrl } = await getUploadUrl(
        itemForm.imageFile,
        "menu",
        oidForApi,
      );

      await uploadFileToS3(uploadUrl, itemForm.imageFile);

      payload.imageUrl = publicUrl;
    }

    await updateMenuItem(id, payload, oidForApi);

    await fetchData();
  }

  async function updatePrice(id: string, price: number) {
    await updateMenuItemPrice(id, price, oidForApi);
    await fetchData();
  }

  async function updateStock(id: string, quantity: number) {
    await updateMenuItemStock(id, quantity, oidForApi);
    await fetchData();
  }

  async function removeItem(id: string) {
    await deleteMenuItem(id, oidForApi);
    await fetchData();
  }

  async function removeCategory(id: string) {
    await deleteCategory(id, oidForApi);
    await fetchData();
  }

  async function toggleItemStatus(id: string) {
    await toggleMenuItemStatus(id, oidForApi);
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
    updatePrice,
    updateStock,
    removeItem,
    removeCategory,
    toggleItemStatus,
  };
}

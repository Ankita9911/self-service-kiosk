import { useEffect, useState, useCallback, useRef } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
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
  getCombos,
  createCombo,
  updateCombo,
  deleteCombo,
} from "@/features/kiosk/services/menu.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import type { Category, MenuItem, Combo } from "@/features/kiosk/types/menu.types";
import type {
  Outlet,
  ItemFormState,
} from "@/features/outlet/types/outlet.types";
import {
  getUploadUrl,
  uploadFileToS3,
} from "@/features/upload/service/upload.service";
import { useMenuSocket } from "@/shared/hooks/useMenuSocket";

export interface OutletMenuFilters {
  search: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
}

export function useOutletMenu(
  outletId: string | undefined,
  userRole?: string,
  canManage?: boolean,
  filters?: OutletMenuFilters,
) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]); // unfiltered — for stats
  const [items, setItems] = useState<MenuItem[]>([]);       // filtered by backend
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

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
    offers: [],
  });

  const needsOutletId =
    userRole === "FRANCHISE_ADMIN" || userRole === "SUPER_ADMIN";

  const oidForApi = needsOutletId ? outletId : undefined;

  // Debounce search — backend only called 400ms after user stops typing
  const debouncedSearch = useDebounce(filters?.search ?? "", 400);

  // ── Stats fetch (no filters) — runs on mount + after every mutation ────────
  const fetchData = useCallback(async () => {
    if (!canManage || !outletId) return;

    setLoading(true);
    try {
      const [catList, itemList, outletList, comboList] = await Promise.all([
        getCategories(oidForApi),
        getMenuItems(oidForApi),          // no search/status — full list for stats
        needsOutletId ? getOutlets() : Promise.resolve([]),
        getCombos(oidForApi),
      ]);

      setCategories(catList);
      setAllItems(itemList);
      setItems(itemList);               // populate display list on initial load
      setOutlets(outletList);
      setCombos(comboList);
    } finally {
      setLoading(false);
    }
  }, [outletId, canManage, oidForApi, needsOutletId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filtered fetch — re-runs whenever search/status/category changes ───────
  const isMounted = useRef(false);

  useEffect(() => {
    if (!canManage || !outletId) return;
    let cancelled = false;

    async function fetchFiltered() {
      if (isMounted.current) setFilterLoading(true);
      else isMounted.current = true;

      try {
        const result = await getMenuItems(
          oidForApi,
          selectedCategoryId !== "ALL" ? selectedCategoryId : undefined,
          debouncedSearch,
          filters?.status,
        );
        if (!cancelled) setItems(result);
      } catch {}
      finally {
        if (!cancelled) setFilterLoading(false);
      }
    }

    fetchFiltered();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, outletId, oidForApi, selectedCategoryId, debouncedSearch, filters?.status]);

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
        offers: itemForm.offers ?? [],
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
      offers: [],
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
      offers: itemForm.offers ?? [],
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

  // ─── Combos ────────────────────────────────────────────────────────────────

  async function addCombo(data: {
    name: string;
    description?: string;
    imageUrl?: string;
    items: { menuItemId: string; name: string; quantity: number }[];
    originalPrice?: number;
    comboPrice: number;
    serviceType?: "DINE_IN" | "TAKE_AWAY" | "BOTH";
  }) {
    await createCombo(data, oidForApi);
    await fetchData();
  }

  async function editCombo(id: string, data: any) {
    await updateCombo(id, data, oidForApi);
    await fetchData();
  }

  async function removeCombo(id: string) {
    await deleteCombo(id, oidForApi);
    await fetchData();
  }

  return {
    outlets,
    categories,
    allItems,
    items,
    combos,
    loading,
    filterLoading,
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
    addCombo,
    editCombo,
    removeCombo,
  };
}

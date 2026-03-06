import { useEffect, useState, useCallback, useRef } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  getCategories,
  getMenuItems,
  createCategory,
  updateCategory,
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

const DEFAULT_PAGE_SIZE = 12;

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
  const [items, setItems] = useState<MenuItem[]>([]);
  const [customizationItems, setCustomizationItems] = useState<MenuItem[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);

  const [staticLoading, setStaticLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

  const [totalItems, setTotalItems] = useState(0);
  const [activeItems, setActiveItems] = useState(0);
  const [totalMatching, setTotalMatching] = useState(0);

  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [refreshTick, setRefreshTick] = useState(0);
  const hasLoadedItemsRef = useRef(false);

  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    imageFile: null as File | null,
    imageUrl: undefined as string | undefined,
  });
  const [editCatForm, setEditCatForm] = useState({
    name: "",
    description: "",
    imageFile: null as File | null,
    imageUrl: "" as string | undefined,
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>({
    categoryId: "",
    name: "",
    description: "",
    imageFile: null,
    price: "",
    stockQuantity: "",
    serviceType: "BOTH",
    offers: [],
    customizationItemIds: [],
  });

  const needsOutletId =
    userRole === "FRANCHISE_ADMIN" || userRole === "SUPER_ADMIN";

  const oidForApi = needsOutletId ? outletId : undefined;

  const debouncedSearch = useDebounce(filters?.search ?? "", 400);

  const currentCursor = cursorStack[cursorStack.length - 1] ?? undefined;
  const page = cursorStack.length;
  const hasPrevPage = page > 1;
  const loading = staticLoading || itemsLoading;

  useEffect(() => {
    hasLoadedItemsRef.current = false;
    setItemsLoading(true);
    setCursorStack([null]);
    setNextCursor(null);
    setHasNextPage(false);
  }, [outletId, canManage]);

  const fetchStaticData = useCallback(async () => {
    if (!canManage || !outletId) return;

    setStaticLoading(true);
    try {
      const [catList, outletList, comboList, customizationItemsResult] = await Promise.all([
        getCategories(oidForApi),
        needsOutletId ? getOutlets() : Promise.resolve([]),
        getCombos(oidForApi),
        getMenuItems(oidForApi, undefined, undefined, "ALL", { limit: 100 }).catch(() => ({
          items: [],
          pagination: { limit: 100, hasNext: false, nextCursor: null, totalMatching: 0 },
          stats: { totalItems: 0, activeItems: 0 },
        })),
      ]);

      setCategories(catList);
      setOutlets(outletList);
      setCombos(comboList);
      setCustomizationItems(customizationItemsResult.items);
    } finally {
      setStaticLoading(false);
    }
  }, [outletId, canManage, oidForApi, needsOutletId]);

  useEffect(() => {
    fetchStaticData();
  }, [fetchStaticData]);

  useEffect(() => {
    if (!canManage || !outletId) return;
    let cancelled = false;

    async function fetchItems() {
      const firstLoad = !hasLoadedItemsRef.current;
      if (!firstLoad) setFilterLoading(true);

      try {
        const result = await getMenuItems(
          oidForApi,
          selectedCategoryId !== "ALL" ? selectedCategoryId : undefined,
          debouncedSearch,
          filters?.status,
          {
            cursor: currentCursor ?? undefined,
            limit: pageSize,
          },
        );

        if (cancelled) return;

        setItems(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
        setTotalItems(result.stats.totalItems);
        setActiveItems(result.stats.activeItems);
      } finally {
        if (cancelled) return;
        if (firstLoad) {
          hasLoadedItemsRef.current = true;
          setItemsLoading(false);
        }
        setFilterLoading(false);
      }
    }

    fetchItems();
    return () => {
      cancelled = true;
    };
  }, [
    canManage,
    outletId,
    oidForApi,
    selectedCategoryId,
    debouncedSearch,
    filters?.status,
    currentCursor,
    pageSize,
    refreshTick,
  ]);

  const refreshMenuData = useCallback(async () => {
    await fetchStaticData();
    setCursorStack([null]);
    setNextCursor(null);
    setHasNextPage(false);
    setRefreshTick((n) => n + 1);
  }, [fetchStaticData]);

  useMenuSocket(refreshMenuData, outletId);

  function goToNextPage() {
    if (!hasNextPage || !nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
  }

  function goToPrevPage() {
    setCursorStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function updatePageSize(size: number) {
    setPageSize(size);
    setCursorStack([null]);
    setNextCursor(null);
    setHasNextPage(false);
  }

  function resetToFirstPage() {
    setCursorStack([null]);
    setNextCursor(null);
    setHasNextPage(false);
  }

  async function addCategory() {
    let imageUrl: string | undefined;
    if (catForm.imageFile) {
      const upload = await getUploadUrl(catForm.imageFile, "category", oidForApi);
      await uploadFileToS3(upload.uploadUrl, catForm.imageFile);
      imageUrl = upload.publicUrl;
    }

    await createCategory(
      {
        name: catForm.name,
        description: catForm.description || undefined,
        imageUrl,
      },
      oidForApi,
    );
    setCatForm({ name: "", description: "", imageFile: null, imageUrl: undefined });
    await refreshMenuData();
  }

  async function editCategory(id: string) {
    let imageUrl = editCatForm.imageUrl;
    if (editCatForm.imageFile) {
      const upload = await getUploadUrl(editCatForm.imageFile, "category", oidForApi);
      await uploadFileToS3(upload.uploadUrl, editCatForm.imageFile);
      imageUrl = upload.publicUrl;
    }

    await updateCategory(
      id,
      {
        name: editCatForm.name,
        description: editCatForm.description || undefined,
        imageUrl,
      },
      oidForApi
    );

    setEditingCategoryId(null);
    setEditCatForm({ name: "", description: "", imageFile: null, imageUrl: undefined });
    await refreshMenuData();
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
        customizationItemIds: itemForm.customizationItemIds ?? [],
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
      customizationItemIds: [],
    });

    await refreshMenuData();
  }

  async function updateItem(id: string) {
    let payload: any = {
      name: itemForm.name,
      description: itemForm.description || undefined,
      price: parseFloat(itemForm.price),
      stockQuantity: parseInt(itemForm.stockQuantity, 10) || 0,
      serviceType: itemForm.serviceType ?? "BOTH",
      offers: itemForm.offers ?? [],
      customizationItemIds: itemForm.customizationItemIds ?? [],
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

    await refreshMenuData();
  }

  async function updatePrice(id: string, price: number) {
    await updateMenuItemPrice(id, price, oidForApi);
    await refreshMenuData();
  }

  async function updateStock(id: string, quantity: number) {
    await updateMenuItemStock(id, quantity, oidForApi);
    await refreshMenuData();
  }

  async function removeItem(id: string) {
    await deleteMenuItem(id, oidForApi);
    await refreshMenuData();
  }

  async function removeCategory(id: string) {
    await deleteCategory(id, oidForApi);
    await refreshMenuData();
  }

  async function toggleItemStatus(id: string) {
    await toggleMenuItemStatus(id, oidForApi);
    await refreshMenuData();
  }

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
    await refreshMenuData();
  }

  async function editCombo(id: string, data: any) {
    await updateCombo(id, data, oidForApi);
    await refreshMenuData();
  }

  async function removeCombo(id: string) {
    await deleteCombo(id, oidForApi);
    await refreshMenuData();
  }

  return {
    outlets,
    categories,
    items,
    customizationItems,
    combos,
    loading,
    filterLoading,
    selectedCategoryId,
    setSelectedCategoryId,
    totalItems,
    activeItems,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize: updatePageSize,
    resetToFirstPage,
    catForm,
    setCatForm,
    editCatForm,
    setEditCatForm,
    editingCategoryId,
    setEditingCategoryId,
    itemForm,
    setItemForm,
    addCategory,
    editCategory,
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

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
import { getRecipes } from "@/features/recipes/services/recipe.service";
import type { Recipe } from "@/features/recipes/types/recipe.types";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import type {
  Category,
  MenuItem,
  Combo,
} from "@/features/kiosk/types/menu.types";
import type {
  Outlet,
  ItemFormState,
  CategoryFormState,
} from "@/features/outlet/types/outlet.types";
import { getUploadUrl, uploadFileToS3 } from "@/features/upload/index";
import { useMenuSocket } from "@/shared/hooks/useMenuSocket";

const DEFAULT_PAGE_SIZE = 12;
const LOW_STOCK_THRESHOLD = 5;

type ImageFrame = {
  width: number;
  height: number;
};

const IMAGE_FRAMES: Record<"category" | "menu" | "combo", ImageFrame> = {
  category: { width: 1200, height: 1200 },
  menu: { width: 1200, height: 900 },
  combo: { width: 1280, height: 720 },
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image file"));
    };

    img.src = url;
  });
}

async function normalizeImageForUpload(
  file: File,
  frame: ImageFrame,
): Promise<File> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = frame.width;
  canvas.height = frame.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context is not available");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, frame.width, frame.height);

  const scale = Math.min(frame.width / img.width, frame.height / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const dx = (frame.width - drawWidth) / 2;
  const dy = (frame.height - drawHeight) / 2;

  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), "image/jpeg", 0.92);
  });

  if (!blob) {
    throw new Error("Failed to convert image");
  }

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function getRecipeAvailability(recipe: Recipe) {
  const ingredients = Array.isArray(recipe?.ingredients)
    ? recipe.ingredients
    : [];

  if (!ingredients.length) {
    return {
      stockSource: "RECIPE" as const,
      stockStatus: "NO_RECIPE" as const,
      availableQuantity: null,
    };
  }

  let servings = Number.POSITIVE_INFINITY;

  for (const row of ingredients) {
    const quantityNeeded = Number(row?.quantity ?? 0);
    const ingredient =
      row?.ingredientId && typeof row.ingredientId === "object"
        ? row.ingredientId
        : null;
    const currentStock = Number(ingredient?.currentStock ?? 0);

    if (!ingredient || quantityNeeded <= 0) {
      return {
        stockSource: "RECIPE" as const,
        stockStatus: "OUT_OF_STOCK" as const,
        availableQuantity: 0,
      };
    }

    servings = Math.min(servings, Math.floor(currentStock / quantityNeeded));
  }

  const availableQuantity = Number.isFinite(servings)
    ? Math.max(0, servings)
    : 0;

  return {
    stockSource: "RECIPE" as const,
    stockStatus:
      availableQuantity <= 0
        ? ("OUT_OF_STOCK" as const)
        : availableQuantity <= LOW_STOCK_THRESHOLD
          ? ("LOW_STOCK" as const)
          : ("IN_STOCK" as const),
    availableQuantity,
  };
}

function decorateMenuItems(
  rawItems: MenuItem[],
  availabilityByItemId: Record<
    string,
    ReturnType<typeof getRecipeAvailability>
  >,
) {
  return rawItems.map((item) => {
    const inventoryMode = item.inventoryMode ?? "RECIPE";
    if (inventoryMode === "DIRECT") {
      const availableQuantity = Math.max(0, Number(item.stockQuantity ?? 0));
      return {
        ...item,
        inventoryMode,
        stockSource: "MENU" as const,
        stockStatus:
          availableQuantity <= 0
            ? ("OUT_OF_STOCK" as const)
            : availableQuantity <= LOW_STOCK_THRESHOLD
              ? ("LOW_STOCK" as const)
              : ("IN_STOCK" as const),
        availableQuantity,
      };
    }

    const recipeAvailability = availabilityByItemId[item._id];
    if (!recipeAvailability) {
      return {
        ...item,
        inventoryMode,
        stockSource: "RECIPE" as const,
        stockStatus: "NO_RECIPE" as const,
        availableQuantity: null,
      };
    }

    return {
      ...item,
      ...recipeAvailability,
    };
  });
}

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
  const [rawItems, setRawItems] = useState<MenuItem[]>([]);
  const [customizationItems, setCustomizationItems] = useState<MenuItem[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [availabilityByItemId, setAvailabilityByItemId] = useState<
    Record<string, ReturnType<typeof getRecipeAvailability>>
  >({});

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

  const [catForm, setCatForm] = useState<CategoryFormState>({
    name: "",
    description: "",
    imageFile: null,
    imageUrl: undefined,
  });
  const [editCatForm, setEditCatForm] = useState<CategoryFormState>({
    name: "",
    description: "",
    imageFile: null,
    imageUrl: undefined,
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [itemForm, setItemForm] = useState<ItemFormState>({
    categoryId: "",
    name: "",
    description: "",
    imageFile: null,
    price: "",
    stockQuantity: "",
    inventoryMode: "RECIPE",
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
      const [
        catList,
        outletList,
        comboList,
        recipeList,
        customizationItemsResult,
      ] = await Promise.all([
        getCategories(oidForApi),
        needsOutletId ? getOutlets() : Promise.resolve([]),
        getCombos(oidForApi),
        getRecipes(oidForApi, { limit: 500 }).catch(() => ({
          items: [],
          pagination: {
            limit: 500,
            hasNext: false,
            nextCursor: null,
            totalMatching: 0,
          },
        })),
        getMenuItems(oidForApi, undefined, undefined, "ALL", {
          limit: 100,
        }).catch(() => ({
          items: [],
          pagination: {
            limit: 100,
            hasNext: false,
            nextCursor: null,
            totalMatching: 0,
          },
          stats: { totalItems: 0, activeItems: 0 },
        })),
      ]);

      setCategories(catList);
      setOutlets(outletList);
      setCombos(comboList);
      setCustomizationItems(customizationItemsResult.items);
      setAvailabilityByItemId(
        recipeList.items.reduce(
          (acc, recipe) => {
            const menuItemId =
              recipe?.menuItemId && typeof recipe.menuItemId === "object"
                ? recipe.menuItemId._id
                : recipe?.menuItemId;

            if (menuItemId) {
              acc[String(menuItemId)] = getRecipeAvailability(recipe);
            }

            return acc;
          },
          {} as Record<string, ReturnType<typeof getRecipeAvailability>>,
        ),
      );
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

        setRawItems(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
        setTotalItems(result.stats.totalItems);
        setActiveItems(result.stats.activeItems);
      } finally {
        if (!cancelled) {
          if (firstLoad) {
            hasLoadedItemsRef.current = true;
            setItemsLoading(false);
          }
          setFilterLoading(false);
        }
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

  useEffect(() => {
    setItems(decorateMenuItems(rawItems, availabilityByItemId));
  }, [rawItems, availabilityByItemId]);

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
      const normalizedImage = await normalizeImageForUpload(
        catForm.imageFile,
        IMAGE_FRAMES.category,
      );
      const upload = await getUploadUrl(normalizedImage, "category", oidForApi);
      await uploadFileToS3(upload.uploadUrl, normalizedImage);
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
    setCatForm({
      name: "",
      description: "",
      imageFile: null,
      imageUrl: undefined,
    });
    await refreshMenuData();
  }

  async function editCategory(id: string) {
    let imageUrl = editCatForm.imageUrl;
    if (editCatForm.imageFile) {
      const normalizedImage = await normalizeImageForUpload(
        editCatForm.imageFile,
        IMAGE_FRAMES.category,
      );
      const upload = await getUploadUrl(normalizedImage, "category", oidForApi);
      await uploadFileToS3(upload.uploadUrl, normalizedImage);
      imageUrl = upload.publicUrl;
    }

    await updateCategory(
      id,
      {
        name: editCatForm.name,
        description: editCatForm.description || undefined,
        imageUrl,
      },
      oidForApi,
    );

    setEditingCategoryId(null);
    setEditCatForm({
      name: "",
      description: "",
      imageFile: null,
      imageUrl: undefined,
    });
    await refreshMenuData();
  }

  async function addItem() {
    let imageUrl: string | undefined;

    if (itemForm.imageFile) {
      const normalizedImage = await normalizeImageForUpload(
        itemForm.imageFile,
        IMAGE_FRAMES.menu,
      );
      const { uploadUrl, publicUrl } = await getUploadUrl(
        normalizedImage,
        "menu",
        oidForApi,
      );
      await uploadFileToS3(uploadUrl, normalizedImage);

      imageUrl = publicUrl;
    }

    await createMenuItem(
      {
        categoryId: itemForm.categoryId,
        name: itemForm.name,
        description: itemForm.description || undefined,
        imageUrl,
        price: parseFloat(itemForm.price),
        stockQuantity:
          itemForm.inventoryMode === "DIRECT"
            ? parseInt(itemForm.stockQuantity, 10) || 0
            : 0,
        inventoryMode: itemForm.inventoryMode,
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
      inventoryMode: "RECIPE",
      serviceType: "BOTH",
      offers: [],
      customizationItemIds: [],
    });

    await refreshMenuData();
  }

  async function updateItem(id: string) {
    const payload: Partial<MenuItem> & {
      customizationItemIds?: string[];
      imageUrl?: string;
    } = {
      name: itemForm.name,
      description: itemForm.description || undefined,
      price: parseFloat(itemForm.price),
      stockQuantity:
        itemForm.inventoryMode === "DIRECT"
          ? parseInt(itemForm.stockQuantity, 10) || 0
          : 0,
      inventoryMode: itemForm.inventoryMode,
      serviceType: itemForm.serviceType ?? "BOTH",
      offers: itemForm.offers ?? [],
      customizationItemIds: itemForm.customizationItemIds ?? [],
      ...(itemForm.categoryId && { categoryId: itemForm.categoryId }),
    };

    if (itemForm.imageFile) {
      const normalizedImage = await normalizeImageForUpload(
        itemForm.imageFile,
        IMAGE_FRAMES.menu,
      );
      const { uploadUrl, publicUrl } = await getUploadUrl(
        normalizedImage,
        "menu",
        oidForApi,
      );

      await uploadFileToS3(uploadUrl, normalizedImage);

      payload.imageUrl = publicUrl;
    }

    await updateMenuItem(id, payload, oidForApi);

    await refreshMenuData();
  }

  async function updatePrice(id: string, price: number) {
    await updateMenuItemPrice(id, price, oidForApi);
    await refreshMenuData();
  }

  async function updateStock(id: string, stockQuantity: number) {
    await updateMenuItemStock(id, stockQuantity, oidForApi);
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
    imageFile?: File | null;
    items: { menuItemId: string; name: string; quantity: number }[];
    originalPrice?: number;
    comboPrice: number;
    serviceType?: "DINE_IN" | "TAKE_AWAY" | "BOTH";
  }) {
    let imageUrl = data.imageUrl;

    if (data.imageFile) {
      const normalizedImage = await normalizeImageForUpload(
        data.imageFile,
        IMAGE_FRAMES.combo,
      );
      const { uploadUrl, publicUrl } = await getUploadUrl(
        normalizedImage,
        "combo",
        oidForApi,
      );
      await uploadFileToS3(uploadUrl, normalizedImage);
      imageUrl = publicUrl;
    }

    const { imageFile: _imageFile, ...rest } = data;
    await createCombo({ ...rest, imageUrl }, oidForApi);
    await refreshMenuData();
  }

  async function editCombo(
    id: string,
    data: Partial<Combo> & { imageFile?: File | null },
  ) {
    let imageUrl = data.imageUrl;

    if (data.imageFile) {
      const normalizedImage = await normalizeImageForUpload(
        data.imageFile,
        IMAGE_FRAMES.combo,
      );
      const { uploadUrl, publicUrl } = await getUploadUrl(
        normalizedImage,
        "combo",
        oidForApi,
      );
      await uploadFileToS3(uploadUrl, normalizedImage);
      imageUrl = publicUrl;
    }

    const { imageFile: _imageFile, ...rest } = data;
    await updateCombo(id, { ...rest, imageUrl }, oidForApi);
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

import Category from "../menu/category.model.js";
import MenuItem from "../menu/menuItem.model.js";
import Combo from "../menu/combo.model.js";
import Recipe from "../recipes/recipe.model.js";
import Ingredient from "../ingredients/ingredient.model.js";

function computeItemStock(item, recipe, ingredientMap) {
  const inventoryMode = item.inventoryMode ?? "RECIPE";
  if (inventoryMode === "DIRECT") {
    return item.stockQuantity ?? 0;
  }

  if (!recipe || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    return null;
  }

  let servings = Number.POSITIVE_INFINITY;

  for (const row of recipe.ingredients) {
    const ingredient = ingredientMap.get(String(row.ingredientId));
    const requiredQty = Number(row.quantity ?? 0);

    if (!ingredient || requiredQty <= 0) {
      return 0;
    }

    servings = Math.min(
      servings,
      Math.floor(Number(ingredient.currentStock ?? 0) / requiredQty)
    );
  }

  return Number.isFinite(servings) ? Math.max(0, servings) : 0;
}

export async function getKioskMenu(tenant) {
  const categories = await Category.find({
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
    isActive: true,
  }).sort({ displayOrder: 1 });

  const items = await MenuItem.find({
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
    isActive: true,
  }).lean();

  const customizationIds = [
    ...new Set(
      items
        .flatMap((item) => (item.customizationItemIds || []).map((id) => String(id)))
        .filter(Boolean)
    ),
  ];

  const relevantItemIds = [
    ...new Set([
      ...items.map((item) => String(item._id)),
      ...customizationIds,
    ]),
  ];

  const recipes = await Recipe.find({
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
    menuItemId: { $in: relevantItemIds },
  })
    .select("menuItemId ingredients")
    .lean();

  const recipeByItemId = new Map(
    recipes.map((recipe) => [String(recipe.menuItemId), recipe])
  );

  const ingredientIds = [
    ...new Set(
      recipes.flatMap((recipe) =>
        (recipe.ingredients || []).map((row) => String(row.ingredientId))
      )
    ),
  ];

  const ingredientMap = new Map();
  if (ingredientIds.length > 0) {
    const ingredients = await Ingredient.find({
      _id: { $in: ingredientIds },
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    })
      .select("_id currentStock")
      .lean();

    ingredients.forEach((ingredient) => {
      ingredientMap.set(String(ingredient._id), ingredient);
    });
  }

  let customizationItemMap = new Map();

  if (customizationIds.length > 0) {
    const customizationItems = await MenuItem.find({
      _id: { $in: customizationIds },
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    })
      .select("_id name price stockQuantity inventoryMode isDeleted")
      .lean();

    customizationItemMap = new Map(
      customizationItems.map((item) => [String(item._id), item])
    );
  }

  const categoryMap = {};

  categories.forEach((cat) => {
    categoryMap[cat._id] = {
      _id: cat._id,
      name: cat.name,
      imageUrl: cat.imageUrl,
      displayOrder: cat.displayOrder,
      items: [],
    };
  });

  items.forEach((item) => {
    if (categoryMap[item.categoryId]) {
      const recipe = recipeByItemId.get(String(item._id));
      const liveStock = computeItemStock(item, recipe, ingredientMap);
      const inventoryMode = item.inventoryMode ?? "RECIPE";

      if (inventoryMode === "RECIPE" && liveStock === null) {
        return;
      }

      categoryMap[item.categoryId].items.push({
        _id: item._id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        stockQuantity: liveStock ?? 0,
        inventoryMode,
        serviceType: item.serviceType ?? "BOTH",
        offers: item.offers ?? [],
        customizationOptions: (item.customizationItemIds || [])
          .map((id) => customizationItemMap.get(String(id)))
          .filter(Boolean)
          .map((opt) => ({
            itemId: String(opt._id),
            name: opt.name,
            price: opt.price,
            stockQuantity: computeItemStock(
              opt,
              recipeByItemId.get(String(opt._id)),
              ingredientMap
            ) ?? 0,
          })),
      });
    }
  });

  return Object.values(categoryMap);
}

export async function getKioskCombos(tenant) {
  const combos = await Combo.find({
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
    isActive: true,
  }).lean();

  return combos.map((c) => ({
    _id: c._id,
    name: c.name,
    description: c.description,
    imageUrl: c.imageUrl,
    items: c.items,
    originalPrice: c.originalPrice ?? 0,
    comboPrice: c.comboPrice,
    serviceType: c.serviceType ?? "BOTH",
  }));
}

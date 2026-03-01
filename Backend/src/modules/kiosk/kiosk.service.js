import Category from "../menu/category.model.js";
import MenuItem from "../menu/menuItem.model.js";
import Combo from "../menu/combo.model.js";

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
    stockQuantity: { $gt: 0 },
  });


  const categoryMap = {};

  categories.forEach((cat) => {
    categoryMap[cat._id] = {
      _id: cat._id,
      name: cat.name,
      displayOrder: cat.displayOrder,
      items: [],
    };
  });

  items.forEach((item) => {
    if (categoryMap[item.categoryId]) {
      categoryMap[item.categoryId].items.push({
        _id: item._id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        stockQuantity: item.stockQuantity,
        serviceType: item.serviceType ?? "BOTH",
        offers: item.offers ?? [],
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

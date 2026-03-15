export interface RecipeIngredient {
  ingredientId:
    | string
    | { _id: string; name: string; unit: string; currentStock: number };
  quantity: number;
  unit: string;
}

export interface Recipe {
  _id: string;
  menuItemId:
    | string
    | { _id: string; name: string; price: number; categoryId: string };
  ingredients: RecipeIngredient[];
  prepTime: number;
  instructions: string;
  aiGenerated: boolean;
  franchiseId: string;
  outletId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeFormState {
  menuItemId: string;
  ingredients: {
    ingredientId: string;
    quantity: number;
    unit: string;
    _aiName?: string;
  }[];
  prepTime: number;
  instructions: string;
  aiGenerated: boolean;
}

export interface AISuggestion {
  name: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string;
  prepTime: number;
}

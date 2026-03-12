import { useState } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import { IngredientTable } from "@/features/ingredients/components/IngredientTable";
import { IngredientFormModal } from "@/features/ingredients/components/IngredientFormModal";
import { StockAdjustModal } from "@/features/ingredients/components/StockAdjustModal";
import type { Ingredient } from "@/features/ingredients/types/ingredient.types";
import { Plus, Search, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export default function IngredientsPage() {
  const { user } = useAuth();
  const outletId = user?.outletId ?? undefined;

  const [search, setSearch] = useState("");

  const {
    ingredients,
    loading,
    totalMatching,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAdjustStock,
  } = useIngredients(outletId, search);

  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [adjustingIngredient, setAdjustingIngredient] = useState<Ingredient | null>(null);

  const lowStockCount = ingredients.filter(
    (i) => i.currentStock < i.minThreshold
  ).length;

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIngredient(null);
  };

  const confirmDelete = async (id: string) => {
    const ing = ingredients.find((i) => i._id === id);
    if (!window.confirm(`Delete ingredient "${ing?.name ?? id}"?`)) return;
    await handleDelete(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            Ingredients
          </h1>
          <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
            Manage your kitchen ingredients and stock levels
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Ingredient
        </Button>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/[0.06] shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{totalMatching}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Total</p>
          </div>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1e2130] border border-red-100 dark:border-red-500/10 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl font-black text-red-600 dark:text-red-400 leading-none">{lowStockCount}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Low Stock</p>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Search ingredients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <IngredientTable
        ingredients={ingredients}
        loading={loading}
        onEdit={handleEdit}
        onDelete={confirmDelete}
        onAdjustStock={setAdjustingIngredient}
      />

      {/* Modals */}
      {showForm && (
        <IngredientFormModal
          open={showForm}
          onClose={handleCloseForm}
          ingredient={editingIngredient}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {adjustingIngredient && (
        <StockAdjustModal
          open={Boolean(adjustingIngredient)}
          onClose={() => setAdjustingIngredient(null)}
          ingredient={adjustingIngredient}
          onAdjust={handleAdjustStock}
        />
      )}
    </div>
  );
}

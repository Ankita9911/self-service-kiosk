import { useState } from "react";
import useAuth from "@/shared/hooks/useAuth";
import { useStockTransactions } from "@/features/stockTransactions/hooks/useStockTransactions";
import { useIngredients } from "@/features/ingredients/hooks/useIngredients";
import type { ManualTransactionPayload } from "@/features/stockTransactions/types/stockTransaction.types";
import {
  ArrowUpDown,
  Search,
  Plus,
  Loader2,
  PackagePlus,
  PackageMinus,
  ArrowRightLeft,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "CONSUMPTION", label: "Consumption" },
  { value: "WASTAGE", label: "Wastage" },
  { value: "ADJUSTMENT", label: "Adjustment" },
] as const;

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  PURCHASE: {
    icon: <PackagePlus className="w-3.5 h-3.5" />,
    color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10",
  },
  CONSUMPTION: {
    icon: <ShoppingCart className="w-3.5 h-3.5" />,
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
  },
  WASTAGE: {
    icon: <PackageMinus className="w-3.5 h-3.5" />,
    color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
  },
  ADJUSTMENT: {
    icon: <ArrowRightLeft className="w-3.5 h-3.5" />,
    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
  },
};

export default function StockTransactionsPage() {
  const { user } = useAuth();
  const outletId = user?.outletId ?? undefined;

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [ingredientFilter, setIngredientFilter] = useState("");

  const {
    transactions,
    loading,
    handleCreate,
  } = useStockTransactions(outletId, {
    ingredientId: ingredientFilter || undefined,
    type: typeFilter === "ALL" ? undefined : typeFilter,
  });

  const { ingredients } = useIngredients(outletId);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ManualTransactionPayload>({
    ingredientId: "",
    type: "PURCHASE",
    quantity: 0,
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!formData.ingredientId || formData.quantity <= 0) return;
    setSaving(true);
    try {
      await handleCreate(formData);
      setShowForm(false);
      setFormData({ ingredientId: "", type: "PURCHASE", quantity: 0, note: "" });
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Stock Transactions
          </h1>
          <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
            Track all ingredient stock movements
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Log Transaction
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Select
            value={ingredientFilter}
            onValueChange={setIngredientFilter}
          >
            <SelectTrigger className="pl-9 w-[240px]">
              <SelectValue placeholder="All Ingredients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Ingredients</SelectItem>
              {ingredients.map((ing) => (
                <SelectItem key={ing._id} value={ing._id}>
                  {ing.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20">
          <ArrowUpDown className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No transactions found.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#1e2130] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Ingredient
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Qty
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Ref
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => {
                  const cfg = TYPE_CONFIG[txn.type] ?? TYPE_CONFIG.ADJUSTMENT;
                  const ingredientName =
                    typeof txn.ingredientId === "object" && txn.ingredientId
                      ? (txn.ingredientId as { name: string }).name
                      : String(txn.ingredientId);

                  return (
                    <tr
                      key={txn._id}
                      className="border-b border-slate-50 dark:border-white/[0.03] last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                        {ingredientName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}
                        >
                          {cfg.icon}
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-200">
                        {txn.type === "PURCHASE" || (txn.type === "ADJUSTMENT" && txn.quantity > 0)
                          ? `+${txn.quantity}`
                          : txn.type === "ADJUSTMENT"
                            ? txn.quantity
                            : `-${txn.quantity}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {txn.referenceType === "ORDER"
                          ? `Order`
                          : "Manual"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">
                        {txn.note || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Transaction Modal */}
      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Stock Transaction</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Ingredient</Label>
              <Select
                value={formData.ingredientId}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, ingredientId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ingredient…" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ing) => (
                    <SelectItem key={ing._id} value={ing._id}>
                      {ing.name} ({ing.currentStock} {ing.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: v as ManualTransactionPayload["type"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE">Purchase (add stock)</SelectItem>
                  <SelectItem value="WASTAGE">Wastage (remove stock)</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={0}
                step="any"
                value={formData.quantity || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Note (optional)</Label>
              <Input
                placeholder="Reason for transaction…"
                value={formData.note}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, note: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !formData.ingredientId || formData.quantity <= 0}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Log Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

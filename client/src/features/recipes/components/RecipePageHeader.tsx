import { Plus, Sparkles, RefreshCcw } from "lucide-react";

interface RecipePageHeaderProps {
  refreshing: boolean;
  canAdd: boolean;
  onRefresh: () => void;
  onAIGenerate: () => void;
  onAdd: () => void;
}

export function RecipePageHeader({
  refreshing,
  canAdd,
  onRefresh,
  onAIGenerate,
  onAdd,
}: RecipePageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
      <div>
        <h1 className="text-[28px] font-semibold text-slate-900 dark:text-white tracking-tight">
          Recipes
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Link menu items to ingredients so outlet availability comes from live
          inventory.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all disabled:opacity-50"
        >
          <RefreshCcw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
        <button
          onClick={onAIGenerate}
          disabled={!canAdd}
          className="flex items-center gap-2 h-9 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/40 hover:text-purple-600 dark:hover:text-purple-400 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">AI Generate</span>
        </button>
        <button
          onClick={onAdd}
          disabled={!canAdd}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Recipe</span>
        </button>
      </div>
    </div>
  );
}

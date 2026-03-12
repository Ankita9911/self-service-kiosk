import { useState } from "react";
import type { AISuggestion } from "@/features/recipes/types/recipe.types";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Loader2, Sparkles, Clock, ChefHat, X, Package } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  aiLoading: boolean;
  aiSuggestion: AISuggestion | null;
  onGenerate: (description: string) => Promise<unknown>;
  onUseSuggestion: (suggestion: AISuggestion) => void;
  onClear: () => void;
}

export function AIRecipeModal({
  open,
  onClose,
  aiLoading,
  aiSuggestion,
  onGenerate,
  onUseSuggestion,
  onClear,
}: Props) {
  const [description, setDescription] = useState("");

  const handleGenerate = () => {
    if (!description.trim()) return;
    onGenerate(description.trim());
  };

  const handleUse = () => {
    if (!aiSuggestion) return;
    onUseSuggestion(aiSuggestion);
    onClose();
  };

  const handleClose = () => {
    setDescription("");
    onClear();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 border border-slate-100 dark:border-white/8 bg-white dark:bg-[#1e2130] rounded-2xl shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Recipe Generator</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Describe a dish — get ingredients, instructions &amp; prep time.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Description input */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Describe the dish
            </label>
            <textarea
              className="flex min-h-[90px] w-full rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/30 resize-none"
              placeholder='e.g. "A spicy paneer tikka masala with cream-based gravy"'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
              }}
              disabled={aiLoading}
            />
            <p className="text-[11px] text-slate-400">Press Ctrl+Enter to generate</p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={aiLoading || !description.trim()}
            className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {aiLoading ? "Generating recipe…" : "Generate Recipe"}
          </button>

          {/* Suggestion preview */}
          {aiSuggestion && (
            <div className="rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/60 dark:bg-purple-500/5 overflow-hidden">
              {/* Recipe name */}
              <div className="px-4 pt-4 pb-3 border-b border-purple-100 dark:border-purple-500/15">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-purple-500 shrink-0" />
                  <h3 className="font-bold text-slate-800 dark:text-white">{aiSuggestion.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mt-1.5">
                  <Clock className="w-3 h-3" />
                  {aiSuggestion.prepTime} min prep time
                </div>
              </div>

              {/* Ingredients */}
              <div className="px-4 py-3 border-b border-purple-100 dark:border-purple-500/15">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Ingredients ({aiSuggestion.ingredients.length})
                </p>
                <div className="space-y-1">
                  {aiSuggestion.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Package className="w-3 h-3 text-slate-400" />
                        {ing.name}
                      </span>
                      <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-black/20 px-2 py-0.5 rounded-lg">
                        {ing.quantity} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Instructions
                </p>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed line-clamp-5">
                  {aiSuggestion.instructions}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          {aiSuggestion && (
            <button
              type="button"
              onClick={handleUse}
              className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Use This Recipe
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


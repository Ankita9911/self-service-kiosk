import { useState } from "react";
import type { AISuggestion } from "@/features/recipes/types/recipe.types";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Loader2, Sparkles, Clock, ChefHat, X } from "lucide-react";

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
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Recipe Generator</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Generate a draft recipe, review it, then save it to inventory flow.</p>
            </div>
          </div>
          <button onClick={handleClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Description input */}
          <div className="space-y-1.5">
            <Label>Describe the dish</Label>
            <textarea
              className="flex min-h-[100px] w-full rounded-2xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              placeholder='e.g. "A spicy paneer tikka masala with cream-based gravy"'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={aiLoading}
            />
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
            {aiLoading ? "Generating…" : "Generate Recipe"}
          </button>

          {/* Suggestion preview */}
          {aiSuggestion && (
            <div className="rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/5 p-4 space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-purple-500" />
                {aiSuggestion.name}
              </h3>

              {/* Prep time */}
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {aiSuggestion.prepTime} min
              </div>

              {/* Ingredients list */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ingredients
                </p>
                <ul className="space-y-1">
                  {aiSuggestion.ingredients.map((ing, i) => (
                    <li
                      key={i}
                      className="text-sm text-slate-600 dark:text-slate-300 flex justify-between"
                    >
                      <span>{ing.name}</span>
                      <span className="text-slate-400">
                        {ing.quantity} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Instructions
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
                  {aiSuggestion.instructions}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button type="button" onClick={handleClose} className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            Cancel
          </button>
          {aiSuggestion && (
            <button type="button" onClick={handleUse} className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Use This Recipe
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

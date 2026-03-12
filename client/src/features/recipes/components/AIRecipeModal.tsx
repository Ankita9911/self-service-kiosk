import { useState } from "react";
import type { AISuggestion } from "@/features/recipes/types/recipe.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Loader2, Sparkles, Clock, ChefHat } from "lucide-react";

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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Recipe Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Description input */}
          <div className="space-y-1.5">
            <Label>Describe the dish</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder='e.g. "A spicy paneer tikka masala with cream-based gravy"'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={aiLoading}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={aiLoading || !description.trim()}
            className="w-full gap-2"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {aiLoading ? "Generating…" : "Generate Recipe"}
          </Button>

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

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {aiSuggestion && (
            <Button onClick={handleUse} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Use This Recipe
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

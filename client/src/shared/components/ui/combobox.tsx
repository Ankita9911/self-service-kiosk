import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/cn";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  /** "filter" = h-9, filter-bar style. "form" = h-10, modal/form style with error support */
  variant?: "filter" | "form";
  /** Red error border — only visible when variant="form" */
  error?: boolean;
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results found",
  icon,
  className,
  disabled = false,
  variant = "filter",
  error = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const selected = options.find((o) => o.value === value);
  const isForm = variant === "form";

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center justify-between gap-1.5 rounded-xl border transition-all",
            "focus:outline-none focus:ring-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isForm
              ? [
                  "w-full h-10 px-3.5 text-sm",
                  "bg-white dark:bg-white/[0.04]",
                  error
                    ? "border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-400/15"
                    : "border-slate-200 dark:border-white/[0.08] focus:border-indigo-300 dark:focus:border-indigo-500/40 focus:ring-indigo-400/20",
                  "text-slate-700 dark:text-slate-200",
                ]
              : [
                  "h-9 px-3 text-[13px]",
                  "bg-white dark:bg-[#161920]",
                  "border-slate-100 dark:border-white/8",
                  "text-slate-700 dark:text-slate-200",
                  "hover:border-slate-300 dark:hover:border-white/20",
                  "focus:border-indigo-400 dark:focus:border-indigo-500/60",
                  "focus:ring-indigo-400/15 dark:focus:ring-indigo-500/10",
                ],
            className,
          )}
        >
          <span className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
            {icon && (
              <span className="shrink-0 text-slate-400 dark:text-slate-500">{icon}</span>
            )}
            <span className="truncate">
              {selected ? (
                selected.label
              ) : (
                <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
              )}
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "p-0 rounded-xl border shadow-xl z-[200]",
          "bg-white dark:bg-[#1a1d26]",
          "border-slate-100 dark:border-white/8",
        )}
        style={{ width: "var(--radix-popover-trigger-width)", minWidth: "200px" }}
        align="start"
        sideOffset={4}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 border-b border-slate-100 dark:border-white/6">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full bg-transparent text-[13px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Options list */}
        <div className="max-h-56 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-slate-400 dark:text-slate-500">
              {emptyText}
            </p>
          ) : (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value);
                  handleOpenChange(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] transition-colors",
                  "text-slate-700 dark:text-slate-200",
                  "hover:bg-indigo-50 dark:hover:bg-indigo-500/10",
                  value === option.value && "bg-indigo-50 dark:bg-indigo-500/10",
                )}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400 transition-opacity",
                    value === option.value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate text-left">{option.label}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

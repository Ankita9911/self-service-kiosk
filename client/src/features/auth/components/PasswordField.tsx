import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  inputClassName?: string;
}

export function PasswordField({
  label,
  value,
  onChange,
  placeholder = "••••••••••",
  required,
  error,
  hint,
  inputClassName = "",
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-clash-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full h-11 pl-10 pr-10 rounded-xl border bg-slate-50 dark:bg-white/4 text-sm font-satoshi text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-red-300 dark:border-red-500/60 focus:ring-red-400/40 focus:border-red-400"
              : "border-slate-200 dark:border-white/8 focus:ring-indigo-400/40 focus:border-indigo-400 dark:focus:border-indigo-500/60"
          } ${inputClassName}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="text-[12px] font-satoshi text-red-500 flex items-center gap-1.5">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}
      {hint && !error && hint}
    </div>
  );
}

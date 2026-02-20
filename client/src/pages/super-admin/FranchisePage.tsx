import { useEffect, useState, useRef } from "react";
import type { Franchise } from "@/types/franchise.types";
import {
  getFranchises,
  createFranchise,
  updateFranchise,
  deleteFranchise,
} from "@/services/franchise.service";

import {
  Plus, Pencil, Trash2, Search, Mail, RefreshCcw,
  X, AlertTriangle, Building2, MoreVertical, TrendingUp,
  CheckCircle2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════
   CARD SHIMMER
══════════════════════════════════════════ */
function CardShimmer() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-slate-50/80 to-transparent" />
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-xl bg-slate-100" />
        <div className="h-6 w-16 rounded-full bg-slate-100" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-100 rounded-lg" />
        <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
      </div>
      <div className="h-px bg-slate-100" />
      <div className="h-4 w-2/3 bg-slate-100 rounded-lg" />
    </div>
  );
}

/* ══════════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════════ */
function StatusBadge({ status }: { status?: string }) {
  const s = status || "PENDING";
  const isActive = s === "ACTIVE";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-clash-semibold tracking-wide border",
      isActive
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-slate-100 text-slate-500 border-slate-200"
    )}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
      )} />
      {s}
    </span>
  );
}

/* ══════════════════════════════════════════
   FRANCHISE CARD
══════════════════════════════════════════ */
const CARD_PALETTES = [
  { light: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", accent: "#f97316" },
  { light: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-100",  accent: "#d97706" },
  { light: "bg-rose-50",   text: "text-rose-600",   border: "border-rose-100",   accent: "#e11d48" },
  { light: "bg-teal-50",   text: "text-teal-600",   border: "border-teal-100",   accent: "#0d9488" },
  { light: "bg-violet-50", text: "text-violet-600", border: "border-violet-100", accent: "#7c3aed" },
  { light: "bg-sky-50",    text: "text-sky-600",    border: "border-sky-100",    accent: "#0284c7" },
];

function FranchiseCard({
  franchise,
  index,
  onEdit,
  onDelete,
}: {
  franchise: Franchise;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const palette = CARD_PALETTES[index % CARD_PALETTES.length];

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const initials = franchise.name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Top color strip */}
      <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${palette.accent}, transparent)` }} />

      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center text-sm font-clash-bold flex-shrink-0 border", palette.light, palette.text, palette.border)}>
            {initials}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <StatusBadge status={franchise.status} />
            {/* Kebab */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-slate-200 shadow-xl z-20 overflow-hidden" style={{ animation: "fadeDown 0.12s ease-out forwards" }}>
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-satoshi text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    Edit details
                  </button>
                  <div className="h-px bg-slate-100 mx-3" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-satoshi text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name + Code */}
        <div>
          <h3 className="font-clash-bold text-slate-900 text-[15px] leading-snug">{franchise.name}</h3>
          <div className="mt-1.5">
            <span className="font-mono text-[12px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {franchise.brandCode}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mt-auto" />

        {/* Email footer */}
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          {franchise.contactEmail ? (
            <a
              href={`mailto:${franchise.contactEmail}`}
              className="text-[13px] font-satoshi text-slate-500 hover:text-orange-600 transition-colors truncate"
            >
              {franchise.contactEmail}
            </a>
          ) : (
            <span className="text-[13px] font-satoshi text-slate-300 italic">No email</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DELETE MODAL
══════════════════════════════════════════ */
function DeleteModal({
  franchise,
  onConfirm,
  onCancel,
}: {
  franchise: Franchise;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ animation: "scaleIn 0.15s ease-out forwards" }}>
        <div className="h-1 bg-gradient-to-r from-red-400 to-red-600" />
        <div className="p-7 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-clash-bold text-slate-900">Delete franchise?</p>
              <p className="font-satoshi text-slate-500 text-sm mt-0.5 truncate max-w-[180px]">{franchise.name}</p>
            </div>
          </div>
          <p className="font-satoshi text-slate-500 text-sm leading-relaxed bg-slate-50 rounded-xl px-4 py-3.5 border border-slate-100">
            This action is <strong className="text-slate-700">permanent</strong> and cannot be undone. All associated data will be removed.
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={go}
              disabled={loading}
              className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-clash-semibold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   FRANCHISE FORM MODAL
══════════════════════════════════════════ */
function FranchiseModal({
  open,
  onClose,
  editing,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  editing: Franchise | null;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({ name: "", brandCode: "", contactEmail: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setDone(false);
      setForm({
        name: editing?.name || "",
        brandCode: editing?.brandCode || "",
        contactEmail: editing?.contactEmail || "",
      });
    }
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      editing
        ? await updateFranchise(editing._id, form)
        : await createFranchise(form);
      setDone(true);
      setTimeout(() => { onClose(); onSuccess(); }, 800);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ animation: "scaleIn 0.15s ease-out forwards" }}>
        <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />

        {done ? (
          <div className="px-8 py-14 flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="font-clash-bold text-slate-900 text-lg">
              {editing ? "Changes saved!" : "Franchise registered!"}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-7 pt-6 pb-5 flex items-start justify-between border-b border-slate-100">
              <div>
                <p className="text-[10px] font-clash-semibold text-orange-500 uppercase tracking-[0.15em] mb-1">
                  {editing ? "Editing" : "New Partner"}
                </p>
                <h2 className="text-lg font-clash-bold text-slate-900">
                  {editing ? "Update Franchise" : "Register Franchise"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
              {[
                { key: "name",         label: "Franchise Name",  placeholder: "e.g. Downtown Kiosk Group", required: true,  type: "text",  hint: "" },
                { key: "brandCode",    label: "Brand Code",      placeholder: "e.g. DKG-01",               required: true,  type: "text",  hint: "Unique identifier used across the platform" },
                { key: "contactEmail", label: "Contact Email",   placeholder: "contact@franchise.com",      required: false, type: "email", hint: "" },
              ].map(({ key, label, placeholder, required, type, hint }) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-[11px] font-clash-semibold text-slate-500 uppercase tracking-widest">
                    {label}
                    {required && <span className="text-orange-500 ml-1">*</span>}
                  </label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: key === "brandCode" ? e.target.value.toUpperCase() : e.target.value })}
                    required={required}
                    placeholder={placeholder}
                    className={cn(
                      "w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all",
                      key === "brandCode" ? "font-mono uppercase" : "font-satoshi"
                    )}
                  />
                  {hint && <p className="text-[11px] font-satoshi text-slate-400">{hint}</p>}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-clash-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-clash-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {submitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : editing ? "Save Changes" : "Register Partner"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function FranchisePage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Franchise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Franchise | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  async function fetchData(silent = false) {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      setFranchises(await getFranchises());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteFranchise(deleteTarget._id);
    setDeleteTarget(null);
    fetchData(true);
  }

  const filtered = franchises.filter(f => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q
      || f.name.toLowerCase().includes(q)
      || f.brandCode.toLowerCase().includes(q)
      || (f.contactEmail || "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" ? f.status === "ACTIVE" : f.status !== "ACTIVE");
    return matchSearch && matchStatus;
  });

  const activeCount = franchises.filter(f => f.status === "ACTIVE").length;

  return (
    <>
      <div className="space-y-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-5 w-5 rounded bg-orange-100 flex items-center justify-center">
                <Building2 className="w-3 h-3 text-orange-600" />
              </div>
              <span className="text-[11px] font-clash-semibold text-orange-500 uppercase tracking-[0.15em]">
                Franchise Directory
              </span>
            </div>
            <h1 className="text-[32px] font-clash-bold text-slate-900 tracking-tight leading-none">
              Partners
            </h1>
            {!loading && (
              <p className="font-satoshi text-slate-400 text-sm mt-1.5">
                {franchises.length} registered ·{" "}
                <span className="text-emerald-600">{activeCount} active</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm"
            >
              <RefreshCcw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </button>
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-clash-semibold transition-all shadow-lg shadow-slate-900/15 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              New Franchise
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        {!loading && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Partners", value: franchises.length, icon: Building2, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
              { label: "Active",         value: activeCount,       icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
              { label: "Inactive",       value: franchises.length - activeCount, icon: Building2, color: "text-slate-400", bg: "bg-slate-50 border-slate-100" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={cn("rounded-2xl border p-5 flex items-center gap-4", bg)}>
                <div className={cn("h-10 w-10 rounded-xl bg-white border border-current/10 flex items-center justify-center", color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={cn("text-2xl font-clash-bold leading-none", color)}>{value}</p>
                  <p className="text-[11px] font-satoshi text-slate-400 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Search + Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code or email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-11 pr-10 rounded-xl border border-slate-200 bg-white text-sm font-satoshi text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15 transition-all shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors">
                <X className="w-3 h-3 text-slate-500" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 h-9 rounded-lg text-[12px] font-clash-semibold transition-all",
                  statusFilter === s
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardShimmer key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="font-clash-bold text-slate-800 text-lg">
                {searchTerm ? "No matches found" : "No franchises yet"}
              </p>
              <p className="font-satoshi text-slate-400 text-sm mt-1">
                {searchTerm
                  ? `Nothing matches "${searchTerm}" — try a different term`
                  : "Register your first franchise partner to get started"}
              </p>
            </div>
            {!searchTerm && (
              <button
                onClick={() => { setEditing(null); setModalOpen(true); }}
                className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-clash-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                Register First Franchise
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((f, i) => (
                <FranchiseCard
                  key={f._id}
                  franchise={f}
                  index={i}
                  onEdit={() => { setEditing(f); setModalOpen(true); }}
                  onDelete={() => setDeleteTarget(f)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[12px] font-satoshi text-slate-400">
              <span>Showing {filtered.length} of {franchises.length} franchises</span>
              {(searchTerm || statusFilter !== "ALL") && (
                <button onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }} className="text-orange-500 hover:text-orange-600 transition-colors">
                  Clear filters
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      <FranchiseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        editing={editing}
        onSuccess={() => fetchData(true)}
      />
      {deleteTarget && (
        <DeleteModal
          franchise={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </>
  );
}
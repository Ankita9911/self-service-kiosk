import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet, OutletAddress } from "@/features/outlet/types/outlet.types";
import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, MapPin, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { outletSchema } from "../validations/outlet.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";

const COUNTRIES_API = "https://restcountries.com/v3.1/all?fields=name,cca2";
const STATES_API    = "https://countriesnow.space/api/v0.1/countries/states";
const PINCODE_API   = "https://api.zippopotam.us";

type Country = { name: string; cca2: string };

type OutletForm = {
  franchiseId: string;
  name: string;
  outletCode: string;
  address: OutletAddress;
};
type FieldErrors = Partial<Record<string, string>>;

const EMPTY_ADDR: OutletAddress = { line1: "", city: "", state: "", pincode: "", country: "" };

export function OutletModal({
  open,
  onClose,
  editing,
  franchises,
  isSuperAdmin,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  editing: Outlet | null;
  franchises: Franchise[];
  isSuperAdmin: boolean;
  onSubmit: (form: OutletForm) => Promise<void>;
}) {
  const [form, setForm] = useState<OutletForm>({
    franchiseId: "",
    name: "",
    outletCode: "",
    address: { ...EMPTY_ADDR },
  });
  const [countries,        setCountries]        = useState<Country[]>([]);
  const [states,           setStates]           = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates,    setLoadingStates]    = useState(false);
  const [loadingPincode,   setLoadingPincode]   = useState(false);
  const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false);
  const [submitting,       setSubmitting]       = useState(false);
  const [done,             setDone]             = useState(false);
  const [errors,           setErrors]           = useState<FieldErrors>({});

  // Reset form when modal opens / editing target changes
  useEffect(() => {
    setDone(false);
    setErrors({});
    setStates([]);
    setForm({
      franchiseId: editing?.franchiseId || "",
      name:        editing?.name        || "",
      outletCode:  editing?.outletCode  || "",
      address: editing?.address
        ? { ...EMPTY_ADDR, ...editing.address }
        : { ...EMPTY_ADDR },
    });
  }, [editing, open]);

  // Fetch country list once
  useEffect(() => {
    if (countries.length > 0) return;
    setLoadingCountries(true);
    fetch(COUNTRIES_API)
      .then((r) => r.json())
      .then((data: Array<{ name: { common: string }; cca2: string }>) => {
        setCountries(
          data
            .map((c) => ({ name: c.name.common, cca2: c.cca2 }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      })
      .catch(() => {})
      .finally(() => setLoadingCountries(false));
  }, []);

  // Derive cca2 code for selected country (used by pincode API)
  const selectedCca2 = countries.find((c) => c.name === form.address.country)?.cca2 ?? "";

  // Fetch states whenever country changes
  useEffect(() => {
    const country = form.address.country;
    if (!country) { setStates([]); return; }
    setLoadingStates(true);
    fetch(STATES_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country }),
    })
      .then((r) => r.json())
      .then((data: { data?: { states?: Array<{ name: string }> } }) => {
        setStates((data.data?.states || []).map((s) => s.name).sort());
      })
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
  }, [form.address.country]);

  // Debounced pincode lookup
  useEffect(() => {
    const pincode = form.address.pincode?.trim();
    if (!pincode || pincode.length < 3 || !selectedCca2) {
      setPincodeAutoFilled(false);
      return;
    }
    setPincodeAutoFilled(false);
    setLoadingPincode(true);
    const timer = setTimeout(() => {
      fetch(`${PINCODE_API}/${selectedCca2.toLowerCase()}/${pincode}`)
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then((data: { places?: Array<{ "place name": string; state: string }> }) => {
          const place = data.places?.[0];
          if (!place) return;

          // Normalize a string: lowercase + strip diacritics for fuzzy matching
          const norm = (s: string) =>
            s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();

          // Try to find the best matching state in the loaded dropdown options
          const rawState = place.state ?? "";
          const matchedState =
            states.find((s) => norm(s) === norm(rawState)) ?? rawState;

          setForm((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              city:  prev.address.city  || place["place name"],
              state: prev.address.state || matchedState,
            },
          }));
          setPincodeAutoFilled(true);
        })
        .catch(() => {})
        .finally(() => setLoadingPincode(false));
    }, 600);
    return () => { clearTimeout(timer); setLoadingPincode(false); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.address.pincode, selectedCca2]);

  function handleChange(key: "franchiseId" | "name" | "outletCode", raw: string) {
    const value = key === "outletCode" ? raw.toUpperCase() : raw;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleAddressChange(key: keyof OutletAddress, value: string) {
    if (key === "country") {
      // clear state + pincode autofill indicator when country changes
      setPincodeAutoFilled(false);
      setForm((prev) => ({ ...prev, address: { ...prev.address, country: value, state: "" } }));
    } else if (key === "pincode") {
      setPincodeAutoFilled(false);
      setForm((prev) => ({ ...prev, address: { ...prev.address, pincode: value } }));
    } else {
      setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
    }
    if (errors[`address.${key}`]) setErrors((prev) => ({ ...prev, [`address.${key}`]: undefined }));
  }

  function validate(): boolean {
    if (isSuperAdmin && !form.franchiseId) {
      setErrors({ franchiseId: "Please select a franchise" });
      return false;
    }
    const result = outletSchema.safeParse(form);
    if (result.success) { setErrors({}); return true; }
    setErrors(getZodFieldErrors<{ [k: string]: string }>(result.error));
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      toast.success(editing ? "Outlet updated!" : "Outlet registered!");
      setDone(true);
      setTimeout(onClose, 900);
    } catch {
      toast.error("Failed to save outlet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const inputCls = (field: string) =>
    `w-full h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-white/4 border text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-400/15"
        : "border-slate-200 dark:border-white/8 focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-indigo-400/15"
    }`;

  const selectCls = (field: string, disabled = false) =>
    `w-full h-10 px-3.5 rounded-xl text-[13px] bg-slate-50 dark:bg-white/4 border text-slate-800 dark:text-white focus:outline-none focus:ring-2 transition-all ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${
      errors[field]
        ? "border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-400/15"
        : "border-slate-200 dark:border-white/8 focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-indigo-400/15"
    }`;

  const LabelCls = "block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider";

  const ErrMsg = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1">
        <span className="inline-block h-1 w-1 rounded-full bg-current" />
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="
        relative w-full max-w-lg overflow-hidden
        bg-white dark:bg-[#1a1d26]
        border border-slate-100 dark:border-white/8
        rounded-2xl shadow-2xl shadow-slate-300/20 dark:shadow-black/40
        animate-scale-in
      ">
        <div className="h-0.5 bg-linear-to-r from-indigo-400 via-indigo-500 to-violet-500" />

        {done ? (
          <div className="px-8 py-14 flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-white">
              {editing ? "Changes saved!" : "Outlet registered!"}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-50 dark:border-white/6">
              <div>
                <p className="text-[10.5px] font-semibold text-indigo-500 uppercase tracking-[0.15em] mb-1">
                  {editing ? "Editing" : "New Location"}
                </p>
                <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">
                  {editing ? "Update Outlet" : "Register Outlet"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/7 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto" noValidate>

              {/* Franchise (super admin only) */}
              {isSuperAdmin && (
                <div className="space-y-1.5">
                  <label className={LabelCls}>Franchise <span className="text-indigo-500">*</span></label>
                  <select
                    value={form.franchiseId}
                    onChange={(e) => handleChange("franchiseId", e.target.value)}
                    className={selectCls("franchiseId")}
                  >
                    <option value="">Select a franchise…</option>
                    {franchises.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
                  </select>
                  <ErrMsg field="franchiseId" />
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className={LabelCls}>Outlet Name <span className="text-indigo-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Downtown Branch"
                  className={inputCls("name")}
                />
                <ErrMsg field="name" />
              </div>

              {/* Code */}
              <div className="space-y-1.5">
                <label className={LabelCls}>Outlet Code <span className="text-indigo-500">*</span></label>
                <input
                  type="text"
                  value={form.outletCode}
                  onChange={(e) => handleChange("outletCode", e.target.value)}
                  placeholder="e.g. HK-001"
                  className={`${inputCls("outletCode")} font-mono uppercase tracking-wide`}
                />
                <ErrMsg field="outletCode" />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Unique identifier used across the platform</p>
              </div>

              {/* ── Address ─────────────────────────────────── */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-px flex-1 bg-slate-100 dark:bg-white/6" />
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <MapPin className="w-3 h-3" /> Address
                  </span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-white/6" />
                </div>

                {/* Street */}
                <div className="space-y-1.5">
                  <label className={LabelCls}>Street / Building</label>
                  <input
                    type="text"
                    value={form.address.line1 || ""}
                    onChange={(e) => handleAddressChange("line1", e.target.value)}
                    placeholder="e.g. 12, MG Road, 2nd Floor"
                    className={inputCls("address.line1")}
                  />
                  <ErrMsg field="address.line1" />
                </div>

                {/* Country + State */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={LabelCls}>Country</label>
                    <div className="relative">
                      <select
                        value={form.address.country || ""}
                        onChange={(e) => handleAddressChange("country", e.target.value)}
                        disabled={loadingCountries}
                        className={selectCls("address.country", loadingCountries)}
                      >
                        <option value="">{loadingCountries ? "Loading…" : "Select country"}</option>
                        {countries.map((c) => (
                          <option key={c.cca2} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      {loadingCountries && (
                        <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                    </div>
                    <ErrMsg field="address.country" />
                  </div>

                  <div className="space-y-1.5">
                    <label className={LabelCls}>State / Province</label>
                    <div className="relative">
                      {states.length > 0 ? (
                        <select
                          value={form.address.state || ""}
                          onChange={(e) => handleAddressChange("state", e.target.value)}
                          disabled={loadingStates}
                          className={selectCls("address.state", loadingStates)}
                        >
                          <option value="">{loadingStates ? "Loading…" : "Select state"}</option>
                          {states.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={form.address.state || ""}
                          onChange={(e) => handleAddressChange("state", e.target.value)}
                          placeholder={
                            loadingStates
                              ? "Loading states…"
                              : form.address.country
                              ? "Enter state / province"
                              : "Select country first"
                          }
                          disabled={loadingStates || !form.address.country}
                          className={selectCls("address.state", loadingStates || !form.address.country)}
                        />
                      )}
                      {loadingStates && (
                        <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                    </div>
                    <ErrMsg field="address.state" />
                  </div>
                </div>

                {/* City + Pincode */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={LabelCls}>City</label>
                    <input
                      type="text"
                      value={form.address.city || ""}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      placeholder="e.g. Mumbai"
                      className={inputCls("address.city")}
                    />
                    <ErrMsg field="address.city" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={LabelCls}>PIN / ZIP Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.address.pincode || ""}
                        onChange={(e) => handleAddressChange("pincode", e.target.value)}
                        placeholder={selectedCca2 ? "e.g. 400001" : "Select country first"}
                        disabled={!selectedCca2 && !form.address.pincode}
                        className={`${inputCls("address.pincode")} pr-8`}
                      />
                      {loadingPincode && (
                        <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                      {pincodeAutoFilled && !loadingPincode && (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                    </div>
                    {pincodeAutoFilled && !loadingPincode && (
                      <p className="text-[11px] text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                        <span className="inline-block h-1 w-1 rounded-full bg-current" />
                        City auto-filled from pincode
                      </p>
                    )}
                    <ErrMsg field="address.pincode" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-10 rounded-xl text-[13px] font-semibold border border-slate-200 dark:border-white/8 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-10 rounded-xl text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition disabled:opacity-60"
                >
                  {submitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : editing ? "Save Changes" : "Register Outlet"
                  }
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

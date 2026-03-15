import { useState, useRef } from "react";
import {
  MonitorSmartphone,
  Plus,
  Loader2,
  X,
  ImagePlus,
  Trash2,
} from "lucide-react";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { createDeviceSchema } from "../validations/device.schemas";
import { getZodFieldErrors } from "@/shared/utils/zod.utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  getUploadUrl,
  uploadFileToS3,
} from "@/features/upload/service/upload.service";

interface Props {
  open: boolean;
  onClose: () => void;
  outlets: Outlet[];
  onCreate: (data: {
    outletId: string;
    name: string;
    landingImage?: string;
    landingTitle?: string;
    landingSubtitle?: string;
  }) => Promise<string>;
  onCreated: (secret: string) => void;
}

type FormState = {
  outletId: string;
  name: string;
  landingTitle: string;
  landingSubtitle: string;
};
type FieldErrors = Partial<Record<keyof FormState, string>>;

export function CreateDeviceModal({
  open,
  onClose,
  outlets,
  onCreate,
  onCreated,
}: Props) {
  const [form, setForm] = useState<FormState>({
    outletId: "",
    name: "",
    landingTitle: "",
    landingSubtitle: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function validate(): boolean {
    const result = createDeviceSchema.safeParse({
      outletId: form.outletId,
      name: form.name,
    });
    if (result.success) {
      setErrors({});
      return true;
    }
    setErrors(getZodFieldErrors<FormState>(result.error));
    return false;
  }

  function handleChange(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FieldErrors])
      setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      let landingImageUrl: string | undefined;

      if (imageFile) {
        const { uploadUrl, publicUrl } = await getUploadUrl(
          imageFile,
          "devices",
          form.outletId,
        );
        await uploadFileToS3(uploadUrl, imageFile);
        landingImageUrl = publicUrl;
      }

      const secret = await onCreate({
        outletId: form.outletId,
        name: form.name.trim(),
        ...(landingImageUrl && { landingImage: landingImageUrl }),
        ...(form.landingTitle.trim() && {
          landingTitle: form.landingTitle.trim(),
        }),
        ...(form.landingSubtitle.trim() && {
          landingSubtitle: form.landingSubtitle.trim(),
        }),
      });
      setForm({
        outletId: "",
        name: "",
        landingTitle: "",
        landingSubtitle: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
      onClose();
      onCreated(secret);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
      />
      <div className="relative bg-white dark:bg-[#1a1d26] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="h-0.5 bg-linear-to-r from-indigo-400 via-indigo-500 to-violet-500" />

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-white/6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
              <MonitorSmartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Register Kiosk Device
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Assign device to an outlet
              </p>
            </div>
          </div>
          <button
            onClick={() => !submitting && onClose()}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 pb-6 pt-5 space-y-4 max-h-[75vh] overflow-y-auto"
          noValidate
        >
          {/* Outlet */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Outlet <span className="text-red-400">*</span>
            </label>
            <Select
              value={form.outletId}
              onValueChange={(val) => handleChange("outletId", val)}
            >
              <SelectTrigger
                className={`h-10 rounded-xl border text-sm transition-all bg-white dark:bg-white/4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-400/20 ${
                  errors.outletId
                    ? "border-red-400 focus:border-red-400"
                    : "border-slate-200 dark:border-white/8 focus:border-indigo-300 dark:focus:border-indigo-500/40"
                }`}
              >
                <SelectValue placeholder="Select an outlet..." />
              </SelectTrigger>
              <SelectContent>
                {outlets.length === 0 ? (
                  <div className="px-3 py-4 text-center space-y-0.5">
                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                      No outlets found
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Please create an outlet first.
                    </p>
                  </div>
                ) : (
                  outlets.map((o) => (
                    <SelectItem key={o._id} value={o._id}>
                      {o.name} ({o.outletCode})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.outletId && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                {errors.outletId}
              </p>
            )}
          </div>

          {/* Device name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Device Name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Counter 1 Kiosk"
              className={`w-full h-10 px-3.5 rounded-xl border text-sm transition-all bg-white dark:bg-white/4 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 ${
                errors.name
                  ? "border-red-400 focus:border-red-400"
                  : "border-slate-200 dark:border-white/8 focus:border-indigo-300 dark:focus:border-indigo-500/40"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Landing screen section divider */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-slate-100 dark:bg-white/6" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Landing Screen
            </span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-white/6" />
          </div>

          {/* Landing image */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Landing Image{" "}
              <span className="text-slate-400 dark:text-slate-600 font-normal normal-case">
                (optional)
              </span>
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 aspect-video bg-slate-50 dark:bg-white/3">
                <img
                  src={imagePreview}
                  alt="Landing preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/8 flex flex-col items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400 transition-all"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs font-medium">Upload image</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Landing title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Landing Title{" "}
              <span className="text-slate-400 dark:text-slate-600 font-normal normal-case">
                (optional)
              </span>
            </label>
            <input
              value={form.landingTitle}
              onChange={(e) => handleChange("landingTitle", e.target.value)}
              placeholder="e.g. Discover Our Menu"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/8 text-sm transition-all bg-white dark:bg-white/4 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-500/40"
            />
          </div>

          {/* Landing subtitle */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Landing Subtitle{" "}
              <span className="text-slate-400 dark:text-slate-600 font-normal normal-case">
                (optional)
              </span>
            </label>
            <input
              value={form.landingSubtitle}
              onChange={(e) => handleChange("landingSubtitle", e.target.value)}
              placeholder="e.g. Explore fresh and flavorful options"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/8 text-sm transition-all bg-white dark:bg-white/4 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-500/40"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-white/8 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Register
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

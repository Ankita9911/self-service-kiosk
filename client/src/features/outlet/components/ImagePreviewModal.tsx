import { X, ZoomIn } from "lucide-react";
import { useEffect } from "react";

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImagePreviewModal({ src, alt, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* image */}
      <div
        className="relative max-w-3xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto max-h-[80vh] object-contain bg-black"
          />
        </div>
        <p className="mt-3 text-center text-sm text-white/60 font-medium">
          {alt}
        </p>
      </div>
    </div>
  );
}

/** Small button used inside card/row hover overlays */
export function ImageZoomButton({
  onClick,
}: {
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-7 w-7 rounded-xl bg-white/90 dark:bg-[#1e2130]/90 backdrop-blur-sm border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 shadow-sm transition-colors"
      title="View image"
    >
      <ZoomIn className="w-3 h-3" />
    </button>
  );
}

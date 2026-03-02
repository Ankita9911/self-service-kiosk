import { Building2, Mail } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { RowMenu } from "./RowMenu";
import { ShimmerCell } from "./ShimmerCell";
import { TablePagination } from "@/shared/components/ui/TablePagination";
import type { Franchise } from "../types/franchise.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface Props {
  franchises: Franchise[];
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (f: Franchise) => void;
  onDelete: (f: Franchise) => void;
  onToggleStatus: (f: Franchise) => void;
}

export function FranchiseTable({
  franchises,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  const paginated = franchises.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white dark:bg-[#161920] rounded-2xl border border-slate-100 dark:border-white/[0.06]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-50 dark:border-white/[0.05] bg-slate-50/60 dark:bg-white/[0.02]">
            {["Franchise", "Brand Code", "Contact", "Status", ""].map(
              (h, i) => (
                <th
                  key={i}
                  className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50 dark:divide-white/[0.04]">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <ShimmerCell w="w-36" />
                <ShimmerCell w="w-20" />
                <ShimmerCell w="w-40" />
                <ShimmerCell w="w-16" />
                <ShimmerCell w="w-6" />
              </tr>
            ))
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold text-slate-600 dark:text-slate-400">
                      No franchises found
                    </p>
                    <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            paginated.map((f) => (
              <tr
                key={f._id}
                className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.04] transition-colors"
              >
                {/* Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <p
                            className="text-[13px] font-semibold text-slate-800 dark:text-white truncate max-w-90"
                          >
                            {f.name}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top" >
                          <p className="text-xs font-medium">{f.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>

                {/* Brand Code */}
                <td className="px-5 py-4">
                  <span className="font-mono text-[11.5px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.07] px-2 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] truncate">
                    {f.brandCode}
                  </span>
                </td>

                {/* Contact */}
                <td className="px-5 py-4">
                  {f.contactEmail ? (
                    <a
                      href={`mailto:${f.contactEmail}`}
                      title={f.contactEmail}
                      className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors max-w-[180px]"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{f.contactEmail}</span>
                    </a>
                  ) : (
                    <span className="text-[12px] text-slate-300 dark:text-slate-600 italic">
                      No email
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <StatusBadge status={f.status} />
                </td>

                {/* Actions */}
                <td className="px-3 py-4">
                  <RowMenu
                    status={f.status}
                    onEdit={() => onEdit(f)}
                    onDelete={() => onDelete(f)}
                    onToggleStatus={() => onToggleStatus(f)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && franchises.length > 0 && (
        <div className="border-t border-slate-50 dark:border-white/[0.05]">
          <TablePagination
            total={franchises.length}
            page={page}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}

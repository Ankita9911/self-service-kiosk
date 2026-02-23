import type { Franchise } from "../types/franchise.types";
import { Mail, Building2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { RowMenu } from "./RowMenu";
import { ShimmerCell } from "./ShimmerCell";
import { TablePagination } from "@/shared/components/ui/TablePagination";

interface Props {
  franchises: Franchise[];
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (f: Franchise) => void;
  onDelete: (f: Franchise) => void;
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
}: Props) {
  const paginated = franchises.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {["Franchise", "Brand Code", "Contact", "Status", "Actions"].map(
              (h, i) => (
                <th
                  key={i}
                  className="px-5 py-3.5 text-left text-[11px] font-clash-semibold text-slate-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
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
              <td colSpan={5} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="font-clash-semibold text-slate-600">
                    No franchises yet
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            paginated.map(f => (
              <tr key={f._id} className="group hover:bg-orange-50/20">
                <td className="px-5 py-4">
                  <p className="font-clash-semibold text-slate-800 text-sm">
                    {f.name}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="font-mono text-[12px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {f.brandCode}
                  </span>
                </td>

                <td className="px-5 py-4">
                  {f.contactEmail ? (
                    <a
                      href={`mailto:${f.contactEmail}`}
                      className="flex items-center gap-1.5 text-[13px] font-satoshi text-slate-500 hover:text-orange-600"
                    >
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      {f.contactEmail}
                    </a>
                  ) : (
                    <span className="text-[13px] font-satoshi text-slate-300 italic">
                      No email
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={f.status} />
                </td>

                <td className="px-3 py-4">
                  <RowMenu
                    onEdit={() => onEdit(f)}
                    onDelete={() => onDelete(f)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && franchises.length > 0 && (
        <TablePagination
          total={franchises.length}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
import { useState } from "react";
import { useFranchises } from "../hooks/useFranchise";
import { FranchiseTable } from "../components/FranchiseTable";
import { FranchiseHeader } from "../components/FranchiseHeader";
import { FranchiseStats } from "../components/FranchiseStats";
import { FranchiseFilters } from "../components/FranchiseFilters";
import { FranchiseModal } from "../components/FranchiseModal";
import { DeleteModal } from "../components/DeleteModal";
import type { Franchise } from "../types/franchise.types";

export default function FranchisePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Franchise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Franchise | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const {
    franchises,
    loading,
    refreshing,
    totalFranchises,
    activeFranchises,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
    resetToFirstPage,
    fetchFranchises,
    handleDelete,
    handleCreate,
    handleUpdate,
    handleSetStatus,
  } = useFranchises({ search: searchTerm, status: statusFilter });

  // Reset to page 1 when filters change
  const handleSearchChange = (v: string) => {
    setSearchTerm(v);
    resetToFirstPage();
  };
  const handleStatusChange = (v: "ALL" | "ACTIVE" | "INACTIVE") => {
    setStatusFilter(v);
    resetToFirstPage();
  };

  return (
    <>
      <div className="space-y-5">
        <FranchiseHeader
          refreshing={refreshing}
          onRefresh={() => fetchFranchises(true)}
          onNew={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        />

        <FranchiseStats
          franchises={[]}
          loading={loading || refreshing}
          totalFranchises={totalFranchises}
          activeFranchises={activeFranchises}
        />

        <FranchiseFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
        />

        <FranchiseTable
          franchises={franchises}
          loading={loading || refreshing}
          page={page}
          pageSize={pageSize}
          total={totalMatching}
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
          onPageSizeChange={setPageSize}
          onEdit={(f) => {
            setEditing(f);
            setModalOpen(true);
          }}
          onDelete={(f) => setDeleteTarget(f)}
          onToggleStatus={(f) =>
            handleSetStatus(
              f._id,
              f.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            )
          }
        />
      </div>

      <FranchiseModal
        open={modalOpen}
        editing={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {deleteTarget && (
        <DeleteModal
          franchise={deleteTarget}
          onConfirm={async () => {
            await handleDelete(deleteTarget._id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

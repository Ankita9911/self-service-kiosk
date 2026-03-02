import { useState, useMemo } from "react";
import { useFranchises } from "../hooks/useFranchise";
import { FranchiseTable } from "../components/FranchiseTable";
import { FranchiseHeader } from "../components/FranchiseHeader";
import { FranchiseStats } from "../components/FranchiseStats";
import { FranchiseFilters } from "../components/FranchiseFilters";
import { FranchiseModal } from "../components/FranchiseModal";
import { DeleteModal } from "../components/DeleteModal";
import type { Franchise } from "../types/franchise.types";

export default function FranchisePage() {
  const {
    franchises,
    loading,
    refreshing,
    fetchFranchises,
    handleDelete,
    handleCreate,
    handleUpdate,
    handleSetStatus,
  } = useFranchises();

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState<Franchise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Franchise | null>(null);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);

  const filteredFranchises = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return franchises.filter((f) => {
      const matchesSearch =
        !query ||
        f.name.toLowerCase().includes(query) ||
        f.brandCode.toLowerCase().includes(query) ||
        (f.contactEmail || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? f.status === "ACTIVE" : f.status !== "ACTIVE");

      return matchesSearch && matchesStatus;
    });
  }, [franchises, searchTerm, statusFilter]);

  // Reset to page 1 when filters change
  const handleSearchChange = (v: string) => { setSearchTerm(v); setPage(1); };
  const handleStatusChange = (v: "ALL" | "ACTIVE" | "INACTIVE") => { setStatusFilter(v); setPage(1); };

  return (
    <>
      <div className="space-y-5">
        <FranchiseHeader
          refreshing={refreshing}
          onRefresh={() => fetchFranchises(true)}
          onNew={() => { setEditing(null); setModalOpen(true); }}
        />

        <FranchiseStats
          franchises={franchises}
          loading={loading || refreshing}
        />

        <FranchiseFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
        />

        <FranchiseTable
          franchises={filteredFranchises}
          loading={loading || refreshing}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          onEdit={(f) => { setEditing(f); setModalOpen(true); }}
          onDelete={(f) => setDeleteTarget(f)}
          onToggleStatus={(f) => handleSetStatus(f._id, f.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
        />
      </div>

      <FranchiseModal
        open={modalOpen}
        editing={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
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
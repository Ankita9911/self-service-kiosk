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
  } = useFranchises();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Franchise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Franchise | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

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
        (statusFilter === "ACTIVE"
          ? f.status === "ACTIVE"
          : f.status !== "ACTIVE");

      return matchesSearch && matchesStatus;
    });
  }, [franchises, searchTerm, statusFilter]);

  return (
    <>
      <div className="space-y-6">
        <FranchiseHeader
          refreshing={refreshing}
          onRefresh={() => fetchFranchises(true)}
          onNew={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        />

        <FranchiseStats
          franchises={filteredFranchises}
          loading={loading || refreshing}
        />

        <FranchiseFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
        />

        <FranchiseTable
          franchises={filteredFranchises}
          loading={loading || refreshing}
          page={1}
          pageSize={10}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          onEdit={(f) => {
            setEditing(f);
            setModalOpen(true);
          }}
          onDelete={(f) => setDeleteTarget(f)}
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

      <style>{`
        @keyframes scaleIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(250%); } }
      `}</style>
    </>
  );
}
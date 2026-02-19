import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

import type { Outlet } from "@/types/outlet.types";
import type { Franchise } from "@/types/franchise.types";

import {
  getOutlets,
  createOutlet,
  updateOutlet,
  deleteOutlet,
} from "@/services/outlet.service";
import { getFranchises } from "@/services/franchise.service";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import {
  Store,
  Plus,
  Search,
  MapPin,
  Pencil,
  Trash2,
  MoreHorizontal,
  Loader2,
  RefreshCcw,
  Building,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/lib/permissions";
import { usePermission } from "@/hooks/usePermissions";

export default function OutletPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const canViewOutlet = hasPermission(PERMISSIONS.OUTLET_VIEW);
  const canCreateOutlet = hasPermission(PERMISSIONS.OUTLET_CREATE);
  const canUpdateOutlet = hasPermission(PERMISSIONS.OUTLET_UPDATE);
  const canDeleteOutlet = hasPermission(PERMISSIONS.OUTLET_DELETE);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Outlet | null>(null);

  const [form, setForm] = useState({
    franchiseId: "",
    name: "",
    outletCode: "",
    address: "",
  });

  useEffect(() => {
    if (!canViewOutlet) return;

    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const outletData = await getOutlets();
      setOutlets(outletData);

      if (isSuperAdmin) {
        const franchiseData = await getFranchises();
        setFranchises(franchiseData);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editing && !canUpdateOutlet) return;
    if (!editing && !canCreateOutlet) return;

    if (editing) {
      await updateOutlet(editing._id, form);
    } else {
      await createOutlet(form);
    }

    resetForm();
    fetchData();
  }

  function resetForm() {
    setEditing(null);
    setForm({
      franchiseId: "",
      name: "",
      outletCode: "",
      address: "",
    });
    setOpen(false);
  }

  async function handleDelete(id: string) {
    if (!canDeleteOutlet) return;
    if (!confirm("Delete this outlet?")) return;

    await deleteOutlet(id);
    fetchData();
  }

  function handleEdit(outlet: Outlet) {
    if (!canUpdateOutlet) return;

    setEditing(outlet);
    setForm({
      franchiseId: outlet.franchiseId,
      name: outlet.name,
      outletCode: outlet.outletCode,
      address: outlet.address || "",
    });
    setOpen(true);
  }

  const filteredOutlets = outlets.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.outletCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canViewOutlet) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-slate-600">
        Unauthorized
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fafafa]">
      <div className="h-1.5 w-full bg-linear-to-r from-orange-400 to-orange-600" />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-600 font-medium text-sm uppercase tracking-wider">
              <Store className="w-4 h-4" />
              Operations
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Outlet Management
            </h1>
            <p className="text-slate-500">
              View and manage physical kiosk locations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCcw
                className={cn("w-4 h-4", loading && "animate-spin")}
              />
            </Button>

            {canCreateOutlet && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Outlet
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search outlets..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-24 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outlet Name</TableHead>
                    <TableHead>Code</TableHead>
                    {isSuperAdmin && <TableHead>Franchise</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredOutlets.map((o) => (
                    <TableRow key={o._id} className="group">
                      <TableCell>
                        <div>
                          <div className="font-semibold">{o.name}</div>
                          <div className="text-xs text-slate-500">
                            <MapPin className="w-3 h-3 inline" />{" "}
                            {o.address || "No address"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{o.outletCode}</TableCell>

                      {isSuperAdmin && (
                        <TableCell>
                          {franchises.find(
                            (f) => f._id === o.franchiseId
                          )?.name || "N/A"}
                        </TableCell>
                      )}

                      <TableCell>{o.status}</TableCell>

                      <TableCell className="text-right pr-6">
                        <div className="hidden group-hover:flex gap-2 justify-end">
                          {canUpdateOutlet && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(o)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}

                          {canDeleteOutlet && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(o._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="group-hover:hidden flex justify-end">
                          <MoreHorizontal className="w-5 h-5 text-slate-300" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Outlet" : "Create Outlet"}
              </DialogTitle>
              <DialogDescription>
                Fill outlet details.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSuperAdmin && (
                <div>
                  <Label>Franchise</Label>
                  <select
                    value={form.franchiseId}
                    onChange={(e) =>
                      setForm({ ...form, franchiseId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Franchise</option>
                    {franchises.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Code</Label>
                <Input
                  value={form.outletCode}
                  onChange={(e) =>
                    setForm({ ...form, outletCode: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>

                {(canCreateOutlet || canUpdateOutlet) && (
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {editing ? "Save Changes" : "Create"}
                  </Button>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

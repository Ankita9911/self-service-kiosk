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
  Building 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OutletPage() {
  const { user } = useAuth();
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

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    if (!confirm("Delete this outlet?")) return;
    await deleteOutlet(id);
    fetchData();
  }

  function handleEdit(outlet: Outlet) {
    setEditing(outlet);
    setForm({
      franchiseId: outlet.franchiseId,
      name: outlet.name,
      outletCode: outlet.outletCode,
      address: outlet.address || "",
    });
    setOpen(true);
  }

  const filteredOutlets = outlets.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.outletCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#fafafa]">
      <div className="h-1.5 w-full bg-linear-to-r from-orange-400 to-orange-600" />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-600 font-medium text-sm uppercase tracking-wider">
              <Store className="w-4 h-4" />
              Operations
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Outlet Management
            </h1>
            <p className="text-slate-500">View and manage physical kiosk locations.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchData} 
              className="text-slate-500 hover:text-orange-600"
              disabled={loading}
            >
              <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button 
              onClick={() => { setEditing(null); setOpen(true); }}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-md gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Outlet
            </Button>
          </div>
        </div>

        {/* Full-Width Search Box */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search outlets by name or location code..." 
              className="pl-10 w-full border-slate-200 focus-visible:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold">Outlet Name</TableHead>
                    <TableHead className="font-bold">Code</TableHead>
                    {isSuperAdmin && <TableHead className="font-bold">Franchise</TableHead>}
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredOutlets.map((o) => (
                    <TableRow key={o._id} className="hover:bg-orange-50/30 group transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{o.name}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {o.address || "No address"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono border border-slate-200">
                          {o.outletCode}
                        </span>
                      </TableCell>

                      {isSuperAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            {franchises.find(f => f._id === o.franchiseId)?.name || "N/A"}
                          </div>
                        </TableCell>
                      )}

                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                          o.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {o.status || "INACTIVE"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end min-h-8">
                          {/* Hover Actions */}
                          <div className="hidden group-hover:flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-orange-600 hover:bg-orange-100"
                              onClick={() => handleEdit(o)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(o._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Centered More Icon for Non-Hover */}
                          <div className="group-hover:hidden flex items-center justify-center w-8 h-8">
                            <MoreHorizontal className="w-5 h-5 text-slate-300" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal Content */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editing ? "Edit Outlet" : "Create New Outlet"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for the operational kiosk location.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              {isSuperAdmin && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Franchise Partner</Label>
                  <select
                    className="w-full h-10 border border-slate-200 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    value={form.franchiseId}
                    onChange={(e) => setForm({ ...form, franchiseId: e.target.value })}
                    required
                  >
                    <option value="">Select a Franchise</option>
                    {franchises.map((f) => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Outlet Name</Label>
                <Input
                  placeholder="e.g. Central Mall Kiosk"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Outlet Code</Label>
                <Input
                  placeholder="e.g. CM-001"
                  value={form.outletCode}
                  onChange={(e) => setForm({ ...form, outletCode: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Physical Address</Label>
                <Input
                  placeholder="Full street address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                  {editing ? "Save Changes" : "Create Outlet"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
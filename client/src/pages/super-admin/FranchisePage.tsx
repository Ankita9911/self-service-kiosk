import { useEffect, useState } from "react";
import type { Franchise } from "@/types/franchise.types";
import {
  getFranchises,
  createFranchise,
  updateFranchise,
  deleteFranchise,
} from "@/services/franchise.service";

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
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Building2, 
  Mail, 
  MoreHorizontal,
  Loader2,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FranchisePage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Franchise | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    brandCode: "",
    contactEmail: "",
  });

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getFranchises();
      setFranchises(data);
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
      await updateFranchise(editing._id, form);
    } else {
      await createFranchise(form);
    }
    resetForm();
    fetchData();
  }

  function resetForm() {
    setEditing(null);
    setForm({
      name: "",
      brandCode: "",
      contactEmail: "",
    });
    setOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    await deleteFranchise(id);
    fetchData();
  }

  function handleEdit(franchise: Franchise) {
    setEditing(franchise);
    setForm({
      name: franchise.name,
      brandCode: franchise.brandCode,
      contactEmail: franchise.contactEmail || "",
    });
    setOpen(true);
  }

  const filteredFranchises = franchises.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.brandCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#fafafa]">
      <div className="h-1.5 w-full bg-linear-to-r from-orange-400 to-orange-600" />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-600 font-medium text-sm uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              Directory
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Franchise Partners
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchData} 
              className="text-slate-500 hover:text-orange-600 border-slate-200"
              disabled={loading}
            >
              <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button 
              onClick={() => { setEditing(null); setOpen(true); }}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-md gap-2"
            >
              <Plus className="w-4 h-4" />
              New Franchise
            </Button>
          </div>
        </div>

        {/* Search Box - Now taking full width */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name or brand code..." 
              className="pl-10 w-full border-slate-200 focus-visible:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Content */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold">Franchise Name</TableHead>
                    <TableHead className="font-bold">Code</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredFranchises.map((f) => (
                    <TableRow key={f._id} className="hover:bg-orange-50/30 group">
                      <TableCell className="font-semibold text-slate-800">{f.name}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono border border-slate-200">
                          {f.brandCode}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {f.contactEmail || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                          f.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {f.status || "PENDING"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right pr-6 min-w-35">
                        {/* Container for alignment fix */}
                        <div className="flex items-center justify-end h-full">
                          {/* Hover Actions */}
                          <div className="hidden group-hover:flex items-center gap-2 transition-all">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-orange-600 hover:bg-orange-100"
                              onClick={() => handleEdit(f)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(f._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Static Icon - Fixed alignment */}
                          <div className="group-hover:hidden flex items-center justify-center h-8 w-8">
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

        {/* Modal Form - Phone Number Removed */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editing ? "Update Franchise" : "Register Franchise"}
              </DialogTitle>
              <DialogDescription>
                Provide the basic details for the franchise partner.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Franchise Name</Label>
                <Input
                  placeholder="e.g. Downtown Kiosk Group"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Brand Code</Label>
                <Input
                  placeholder="e.g. DKG-01"
                  value={form.brandCode}
                  onChange={(e) => setForm({ ...form, brandCode: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Contact Email</Label>
                <Input
                  type="email"
                  placeholder="contact@franchise.com"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                  {editing ? "Update" : "Register"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function OutletPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold">
              Outlet Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage operational outlets
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>
                Create Outlet
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Outlet" : "Create Outlet"}
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 mt-4"
              >
                {isSuperAdmin && (
                  <div>
                    <Label>Franchise</Label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={form.franchiseId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          franchiseId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">
                        Select Franchise
                      </option>
                      {franchises.map((f) => (
                        <option
                          key={f._id}
                          value={f._id}
                        >
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
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Outlet Code</Label>
                  <Input
                    value={form.outletCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        outletCode: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editing ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    {isSuperAdmin && (
                      <TableHead>Franchise</TableHead>
                    )}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {outlets.map((o) => (
                    <TableRow key={o._id}>
                      <TableCell>{o.name}</TableCell>
                      <TableCell>{o.outletCode}</TableCell>

                      {isSuperAdmin && (
                        <TableCell>
                          {franchises.find(
                            (f) =>
                              f._id === o.franchiseId
                          )?.name || "-"}
                        </TableCell>
                      )}

                      <TableCell>{o.status}</TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleEdit(o)
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDelete(o._id)
                          }
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

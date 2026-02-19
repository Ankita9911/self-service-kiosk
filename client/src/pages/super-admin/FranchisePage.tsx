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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function FranchisePage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Franchise | null>(null);

  const [form, setForm] = useState({
    name: "",
    brandCode: "",
    contactEmail: "",
    contactPhone: "",
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
      contactPhone: "",
    });
    setOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this franchise?")) return;
    await deleteFranchise(id);
    fetchData();
  }

  function handleEdit(franchise: Franchise) {
    setEditing(franchise);
    setForm({
      name: franchise.name,
      brandCode: franchise.brandCode,
      contactEmail: franchise.contactEmail || "",
      contactPhone: franchise.contactPhone || "",
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
              Franchise Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage all franchises
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>
                Create Franchise
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Franchise" : "Create Franchise"}
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 mt-4"
              >
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
                  <Label>Brand Code</Label>
                  <Input
                    value={form.brandCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        brandCode: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={form.contactEmail}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contactEmail: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={form.contactPhone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contactPhone: e.target.value,
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
                    <TableHead>Brand Code</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {franchises.map((f) => (
                    <TableRow key={f._id}>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>{f.brandCode}</TableCell>
                      <TableCell>
                        {f.contactEmail || "-"}
                      </TableCell>
                      <TableCell>{f.status}</TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleEdit(f)
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDelete(f._id)
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

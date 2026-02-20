import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";

import { createUser, getUsers } from "@/services/user.service";
import { getFranchises } from "@/services/franchise.service";
import { getOutlets } from "@/services/outlet.service";
import type { Franchise } from "@/types/franchise.types";
import type { Outlet } from "@/types/outlet.types";

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
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import { Users, Plus, Loader2 } from "lucide-react";

const OUTLET_SCOPED_ROLES = ["OUTLET_MANAGER", "KITCHEN_STAFF", "PICKUP_STAFF", "KIOSK_DEVICE"];

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UserPage() {
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermission();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const [open, setOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    franchiseId: "",
    outletId: "",
  });

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.USERS_CREATE)) return;
    (async () => {
      try {
        const [outletList, franchiseList] = await Promise.all([
          getOutlets(),
          currentUser?.role === "SUPER_ADMIN" ? getFranchises() : Promise.resolve([]),
        ]);
        setOutlets(outletList);
        setFranchises(franchiseList);
      } catch {
        // ignore
      }
    })();
  }, [currentUser?.role, hasPermission(PERMISSIONS.USERS_CREATE)]);

  const needsFranchise = currentUser?.role === "SUPER_ADMIN" && form.role && form.role !== "SUPER_ADMIN";
  const needsOutlet = form.role && OUTLET_SCOPED_ROLES.includes(form.role);
  const outletsForSelection = currentUser?.role === "SUPER_ADMIN" && form.franchiseId
    ? outlets.filter((o) => o.franchiseId === form.franchiseId)
    : outlets;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    const result = await createUser({
      name: form.name,
      email: form.email,
      role: form.role,
      ...(needsFranchise && form.franchiseId && { franchiseId: form.franchiseId }),
      ...(needsOutlet && form.outletId && { outletId: form.outletId }),
    });

    setGeneratedPassword(result.tempPassword);

    setForm({
      name: "",
      email: "",
      role: "",
      franchiseId: "",
      outletId: "",
    });

    setOpen(false);
    fetchUsers();
  }

  return (
    <div className="w-full min-h-screen bg-[#fafafa]">
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-orange-600" />

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-sm uppercase font-medium">
              <Users className="w-4 h-4" />
              Identity
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              User Management
            </h1>
          </div>

          {hasPermission(PERMISSIONS.USERS_CREATE) && (
            <Button
              onClick={() => setOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          )}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">
                        {u.name}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {u.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create User Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4">
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
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Role</Label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value, outletId: "" })
                  }
                  required
                >
                  <option value="">Select Role</option>

                  {currentUser?.role === "SUPER_ADMIN" && (
                    <option value="FRANCHISE_ADMIN">
                      Franchise Admin
                    </option>
                  )}

                  {currentUser?.role === "FRANCHISE_ADMIN" && (
                    <>
                      <option value="OUTLET_MANAGER">
                        Outlet Manager
                      </option>
                      <option value="KITCHEN_STAFF">
                        Kitchen Staff
                      </option>
                      <option value="PICKUP_STAFF">
                        Pickup Staff
                      </option>
                      <option value="KIOSK_DEVICE">
                        Kiosk Device
                      </option>
                    </>
                  )}

                  {currentUser?.role === "OUTLET_MANAGER" && (
                    <>
                      <option value="KITCHEN_STAFF">
                        Kitchen Staff
                      </option>
                      <option value="PICKUP_STAFF">
                        Pickup Staff
                      </option>
                    </>
                  )}
                </select>
              </div>

              {needsFranchise && (
                <div>
                  <Label>Franchise</Label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={form.franchiseId}
                    onChange={(e) =>
                      setForm({ ...form, franchiseId: e.target.value, outletId: "" })
                    }
                    required
                  >
                    <option value="">Select Franchise</option>
                    {franchises.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.brandCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {needsOutlet && (
                <div>
                  <Label>Outlet</Label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={form.outletId}
                    onChange={(e) =>
                      setForm({ ...form, outletId: e.target.value })
                    }
                    required={needsOutlet}
                  >
                    <option value="">Select Outlet</option>
                    {outletsForSelection.map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.name} ({o.outletCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Create User
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Temp Password Modal */}
        {generatedPassword && (
          <Dialog
            open={true}
            onOpenChange={() => setGeneratedPassword(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>User Created</DialogTitle>
              </DialogHeader>

              <p className="text-sm text-slate-600">
                Temporary Password:
              </p>

              <div className="bg-slate-100 p-3 rounded font-mono text-sm">
                {generatedPassword}
              </div>

              <Button
                onClick={() => setGeneratedPassword(null)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Close
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

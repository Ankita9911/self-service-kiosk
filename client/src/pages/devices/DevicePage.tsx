import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { getDevices, createDevice } from "@/services/device.service";
import { getOutlets } from "@/services/outlet.service";
import type { Device } from "@/types/device.types";
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
import { Activity, Plus, Loader2 } from "lucide-react";

export default function DevicePage() {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const canView = hasPermission(PERMISSIONS.DEVICE_VIEW);
  const canCreate = hasPermission(PERMISSIONS.DEVICE_CREATE);

  const [devices, setDevices] = useState<Device[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [form, setForm] = useState({ outletId: "", name: "" });

  async function fetchData() {
    if (!canView) return;
    setLoading(true);
    try {
      const [deviceList, outletList] = await Promise.all([
        getDevices(),
        canCreate ? getOutlets() : Promise.resolve([]),
      ]);
      setDevices(deviceList);
      setOutlets(outletList);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.outletId) return;
    const result = await createDevice({
      outletId: form.outletId,
      name: form.name || undefined,
    });
    setCreatedSecret(result.secret);
    setForm({ outletId: "", name: "" });
    setOpen(false);
    fetchData();
  }

  if (!canView) {
    return (
      <div className="p-8 text-slate-500">
        You do not have permission to view devices.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fafafa]">
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-orange-600" />
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-sm uppercase font-medium">
              <Activity className="w-4 h-4" />
              Kiosks
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Device Management
            </h1>
          </div>
          {canCreate && (
            <Button
              onClick={() => setOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Device
            </Button>
          )}
        </div>

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
                    <TableHead>Device ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((d) => (
                    <TableRow key={d._id}>
                      <TableCell className="font-mono text-sm">
                        {d.deviceId}
                      </TableCell>
                      <TableCell>{d.name || "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            d.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {d.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {d.lastSeenAt
                          ? new Date(d.lastSeenAt).toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Kiosk Device</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Outlet *</Label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={form.outletId}
                  onChange={(e) =>
                    setForm({ ...form, outletId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Outlet</option>
                  {outlets.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name} ({o.outletCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Name (optional)</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Main counter kiosk"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Create Device
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {createdSecret != null && (
          <Dialog open onOpenChange={() => setCreatedSecret(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Device created</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-600">
                Save this secret; it will not be shown again. Use it to log in
                the kiosk device.
              </p>
              <div className="bg-slate-100 p-3 rounded font-mono text-sm break-all">
                {createdSecret}
              </div>
              <Button
                onClick={() => setCreatedSecret(null)}
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

"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { screensApi, theatersApi } from "@/services/api";
import { Screen, Theater } from "@/types";
import { Plus, Pencil, Trash2, Monitor, Eye, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminScreensPage() {
  const router = useRouter();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [screensRes, theatersRes] = await Promise.all([
        screensApi.getAll(),
        theatersApi.getAll(),
      ]);
      
      if (screensRes.success) {
        setScreens(screensRes.data);
      }
      if (theatersRes.success) {
        setTheaters(theatersRes.data);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this screen? This will also delete all associated seats.")) {
      return;
    }

    try {
      const response = await screensApi.delete(id);
      if (response.success) {
        setScreens((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      alert("Failed to delete screen");
    }
  };

  const handleEdit = (screen: Screen) => {
    setEditingScreen(screen);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingScreen(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingScreen(null);
    loadData();
  };

  const getTheaterName = (theaterId: string) => {
    return theaters.find((t) => t.id === theaterId)?.name || "Unknown Theater";
  };

  const filteredScreens = selectedTheater
    ? screens.filter((s) => s.theaterId === selectedTheater)
    : screens;

  if (isLoading) return <DashboardLayout><LoadingState message="Loading screens..." /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadData} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Screens & Halls</h1>
            <p className="text-muted-foreground mt-1">Manage cinema screens and seat layouts.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleAddNew}>
                <Plus className="h-4 w-4" />
                Add Screen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingScreen ? "Edit Screen" : "Add New Screen"}
                </DialogTitle>
              </DialogHeader>
              <ScreenForm
                screen={editingScreen}
                theaters={theaters}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Theater Filter */}
        <div className="flex gap-2">
          <Button
            variant={selectedTheater === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTheater("")}
          >
            All Theaters
          </Button>
          {theaters.map((theater) => (
            <Button
              key={theater.id}
              variant={selectedTheater === theater.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTheater(theater.id)}
            >
              {theater.name}
            </Button>
          ))}
        </div>

        <div className="bg-card rounded-xl shadow-sm border">
          {filteredScreens.length === 0 ? (
            <EmptyState
              message="No screens found"
              action={{ label: "Add Screen", onClick: handleAddNew }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Screen Name</TableHead>
                  <TableHead>Theater</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Layout</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Sound</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScreens.map((screen) => (
                  <TableRow key={screen.id}>
                    <TableCell className="font-medium">{screen.name}</TableCell>
                    <TableCell>{getTheaterName(screen.theaterId)}</TableCell>
                    <TableCell>
                      <span className="capitalize px-2 py-1 bg-secondary rounded-full text-xs">
                        {screen.screenType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <LayoutGrid className="h-3 w-3" />
                        {screen.totalRows} x {screen.seatsPerRow}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {screen.totalSeats}
                      </div>
                    </TableCell>
                    <TableCell>{screen.soundSystem || "Standard"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/screens/${screen.id}/layout`)}
                          title="View Seat Layout"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(screen)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(screen.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ScreenForm({
  screen,
  theaters,
  onSuccess,
}: {
  screen: Screen | null;
  theaters: Theater[];
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const screenData = {
        name: formData.get("name") as string,
        theaterId: formData.get("theaterId") as string,
        screenType: formData.get("screenType") as Screen["screenType"],
        totalRows: Number(formData.get("totalRows")),
        seatsPerRow: Number(formData.get("seatsPerRow")),
        soundSystem: formData.get("soundSystem") as string,
      };

      if (screen) {
        await screensApi.update(screen.id, screenData);
      } else {
        await screensApi.create(screenData);
      }
      onSuccess();
    } catch {
      alert(screen ? "Failed to update screen" : "Failed to create screen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Screen Name</label>
        <input
          name="name"
          defaultValue={screen?.name || ""}
          required
          className="w-full p-2 border rounded-md"
          placeholder="e.g., Hall 1, IMAX 1"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Theater</label>
        <select
          name="theaterId"
          defaultValue={screen?.theaterId || ""}
          required
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Theater</option>
          {theaters.map((theater) => (
            <option key={theater.id} value={theater.id}>
              {theater.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Screen Type</label>
        <select
          name="screenType"
          defaultValue={screen?.screenType || "standard"}
          required
          className="w-full p-2 border rounded-md"
        >
          <option value="standard">Standard</option>
          <option value="imax">IMAX</option>
          <option value="3d">3D</option>
          <option value="4dx">4DX</option>
          <option value="vip">VIP</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Total Rows</label>
          <input
            name="totalRows"
            type="number"
            defaultValue={screen?.totalRows || 8}
            min={1}
            max={30}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Seats Per Row</label>
          <input
            name="seatsPerRow"
            type="number"
            defaultValue={screen?.seatsPerRow || 12}
            min={1}
            max={50}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sound System</label>
        <input
          name="soundSystem"
          defaultValue={screen?.soundSystem || ""}
          className="w-full p-2 border rounded-md"
          placeholder="e.g., Dolby Atmos, DTS:X"
        />
      </div>

      {!screen && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>Note:</strong> Seats will be automatically generated based on the layout (Total Rows x Seats Per Row).
          VIP seats will be placed in the last 2 rows.
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? screen
            ? "Updating..."
            : "Creating..."
          : screen
          ? "Update Screen"
          : "Create Screen"}
      </Button>
    </form>
  );
}
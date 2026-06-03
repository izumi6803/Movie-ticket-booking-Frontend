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
import { theatersApi } from "@/services/api";
import { Theater } from "@/types";
import { Plus, Pencil, Trash2, MapPin, Monitor } from "lucide-react";

export default function AdminTheatersPage() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTheater, setEditingTheater] = useState<Theater | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadTheaters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await theatersApi.getAll();
      if (response.success) {
        setTheaters(response.data);
      }
    } catch {
      setError("Failed to load theaters");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTheaters();
  }, [loadTheaters]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theater?")) return;

    try {
      await theatersApi.delete(id);
      setTheaters((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete theater");
    }
  };

  const handleEdit = (theater: Theater) => {
    setEditingTheater(theater);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTheater(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingTheater(null);
    loadTheaters();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Theaters</h1>
            <p className="text-muted-foreground mt-1">Manage cinema theaters and locations.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleAddNew}>
                <Plus className="h-4 w-4" />
                Add Theater
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTheater ? "Edit Theater" : "Add New Theater"}
                </DialogTitle>
              </DialogHeader>
              <TheaterForm
                theater={editingTheater}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-xl shadow-sm border">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={loadTheaters} />
          ) : theaters.length === 0 ? (
            <EmptyState
              message="No theaters found"
              action={{ label: "Add Theater", onClick: handleAddNew }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Screens</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {theaters.map((theater) => (
                  <TableRow key={theater.id}>
                    <TableCell className="font-medium">{theater.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {theater.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {theater.totalScreens} screens
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(theater)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(theater.id)}
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

function TheaterForm({
  theater,
  onSuccess,
}: {
  theater: Theater | null;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const theaterData = {
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        totalScreens: Number(formData.get("totalScreens")) || 1,
      };

      if (theater) {
        await theatersApi.update(theater.id, theaterData);
      } else {
        await theatersApi.create(theaterData);
      }
      onSuccess();
    } catch {
      alert(theater ? "Failed to update theater" : "Failed to create theater");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Theater Name</label>
        <input
          name="name"
          defaultValue={theater?.name || ""}
          required
          className="w-full p-2 border rounded-md"
          placeholder="e.g., CGV Aeon Tân Phú"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <input
          name="location"
          defaultValue={theater?.location || ""}
          required
          className="w-full p-2 border rounded-md"
          placeholder="e.g., 30 Bờ Bao Tân Thắng, Tân Phú, TP.HCM"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Total Screens</label>
        <input
          name="totalScreens"
          type="number"
          defaultValue={theater?.totalScreens || 1}
          min={1}
          required
          className="w-full p-2 border rounded-md"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? theater
            ? "Updating..."
            : "Creating..."
          : theater
          ? "Update Theater"
          : "Create Theater"}
      </Button>
    </form>
  );
}

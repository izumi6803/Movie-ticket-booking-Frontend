"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { settingsApi } from "@/services/api";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [retentionDays, setRetentionDays] = useState("7");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    settingsApi.getAll().then((res) => {
      if (res.success && res.data) {
        setRetentionDays(res.data.ticket_retention_days || "7");
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    const days = parseInt(retentionDays);
    if (isNaN(days) || days < 1) {
      setMessage({ type: "error", text: "Days must be a positive number" });
      return;
    }

    setSaving(true);
    setMessage(null);
    const res = await settingsApi.update("ticket_retention_days", String(days));
    setSaving(false);

    if (res.success) {
      setMessage({ type: "success", text: `Ticket retention set to ${days} days` });
    } else {
      setMessage({ type: "error", text: res.message || "Failed to save" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure cinema settings.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
            {message.text}
          </div>
        )}

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ticket Retention</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Automatically remove tickets from customer&apos;s &quot;My Tickets&quot; this many days after the showtime ends.
          </p>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="flex items-center gap-4 max-w-md">
              <Input
                type="number"
                min={1}
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                placeholder="Days"
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">days after showtime ends</span>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

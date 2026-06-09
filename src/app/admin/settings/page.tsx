import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function AdminSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure cinema settings.</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Cinema Configuration</h2>
          <p className="text-muted-foreground">Settings coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

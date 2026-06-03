import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function AdminSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure cinema settings.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cinema Configuration</h2>
          <p className="text-gray-500">Settings coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

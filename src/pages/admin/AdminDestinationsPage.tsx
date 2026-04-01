import { useState } from "react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { createId, STORAGE_KEYS } from "@/lib/storage";
import type { DestinationCategory, DestinationOptionRecord } from "@/lib/adminTypes";
import PaginationControls from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

const emptyItem = (): DestinationOptionRecord => ({
  id: createId("destination"),
  name: "",
  category: "travel",
  active: true,
  updatedAt: new Date().toISOString(),
});

const categoryOptions: Array<{ value: DestinationCategory; label: string }> = [
  { value: "travel", label: "General travel" },
  { value: "tour", label: "Tour packages" },
  { value: "visa", label: "Visa services" },
  { value: "study-abroad", label: "Study abroad" },
];

export default function AdminDestinationsPage() {
  const { workspace, loading, saveDestinationOption, deleteCollectionItem } = useAdminDashboard();
  const [form, setForm] = useState<DestinationOptionRecord>(emptyItem());
  const { runAction, isPending } = useAsyncAction();
  const destinationItems = workspace?.destinationOptions ?? [];
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(destinationItems, {
    pageParam: "destinationsPage",
    sizeParam: "destinationsPageSize",
    defaultPageSize: 8,
  });

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Enter a destination name.");
      return;
    }

    try {
      await runAction("save-destination", () => saveDestinationOption({ ...form, updatedAt: new Date().toISOString() }));
      toast.success("Destination saved successfully.");
      setForm(emptyItem());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save the destination.");
    }
  }

  async function handleDelete(destinationId: string) {
    try {
      await runAction(`delete-destination-${destinationId}`, () => deleteCollectionItem(STORAGE_KEYS.destinationOptions, destinationId));
      toast.success("Destination deleted successfully.");
      if (form.id === destinationId) {
        setForm(emptyItem());
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete the destination.");
    }
  }

  return (
    <AdminShell title="Destinations" subtitle="Manage the destination list used across client forms, travel enquiries, and admin content dropdowns.">
      {loading || !workspace ? (
        <DashboardLoadingState cards={2} lines={4} />
      ) : (
        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="card-theme p-6 space-y-4">
            <div>
              <label className="label-text mb-1 block">Destination name</label>
              <input
                className="field-theme"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Example: Canada or Cape Coast & Elmina"
              />
            </div>
            <div>
              <label className="label-text mb-1 block">Destination group</label>
              <select
                className="field-theme"
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as DestinationCategory }))}
              >
                {categoryOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="inline-flex items-center gap-2 body-sm text-muted-green">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
              />
              Show this destination in dropdowns
            </label>
            <button
              className="btn-accent"
              type="button"
              disabled={isPending("save-destination")}
              onClick={() => void handleSave()}
            >
              {isPending("save-destination") ? "Saving..." : "Save destination"}
            </button>
          </section>

          <section className="card-theme p-6 space-y-3">
            {paginatedItems.map((item) => (
              <div key={item.id} className="card-theme-soft p-4">
                <p className="body-sm">{item.name}</p>
                <p className="caption text-muted-green mt-1">
                  {item.category.replaceAll("-", " ")} | {item.active ? "active" : "hidden"}
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline-theme py-2 px-3 text-sm" type="button" onClick={() => setForm(item)}>
                    Edit
                  </button>
                  <button
                    className="btn-outline-theme py-2 px-3 text-sm"
                    type="button"
                    disabled={isPending(`delete-destination-${item.id}`)}
                    onClick={() => void handleDelete(item.id)}
                  >
                    {isPending(`delete-destination-${item.id}`) ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </section>
        </div>
      )}
    </AdminShell>
  );
}

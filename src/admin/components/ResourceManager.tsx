import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { adminFetch } from "../api";
import type { AdminResource } from "../resources";
import {
  type ContentType,
  clearCache,
  toggleStatus,
} from "@/lib/content-store";
import { emptyForm, formToPayload, rowToForm } from "../utils";
import { ResourceForm } from "./ResourceForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = Record<string, unknown> & { id: string };

const RESOURCE_TO_CONTENT: Partial<Record<string, ContentType>> = {
  articles: "article",
  topics: "topic",
  books: "book",
  podcasts: "podcast",
  about: "about",
};

export function ResourceManager({ resource }: { resource: AdminResource }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(() => emptyForm(resource.fields));

  const listQuery = useQuery({
    queryKey: ["admin", resource.endpoint],
    queryFn: () => adminFetch<Row[]>(`/${resource.endpoint}/admin`),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = formToPayload(form, resource.fields, !editing);
      if (editing) {
        return adminFetch<Row>(`/${resource.endpoint}/admin/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      return adminFetch<Row>(`/${resource.endpoint}/admin`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", resource.endpoint] });
      if (contentType) clearCache(contentType);
      setOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const contentType = RESOURCE_TO_CONTENT[resource.id];

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "draft" | "published" }) => {
      if (!contentType) {
        throw new Error("Publish toggle not available for this section");
      }
      await toggleStatus(contentType, id, status);
    },
    onSuccess: () => {
      toast.success("Status updated");
      clearCache(contentType);
      qc.invalidateQueries({ queryKey: ["admin", resource.endpoint] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/${resource.endpoint}/admin/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", resource.endpoint] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(resource.fields));
    setOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setForm(rowToForm(row, resource.fields));
    setOpen(true);
  };

  const rows = listQuery.data ?? [];
  const listKey = resource.listColumn;
  const itemName = resource.label.replace(/s$/, "") || resource.label;
  const publicationGuide = getPublicationGuide(resource.id);

  return (
    <div className="max-w-4xl">
      <Link to="/admin/" className="text-sm font-semibold text-[#6B7385] no-underline hover:text-[#E8522A]">
        ← Back
      </Link>

      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="admin-display text-2xl font-bold">{resource.label}</h1>
          <p className="mt-1 text-sm text-[#6B7385]">{resource.description}</p>
        </div>
        <button type="button" className="admin-btn-coral" onClick={openCreate}>
          + Add {itemName}
        </button>
      </div>

      {publicationGuide && (
        <div className="mb-6 rounded-lg border border-[rgba(10,15,30,0.1)] bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#E8522A]">
            Publishing Format Guide
          </p>
          <p className="text-sm text-[#0A0F1E]">{publicationGuide}</p>
        </div>
      )}

      <div className="admin-card overflow-hidden p-0">
        {listQuery.isLoading && <p className="p-6 text-sm text-[#6B7385]">Loading…</p>}
        {listQuery.isError && (
          <p className="p-6 text-sm text-red-600">{(listQuery.error as Error).message}</p>
        )}
        {!listQuery.isLoading && !listQuery.isError && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-[#6B7385]">
                    Nothing here yet. Click &quot;Add {itemName}&quot;.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => {
                const title = String(row[listKey] ?? row.title ?? row.name ?? row.id);
                const status = row.status as string | undefined;
                const active = row.is_active;
                const isPublished =
                  status === "published" || active === 1 || active === true;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-[240px] truncate font-medium">{title}</TableCell>
                    <TableCell>
                      <span className={isPublished ? "admin-badge-published" : "admin-badge-draft"}>
                        {isPublished ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {contentType && status && (
                        <button
                          type="button"
                          className="mr-3 text-sm font-semibold text-[#1B4D3E]"
                          disabled={toggleMutation.isPending}
                          onClick={() =>
                            toggleMutation.mutate({
                              id: row.id,
                              status: isPublished ? "draft" : "published",
                            })
                          }
                        >
                          {isPublished ? "Unpublish" : "Publish"}
                        </button>
                      )}
                      <button
                        type="button"
                        className="mr-3 text-sm font-semibold text-[#6B7385]"
                        onClick={() => openEdit(row)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-sm font-semibold text-[#E8522A]"
                        onClick={() => {
                          if (confirm(`Delete "${title}"?`)) {
                            deleteMutation.mutate(row.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[rgba(10,15,30,0.1)] bg-[#FAFAF8]">
          <DialogHeader>
            <DialogTitle className="admin-display text-xl">
              {editing ? "Edit" : "New"} {itemName}
            </DialogTitle>
          </DialogHeader>
          <ResourceForm
            fields={resource.fields}
            form={form}
            onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))}
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" className="admin-btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn-coral"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving…" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getPublicationGuide(resourceId: string): string | null {
  if (resourceId === "articles") {
    return "Use this order: Abstract, Introduction, Background, Analysis, Conclusion, References. Keep abstract short (120-180 words), and keep detailed legal analysis in Article text.";
  }
  if (resourceId === "books") {
    return "Book format: Start with `Table of Contents`, then numbered entries like `1. Chapter 1`. Use digits in headings: `Part 1`, `Chapter 1`, `Section 1`. Use `-` for points. Add references at the end.";
  }
  if (resourceId === "publications") {
    return "Add publication outlets (journal/blog/newspaper) exactly as they should appear in your credentials bar. Use official publication name and URL.";
  }
  return null;
}

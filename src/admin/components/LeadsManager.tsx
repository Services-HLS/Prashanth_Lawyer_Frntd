import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "../api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LeadRow = Record<string, unknown> & { id: string };

export function LeadsManager() {
  const newsletter = useQuery({
    queryKey: ["admin", "newsletter"],
    queryFn: () => adminFetch<LeadRow[]>("/forms/admin/newsletter"),
  });

  const contact = useQuery({
    queryKey: ["admin", "contact"],
    queryFn: () => adminFetch<LeadRow[]>("/forms/admin/contact"),
  });

  return (
    <div>
      <p className="admin-label mb-2">Inbox</p>
      <h1 className="admin-display mb-6 text-3xl font-bold">Newsletter & contact</h1>

      <Tabs defaultValue="contact" className="admin-card p-4">
        <TabsList>
          <TabsTrigger value="contact">Contact inquiries</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>
        <TabsContent value="contact" className="mt-4">
          <LeadTable
            loading={contact.isLoading}
            error={contact.error as Error | null}
            rows={contact.data ?? []}
            columns={["name", "email", "matter_type", "status", "created_at"]}
          />
        </TabsContent>
        <TabsContent value="newsletter" className="mt-4">
          <LeadTable
            loading={newsletter.isLoading}
            error={newsletter.error as Error | null}
            rows={newsletter.data ?? []}
            columns={["name", "email", "interest", "status", "subscribed_at"]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LeadTable({
  rows,
  columns,
  loading,
  error,
}: {
  rows: LeadRow[];
  columns: string[];
  loading: boolean;
  error: Error | null;
}) {
  if (loading) return <p className="text-sm text-[#6B7385]">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error.message}</p>;
  if (!rows.length) return <p className="text-sm text-[#6B7385]">No submissions yet.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHead key={c} className="capitalize">
              {c.replace(/_/g, " ")}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {columns.map((c) => (
              <TableCell key={c} className="max-w-[200px] truncate text-sm">
                {String(row[c] ?? "—")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

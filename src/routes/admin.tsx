import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getStoredAdminToken } from "@/admin/api";
import { AdminShell } from "@/admin/components/AdminShell";
import { Toaster } from "@/components/ui/sonner";
import "@/admin/admin-theme.css";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
  head: () => ({
    meta: [{ title: "Admin | Prasanth Raju" }],
  }),
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isPublicAdmin =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password";
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setReady(true);
    if (isPublicAdmin) return;
    const token = getStoredAdminToken();
    setAuthed(!!token);
    if (!token) {
      void navigate({ to: "/admin/login" });
    }
  }, [isPublicAdmin, navigate]);

  if (isPublicAdmin) {
    return (
      <div className="admin-root min-h-screen">
        <Outlet />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  if (!ready) {
    return <div className="admin-root min-h-screen bg-[#FAFAF8]" aria-busy="true" />;
  }

  if (!authed) {
    return null;
  }

  return (
    <AdminShell>
      <Outlet />
      <Toaster position="top-center" richColors />
    </AdminShell>
  );
}

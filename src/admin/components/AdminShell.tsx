import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { getAdvancedResources, getPrimaryResources } from "../resources";
import { clearAdminToken } from "../api";
import "../admin-theme.css";

const PRIMARY = getPrimaryResources();

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [moreOpen, setMoreOpen] = useState(pathname.startsWith("/admin/more"));

  const logout = () => {
    clearAdminToken();
    window.location.href = "/admin/login";
  };

  const isActive = (href: string) => pathname === href || pathname === `${href}/`;

  return (
    <div className="admin-root admin-layout flex min-h-screen">
      <aside className="admin-sidebar">
        <Link to="/admin/" className="mb-6 block px-2 no-underline">
          <div className="admin-display text-lg font-bold text-[#0A0F1E]">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#E8522A]" />
            Admin
          </div>
          <p className="mt-1 text-xs text-[#6B7385]">Simple content manager</p>
        </Link>

        <nav className="flex flex-col gap-0.5">
          <Link
            to="/admin/"
            className={`admin-nav-link ${isActive("/admin") ? "active" : ""}`}
          >
            Home
          </Link>

          {PRIMARY.map((resource) => (
            <Link
              key={resource.id}
              to="/admin/$resource"
              params={{ resource: resource.id }}
              className={`admin-nav-link ${pathname === `/admin/${resource.id}` ? "active" : ""}`}
            >
              {resource.label}
            </Link>
          ))}

          <Link
            to="/admin/leads"
            className={`admin-nav-link ${pathname === "/admin/leads" ? "active" : ""}`}
          >
            Messages
          </Link>

          <Link
            to="/admin/account"
            className={`admin-nav-link ${pathname === "/admin/account" ? "active" : ""}`}
          >
            Account
          </Link>

          <button
            type="button"
            className={`admin-nav-link w-full text-left ${moreOpen || pathname.startsWith("/admin/more") ? "text-[#0A0F1E] font-semibold" : ""}`}
            onClick={() => setMoreOpen((o) => !o)}
          >
            More site sections {moreOpen ? "▾" : "▸"}
          </button>

          {moreOpen && (
            <div className="ml-2 flex flex-col gap-0.5 border-l-2 border-[rgba(10,15,30,0.08)] pl-2">
              <Link
                to="/admin/more"
                className={`admin-nav-link text-xs ${pathname === "/admin/more" ? "active" : ""}`}
              >
                All sections
              </Link>
              {getAdvancedResources().map((r) => (
                <Link
                  key={r.id}
                  to="/admin/$resource"
                  params={{ resource: r.id }}
                  className={`admin-nav-link text-xs ${pathname === `/admin/${r.id}` ? "active" : ""}`}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="mt-8 border-t border-[rgba(10,15,30,0.1)] pt-4">
          <a href="/" className="admin-nav-link mb-1 w-full" target="_blank" rel="noreferrer">
            View website ↗
          </a>
          <button type="button" onClick={logout} className="admin-nav-link w-full text-left">
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}

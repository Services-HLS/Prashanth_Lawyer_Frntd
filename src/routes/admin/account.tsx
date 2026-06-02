import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { changeAdminPassword } from "@/admin/api";

export const Route = createFileRoute("/admin/account")({
  component: AdminAccountPage,
});

function AdminAccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirm) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await changeAdminPassword(currentPassword, newPassword);
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="admin-display mb-2 text-2xl font-bold">Account</h1>
      <p className="mb-6 text-sm text-[#6B7385]">Change your admin password while signed in.</p>
      <form onSubmit={submit} className="admin-card space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#6B7385]">
            Current password
          </label>
          <input
            type="password"
            className="admin-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#6B7385]">
            New password
          </label>
          <input
            type="password"
            className="admin-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#6B7385]">
            Confirm new password
          </label>
          <input
            type="password"
            className="admin-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-[#1B4D3E]">{success}</p>}
        <button type="submit" className="admin-btn-coral" disabled={loading}>
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

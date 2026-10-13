/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Archive,
  CheckCircle2,
  LoaderCircle,
  ShieldAlert,
  UserCheck,
  UserX,
} from "lucide-react";

import { z } from "zod";

import type {
  AdminUser,
} from "@/lib/server/admin-users";

type Operation =
  | "activate"
  | "deactivate"
  | "archive";

interface Props {
  user: AdminUser;
}

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

const operationLabels: Record<
  Operation,
  string
> = {
  activate: "Activate account",
  deactivate: "Deactivate account",
  archive: "Archive account",
};

export function UserStatusActions({
  user,
}: Props) {
  const router = useRouter();

  const [operation, setOperation] =
    useState<Operation | null>(null);

  const [reason, setReason] =
    useState("");

  const [pending, setPending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);

  // The backend also enforces this restriction.
  if (user.role === "ADMIN") {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert
            aria-hidden="true"
            className="size-5 text-slate-500"
          />

          <p className="text-sm font-semibold text-[#102D46]">
            Protected Admin account
          </p>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Admin accounts cannot be disabled
          or archived through this workspace.
        </p>
      </div>
    );
  }

  function chooseOperation(
    next: Operation,
  ) {
    setOperation(next);
    setReason("");
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!operation || pending) {
      return;
    }

    const cleanReason = reason.trim();

    if (
      cleanReason.length < 5 ||
      cleanReason.length > 500
    ) {
      setError(
        "Reason must contain 5–500 characters.",
      );
      return;
    }

    const confirmed = window.confirm(
      `${operationLabels[operation]} for ${user.email}?\n\nThis operation may revoke existing sessions.`,
    );

    if (!confirmed) {
      return;
    }

    setPending(true);
    setError(null);
    setNotice(null);

    try {
      const archive = operation === "archive";

      const path = archive
        ? `/api/backend/admin/users/${user.id}`
        : `/api/backend/admin/users/${user.id}/status`;

      const body = archive
        ? { reason: cleanReason }
        : {
            isActive: operation === "activate",
            reason: cleanReason,
          };

      const response = await fetch(path, {
        method: archive ? "DELETE" : "PATCH",

        credentials: "same-origin",
        cache: "no-store",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      });

      const payload: unknown =
        await response.json();

      const parsed =
        responseSchema.safeParse(payload);

      if (!parsed.success) {
        throw new Error(
          "Unexpected user management response.",
        );
      }

      if (!response.ok || !parsed.data.success) {
        throw new Error(
          parsed.data.message ??
            "User account operation failed.",
        );
      }

      if (archive) {
        // The archived user is no longer available
        // at the current details URL.
        router.replace("/admin/users");
        return;
      }

      setNotice(
        parsed.data.message ??
          "Account status updated.",
      );

      setOperation(null);
      setReason("");

      // Get the verified status from the server.
      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update the account.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
        <p className="text-sm font-semibold text-[#102D46]">
          Account administration
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Changes are recorded in the audit log.
          Deactivation revokes existing sessions.
        </p>
      </div>

      {/* Available operations */}
      <div className="flex flex-wrap gap-3">
        {user.isActive ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              chooseOperation("deactivate")
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-200 px-4 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
          >
            <UserX
              aria-hidden="true"
              className="size-4"
            />
            Deactivate
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              chooseOperation("activate")
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          >
            <UserCheck
              aria-hidden="true"
              className="size-4"
            />
            Activate
          </button>
        )}

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            chooseOperation("archive")
          }
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <Archive
            aria-hidden="true"
            className="size-4"
          />
          Archive
        </button>
      </div>

      {/* Reason form */}
      {operation && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 p-5"
        >
          <h3 className="text-sm font-semibold text-[#102D46]">
            {operationLabels[operation]}
          </h3>

          <p className="text-xs leading-6 text-slate-500">
            Enter the administrative reason
            for this change. It will be stored
            in the account audit history.
          </p>

          <div className="space-y-2">
            <label
              htmlFor="admin-action-reason"
              className="block text-sm font-semibold text-[#102D46]"
            >
              Reason
            </label>

            <textarea
              id="admin-action-reason"
              required
              minLength={5}
              maxLength={500}
              rows={3}
              value={reason}
              disabled={pending}
              onChange={(event) => {
                setReason(event.target.value);
                setError(null);
              }}
              placeholder="Explain the account change..."
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus-visible:border-[#00877B]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={
                pending ||
                reason.trim().length < 5
              }
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66] disabled:opacity-50"
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}

              {pending
                ? "Processing..."
                : "Confirm action"}
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setOperation(null);
                setReason("");
                setError(null);
              }}
              className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-medium text-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {notice}
        </p>
      )}
    </div>
  );
}

/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";


import {
  DeliveryTaskActions,
} from "@/component/courier/delivery-task-actions";

import {
  CheckCircle2,
  LoaderCircle,
  PackageCheck,
} from "lucide-react";

import { z } from "zod";

import type {
  CourierTask,
} from "@/lib/server/courier-tasks";

// ---------------------------------------------
// Types and response schema
// ---------------------------------------------

interface Props {
  task: Pick<
    CourierTask,
    "id" | "type" | "status"
  >;
}

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// ---------------------------------------------
// Component
// ---------------------------------------------

export function CourierTaskActions({
  task,
}: Props) {
  const router = useRouter();

  const [proof, setProof] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [notice, setNotice] =
    useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setNotice(null);
  }, [task.status]);

  // -------------------------------------------
  // Shared mutation request
  // -------------------------------------------

  async function submitAction(
    endpoint: string,
    body?: Record<string, string>,
  ) {
    if (pending || notice) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/backend/tasks/${task.id}/${endpoint}`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify(body ?? {}),
        },
      );

      const payload: unknown =
        await response.json();

      const parsed =
        responseSchema.safeParse(payload);

      if (!parsed.success) {
        throw new Error(
          "Unexpected response from the task API.",
        );
      }

      if (
        !response.ok ||
        !parsed.data.success
      ) {
        throw new Error(
          parsed.data.message ??
            "Task action could not be completed.",
        );
      }

      setNotice(
        parsed.data.message ??
          "Task updated successfully.",
      );

      setProof("");

      // Refresh the server-rendered task details.
      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update the task.",
      );
    } finally {
      setPending(false);
    }
  }

  // -------------------------------------------
  // Unsupported task types
  // -------------------------------------------


if (task.type === "DELIVERY") {
  return (
    <DeliveryTaskActions
      task={{
        id: task.id,
        status: task.status,
      }}
    />
  );
}

if (task.type !== "PICKUP") {
  return (
    <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
      No actions are available for this task type.
    </p>
  );
}


  // -------------------------------------------
  // Completed pickup
  // -------------------------------------------

  if (task.status === "COMPLETED") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2
          aria-hidden="true"
          className="mt-0.5 size-5 text-emerald-700"
        />

        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Pickup completed
          </p>

          <p className="mt-1 text-xs leading-6 text-emerald-700">
            The parcel collection has been
            recorded in the shipment journey.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------
  // Assigned / Accepted pickup
  // -------------------------------------------

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
        <p className="text-sm font-semibold text-[#102D46]">
          Complete your pickup
        </p>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          Accept the assigned task first.
          After physically collecting the parcel,
          submit your pickup confirmation.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 size-4"
          />
          {notice}
        </div>
      )}

      {task.status === "ASSIGNED" && (
        <button
          type="button"
          disabled={pending || Boolean(notice)}
          onClick={() =>
            void submitAction("accept")
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
              Accepting...
            </>
          ) : (
            <>
              <CheckCircle2
                aria-hidden="true"
                className="size-4"
              />
              Accept pickup task
            </>
          )}
        </button>
      )}

      {task.status === "ACCEPTED" && (
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const value = proof.trim();

            if (
              value.length < 3 ||
              value.length > 500
            ) {
              setError(
                "Pickup confirmation note must be 3–500 characters.",
              );
              return;
            }

            void submitAction("pickup", {
              proof: value,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label
              htmlFor="pickup-proof"
              className="block text-sm font-semibold text-[#102D46]"
            >
              Pickup confirmation note
            </label>

            <textarea
              id="pickup-proof"
              name="proof"
              required
              minLength={3}
              maxLength={500}
              rows={4}
              value={proof}
              disabled={pending || Boolean(notice)}
              onChange={(event) => {
                setProof(event.target.value);
                setError(null);
              }}
              placeholder="Describe the collected parcel and collection confirmation..."
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-teal-100 disabled:opacity-60"
            />

            <p className="text-xs text-slate-500">
              3–500 characters. This note is saved
              with the courier task.
            </p>
          </div>

          <button
            type="submit"
            disabled={
              pending ||
              Boolean(notice) ||
              proof.trim().length < 3
            }
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
                Confirming pickup...
              </>
            ) : (
              <>
                <PackageCheck
                  aria-hidden="true"
                  className="size-4"
                />
                Confirm parcel pickup
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

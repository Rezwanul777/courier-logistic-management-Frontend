/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */

"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  LoaderCircle,
  PackageCheck,
  Truck,
} from "lucide-react";

import { z } from "zod";

import type {
  CourierTask,
} from "@/lib/server/courier-tasks";

interface Props {
  task: Pick<
    CourierTask,
    "id" | "status"
  >;
}

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export function DeliveryTaskActions({
  task,
}: Props) {
  const router = useRouter();

  const [recipientName, setRecipientName] =
    useState("");

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

  async function submitAction(
    action: "start-delivery" | "deliver",
    body: Record<string, string> = {},
  ) {
    if (pending || notice) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/backend/tasks/${task.id}/${action}`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      const payload: unknown =
        await response.json();

      const result = responseSchema.safeParse(payload);

      if (!result.success) {
        throw new Error(
          "Unexpected delivery API response.",
        );
      }

      if (!response.ok || !result.data.success) {
        throw new Error(
          result.data.message ??
            "Unable to update delivery task.",
        );
      }

      setNotice(
        result.data.message ??
          "Delivery task updated successfully.",
      );

      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update delivery task.",
      );
    } finally {
      setPending(false);
    }
  }

  function handleDelivery(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = recipientName.trim();
    const confirmation = proof.trim();

    if (name.length < 3 || name.length > 100) {
      setError(
        "Recipient name must contain 3–100 characters.",
      );
      return;
    }

    if (
      confirmation.length < 3 ||
      confirmation.length > 500
    ) {
      setError(
        "Delivery proof must contain 3–500 characters.",
      );
      return;
    }

    if (
      !window.confirm(
        "Confirm that the parcel has been handed over to the recipient?",
      )
    ) {
      return;
    }

    void submitAction("deliver", {
      recipientName: name,
      proof: confirmation,
    });
  }

  if (task.status === "COMPLETED") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />

        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Delivery completed
          </p>

          <p className="mt-2 text-xs leading-6 text-emerald-700">
            The parcel delivery has been recorded
            in the shipment tracking history.
          </p>
        </div>
      </div>
    );
  }

  if (
    task.status !== "ASSIGNED" &&
    task.status !== "ACCEPTED"
  ) {
    return (
      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        No delivery action is available
        for this task status.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
        <div className="flex items-center gap-2">
          <Truck className="size-5 text-[#00877B]" />

          <h3 className="text-sm font-semibold text-[#102D46]">
            Complete delivery
          </h3>
        </div>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          Accept the delivery task first.
          After handing the parcel to the recipient,
          enter the recipient name and delivery proof.
        </p>
      </div>

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

      {task.status === "ASSIGNED" && (
        <button
          type="button"
          disabled={pending || Boolean(notice)}
          onClick={() =>
            void submitAction("start-delivery")
          }
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Accepting delivery...
            </>
          ) : (
            <>
              <Truck className="size-4" />
              Accept delivery task
            </>
          )}
        </button>
      )}

      {task.status === "ACCEPTED" && (
        <form
          onSubmit={handleDelivery}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="delivery-recipient"
              className="block text-sm font-semibold text-[#102D46]"
            >
              Recipient name
            </label>

            <input
              id="delivery-recipient"
              type="text"
              required
              minLength={3}
              maxLength={100}
              autoComplete="off"
              value={recipientName}
              disabled={pending || Boolean(notice)}
              onChange={(event) => {
                setRecipientName(event.target.value);
                setError(null);
              }}
              placeholder="Name of person receiving the parcel"
              className="h-12 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none focus-visible:border-[#00877B] disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="delivery-proof"
              className="block text-sm font-semibold text-[#102D46]"
            >
              Proof of delivery
            </label>

            <textarea
              id="delivery-proof"
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
              placeholder="Describe the handover confirmation..."
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus-visible:border-[#00877B] disabled:opacity-50"
            />

            <p className="text-xs text-slate-500">
              Enter a confirmation note (3–500 characters).
            </p>
          </div>

          <button
            type="submit"
            disabled={
              pending ||
              Boolean(notice) ||
              recipientName.trim().length < 3 ||
              proof.trim().length < 3
            }
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Confirming delivery...
              </>
            ) : (
              <>
                <PackageCheck className="size-4" />
                Confirm parcel delivery
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

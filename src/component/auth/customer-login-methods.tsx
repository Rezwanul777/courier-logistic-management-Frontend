/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Script from "next/script";

import { useQuery, useQueryClient } from
  "@tanstack/react-query";

import { z } from "zod";
import { toast } from "sonner";

import {
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/api-errors";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

const methodsSchema = z.object({
  hasPassword: z.boolean(),
  hasGoogle: z.boolean(),
});

type LoginMethods = z.infer<
  typeof methodsSchema
>;

const queryKey = [
  "customer",
  "login-methods",
] as const;

function MethodStatus({
  enabled,
}: {
  enabled: boolean;
}) {
  return (
    <span
      className={
        enabled
          ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
          : "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
      }
    >
      {enabled ? "Enabled" : "Not enabled"}
    </span>
  );
}

export function CustomerLoginMethods() {
  const queryClient = useQueryClient();

  const buttonRef = useRef<HTMLDivElement>(null);

  const passwordRef = useRef("");
  const confirmRef = useRef("");
  const pendingRef = useRef(false);

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] =
    useState("");

  const [googleReady, setGoogleReady] =
    useState(false);

  const [pending, setPending] =
    useState(false);

  const methodsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiRequest(
        "/auth/login-methods",
        methodsSchema,
      );

      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const methods: LoginMethods | undefined =
    methodsQuery.data;

  const needsPassword =
    Boolean(methods?.hasGoogle) &&
    !methods?.hasPassword;

  const needsGoogle =
    Boolean(methods?.hasPassword) &&
    !methods?.hasGoogle;

  const bothEnabled =
    Boolean(methods?.hasPassword) &&
    Boolean(methods?.hasGoogle);

  const handleCredential = useCallback(
    async (response: {
      credential?: string;
    }) => {
      if (pendingRef.current || !methods) {
        return;
      }

      const idToken = response.credential;

      if (!idToken) {
        toast.error(
          "Google did not return a credential.",
        );
        return;
      }

      const enteredPassword =
        passwordRef.current;

      if (!enteredPassword) {
        toast.error(
          methods.hasGoogle
            ? "Enter a new password first."
            : "Enter your current password first.",
        );
        return;
      }

      const isSettingPassword =
        methods.hasGoogle &&
        !methods.hasPassword;

      const isLinkingGoogle =
        methods.hasPassword &&
        !methods.hasGoogle;

      if (!isSettingPassword && !isLinkingGoogle) {
        return;
      }

      if (isSettingPassword) {
        const hasRequiredCharacters =
          enteredPassword.length >= 6 &&
          /[a-z]/.test(enteredPassword) &&
          /[A-Z]/.test(enteredPassword) &&
          /[0-9]/.test(enteredPassword) &&
          /[^A-Za-z0-9]/.test(
            enteredPassword,
          ) &&
          new TextEncoder()
            .encode(enteredPassword)
            .length <= 72;

        if (!hasRequiredCharacters) {
          toast.error(
            "Choose a stronger password.",
            {
              description:
                "Use uppercase, lowercase, number and special character.",
            },
          );
          return;
        }

        if (
          enteredPassword !==
          confirmRef.current
        ) {
          toast.error(
            "Passwords do not match.",
          );
          return;
        }
      }

      pendingRef.current = true;
      setPending(true);

      try {
        await apiRequest(
          isSettingPassword
            ? "/auth/set-password"
            : "/auth/link-google",
          z.null(),
          {
            method: "POST",
            body: isSettingPassword
              ? {
                  idToken,
                  newPassword:
                    enteredPassword,
                }
              : {
                  idToken,
                  password:
                    enteredPassword,
                },
          },
        );

        passwordRef.current = "";
        confirmRef.current = "";
        setPassword("");
        setConfirmation("");

        await queryClient.invalidateQueries({
          queryKey,
        });

        toast.success(
          isSettingPassword
            ? "Password login enabled!"
            : "Google login enabled!",
          {
            description:
              "You can now use both sign-in methods with the same Customer account.",
            duration: 5000,
          },
        );
      } catch (error: unknown) {
        toast.error(
          "Unable to update login methods",
          {
            description:
              getErrorMessage(error),
            duration: 5500,
          },
        );
      } finally {
        pendingRef.current = false;
        setPending(false);
      }
    },
    [methods, queryClient],
  );

  useEffect(() => {
    if (
      !googleReady ||
      !GOOGLE_CLIENT_ID ||
      !methods ||
      bothEnabled ||
      !buttonRef.current
    ) {
      return;
    }

    const google = window.google;

    if (!google?.accounts?.id) {
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        void handleCredential(response);
      },
      auto_select: false,
    });

    buttonRef.current.replaceChildren();

    google.accounts.id.renderButton(
      buttonRef.current,
      {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 280,
      },
    );
  }, [
    googleReady,
    methods,
    bothEnabled,
    handleCredential,
  ]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <ShieldCheck
          className="size-5 text-[#00877B]"
          aria-hidden="true"
        />

        <h2 className="text-lg font-bold text-[#102D46]">
          Sign-in methods
        </h2>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        Manage how you securely sign in to
        your CourierFlow Customer account.
      </p>

      {methodsQuery.isPending && (
        <p className="mt-6 text-sm text-slate-500">
          Checking available login methods...
        </p>
      )}

      {methodsQuery.isError && (
        <div
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          Unable to retrieve account settings.
        </div>
      )}

      {methods && (
        <>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-[#00877B]" />

                <span className="text-sm font-medium">
                  Email & Password
                </span>
              </div>

              <MethodStatus
                enabled={methods.hasPassword}
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
              <span className="text-sm font-medium">
                Google Account
              </span>

              <MethodStatus
                enabled={methods.hasGoogle}
              />
            </div>
          </div>

          {bothEnabled && (
            <div className="mt-6 flex items-start gap-3 rounded-lg bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 size-5 text-emerald-700" />

              <p className="text-sm leading-6 text-emerald-800">
                Both login methods are enabled.
                You can sign in using your password
                or Google with the same account.
              </p>
            </div>
          )}

          {(needsPassword || needsGoogle) && (
            <div className="mt-7 space-y-5 border-t border-slate-100 pt-6">
              <div>
                <h3 className="text-base font-semibold text-[#102D46]">
                  {needsPassword
                    ? "Enable password login"
                    : "Link your Google account"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {needsPassword
                    ? "Create a password and verify your identity using your existing Google account."
                    : "Enter your current password and verify the matching Google account."}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="method-password"
                  className="text-sm font-semibold text-[#102D46]"
                >
                  {needsPassword
                    ? "New password"
                    : "Current password"}
                </label>

                <input
                  id="method-password"
                  type="password"
                  autoComplete={
                    needsPassword
                      ? "new-password"
                      : "current-password"
                  }
                  value={password}
                  disabled={pending}
                  onChange={(event) => {
                    const value = event.target.value;
                    passwordRef.current = value;
                    setPassword(value);
                  }}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus-visible:border-[#00877B]"
                  placeholder={
                    needsPassword
                      ? "Create a secure password"
                      : "Enter your current password"
                  }
                />
              </div>

              {needsPassword && (
                <div className="space-y-2">
                  <label
                    htmlFor="method-confirm"
                    className="text-sm font-semibold text-[#102D46]"
                  >
                    Confirm new password
                  </label>

                  <input
                    id="method-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirmation}
                    disabled={pending}
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      confirmRef.current = value;
                      setConfirmation(value);
                    }}
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus-visible:border-[#00877B]"
                    placeholder="Enter password again"
                  />

                  <p className="text-xs leading-5 text-slate-500">
                    At least 6 characters,
                    including uppercase, lowercase,
                    a number and a special character.
                  </p>
                </div>
              )}

              {GOOGLE_CLIENT_ID ? (
                <>
                  <Script
                    src="https://accounts.google.com/gsi/client"
                    strategy="afterInteractive"
                    onReady={() =>
                      setGoogleReady(true)
                    }
                    onError={() =>
                      toast.error(
                        "Google verification could not load.",
                      )
                    }
                  />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#102D46]">
                      Verify with Google to continue
                    </p>

                    <div
                      ref={buttonRef}
                      aria-busy={pending}
                      className={
                        pending
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-amber-700">
                  Google Client ID is not configured.
                </p>
              )}

              {pending && (
                <p
                  role="status"
                  className="text-sm text-[#00877B]"
                >
                  Updating your account securely...
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

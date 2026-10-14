/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <explanation> */
/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */


"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";

import Script from "next/script";

import {
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import {
  LoaderCircle,
} from "lucide-react";

import {
  getErrorMessage,
} from "@/lib/api-errors";

import {
  loginWithGoogle,
} from "@/lib/auth-api";

// ---------------------------------------------
// Types
// ---------------------------------------------

type GoogleAuthMode =
  | "login"
  | "register";

interface Props {
  mode: GoogleAuthMode;
}

interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GoogleIdentityService {
  initialize(options: {
    client_id: string;
    callback: (
      response: GoogleCredentialResponse,
    ) => void;
    auto_select?: boolean;
  }): void;

  renderButton(
    element: HTMLElement,
    options: {
      theme: "outline";
      size: "large";
      text: "continue_with";
      shape: "rectangular";
      width: number;
    },
  ): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentityService;
      };
    };
  }
}

// ---------------------------------------------
// Configuration
// ---------------------------------------------

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

const AUTH_NOTICE_KEY =
  "courierflow:post-auth-toast";

// ---------------------------------------------
// Component
// ---------------------------------------------

export function GoogleSignIn({
  mode,
}: Props) {
  const queryClient = useQueryClient();

  const buttonRef =
    useRef<HTMLDivElement>(null);

  const inFlightRef =
    useRef(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isReady, setIsReady] =
    useState(false);

  // -------------------------------------------
  // Success redirect
  // -------------------------------------------

  const completeAuthentication =
    useCallback(() => {
      try {
        // Only a toast identifier is saved.
        // Access and refresh tokens remain
        // in HttpOnly cookies.
        window.sessionStorage.setItem(
          AUTH_NOTICE_KEY,
          mode === "register"
            ? "google-register"
            : "google-login",
        );

        window.location.assign("/customer");
      } catch {
        // Fallback for browsers where
        // sessionStorage is unavailable.
        toast.success(
          "Google authentication successful!",
          {
            description:
              "Opening your customer dashboard...",
          },
        );

        window.setTimeout(() => {
          window.location.assign("/customer");
        }, 900);
      }
    }, [mode]);

  // -------------------------------------------
  // Google credential handler
  // -------------------------------------------

  const handleGoogleCredential =
    useCallback(
      async (
        response: GoogleCredentialResponse,
      ) => {
        if (inFlightRef.current) {
          return;
        }

        const idToken =
          response.credential;

        if (!idToken) {
          toast.error(
            "Google Sign-In failed",
            {
              description:
                "Google did not return a valid credential. Please try again.",
            },
          );
          return;
        }

        inFlightRef.current = true;
        setIsLoading(true);

        try {
          // Existing CourierFlow API.
          // Backend verifies the token.
          const user =
            await loginWithGoogle(idToken);

          // Defense in depth.
          // Backend must enforce CUSTOMER.
          if (user.role !== "CUSTOMER") {
            throw new Error(
              "Google Sign-In is available only for customers.",
            );
          }

          // Remove cached private data
          // from a previous account.
          await queryClient.cancelQueries();
          queryClient.clear();

          // Redirect with persistent
          // post-login toast.
          completeAuthentication();
        } catch (error: unknown) {
          const message =
            error instanceof Error &&
            error.name !== "ApiError"
              ? error.message
              : getErrorMessage(error);

          toast.error(
            "Google authentication failed",
            {
              description: message,
              duration: 5500,
            },
          );

          inFlightRef.current = false;
          setIsLoading(false);
        }
      },
      [queryClient, completeAuthentication],
    );

  // -------------------------------------------
  // Initialize Google Identity Services
  // -------------------------------------------

  const initializeGoogle =
    useCallback(() => {
      const google = window.google;

      if (
        !GOOGLE_CLIENT_ID ||
        !google?.accounts?.id ||
        !buttonRef.current
      ) {
        toast.error(
          "Google Sign-In unavailable",
          {
            description:
              "Google could not be initialized. Please check the OAuth configuration.",
          },
        );
        return;
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,

        callback: (response) => {
          void handleGoogleCredential(
            response,
          );
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
          width: 300,
        },
      );

      setIsReady(true);
    }, [handleGoogleCredential]);

  // -------------------------------------------
  // Render
  // -------------------------------------------

  return (
    <div className="space-y-4">
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={initializeGoogle}
          onError={() => {
            toast.error(
              "Unable to load Google Sign-In",
              {
                description:
                  "Check your internet connection or browser privacy settings.",
              },
            );
          }}
        />
      )}

      <div className="flex justify-center">
        <div
          ref={buttonRef}
          aria-label="Continue with Google"
          aria-busy={isLoading}
          className={
            isLoading
              ? "pointer-events-none opacity-50"
              : ""
          }
        />
      </div>

      {isLoading && (
        <p
          role="status"
          className="flex items-center justify-center gap-2 text-sm text-[#00877B]"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin"
          />
          Signing in securely...
        </p>
      )}

      {!GOOGLE_CLIENT_ID && (
        <p
          role="alert"
          className="text-center text-sm text-amber-700"
        >
          Google Client ID is not configured.
        </p>
      )}

      {GOOGLE_CLIENT_ID &&
        !isLoading &&
        !isReady && (
          <p className="text-center text-xs text-slate-500">
            Loading Google Sign-In...
          </p>
        )}
    </div>
  );
}

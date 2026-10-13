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

import {
  LoaderCircle,
} from "lucide-react";

import {
  ApiError,
  getErrorMessage,
} from "@/lib/api-errors";

import {
  loginWithGoogle,
} from "@/lib/auth-api";

import {
  queryKeys,
} from "@/lib/query-keys";

// ---------------------------------------------
// Google Identity Services types
// ---------------------------------------------

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

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// ---------------------------------------------
// Customer Google Sign-In
// ---------------------------------------------

export function GoogleSignIn() {
  const queryClient = useQueryClient();

  const buttonRef =
    useRef<HTMLDivElement>(null);

  // Prevent duplicate requests when Google
  // invokes the callback more than once.
  const inFlightRef = useRef(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isReady, setIsReady] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // -------------------------------------------
  // Authenticate using Google ID token
  // -------------------------------------------

  const handleGoogleCredential = useCallback(
    async (
      response: GoogleCredentialResponse,
    ) => {
      if (inFlightRef.current) {
        return;
      }

      const idToken = response.credential;

      if (!idToken) {
        setError(
          "Google did not return a sign-in credential.",
        );
        return;
      }

      inFlightRef.current = true;

      setIsLoading(true);
      setError(null);

      try {
        // Express verifies Google's signed token.
        const user = await loginWithGoogle(
          idToken,
        );

        // Client-side defense in depth.
        // The backend must also enforce this.
        if (user.role !== "CUSTOMER") {
          throw new Error(
            "Google Sign-In is only available for customers.",
          );
        }

        // Clear any previous account's cached
        // private React Query data.
        await queryClient.cancelQueries();

        queryClient.clear();

        queryClient.setQueryData(
          queryKeys.session,
          user,
        );

        // Full-page redirect ensures Next.js
        // Server Components read the new
        // authentication cookies.
        window.location.replace("/customer");
      } catch (cause: unknown) {
        const message =
          cause instanceof ApiError
            ? getErrorMessage(cause)
            : cause instanceof Error
              ? cause.message
              : "Google Sign-In failed. Please try again.";

        setError(message);

        inFlightRef.current = false;
        setIsLoading(false);
      }
    },
    [queryClient],
  );

  // -------------------------------------------
  // Initialize Google Identity Services
  // -------------------------------------------

  const initializeGoogle = useCallback(() => {
    const google = window.google;

    if (
      !GOOGLE_CLIENT_ID ||
      !google?.accounts?.id ||
      !buttonRef.current
    ) {
      setError(
        "Google Sign-In could not be initialized.",
      );
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,

      callback: (response) => {
        void handleGoogleCredential(response);
      },

      auto_select: false,
    });

    // Prevent duplicate buttons after
    // React re-renders or script readiness events.
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
    setError(null);
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
            setError(
              "Unable to load Google Sign-In. Check your connection and browser settings.",
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

          Verifying Google account...
        </p>
      )}

      {!GOOGLE_CLIENT_ID && (
        <p
          role="alert"
          className="text-center text-sm text-amber-700"
        >
          Google Sign-In is not configured.
        </p>
      )}

      {GOOGLE_CLIENT_ID &&
        !isReady &&
        !isLoading &&
        !error && (
          <p className="text-center text-xs text-slate-500">
            Loading Google Sign-In...
          </p>
        )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}


"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const NOTICE_KEY =
  "courierflow:post-auth-toast";

export function AuthSuccessToast() {
  useEffect(() => {
    // Store only a notification identifier,
    // never an authentication token.
    const notice =
      window.sessionStorage.getItem(
        NOTICE_KEY,
      );

    if (!notice) {
      return;
    }

    window.sessionStorage.removeItem(
      NOTICE_KEY,
    );

    // Only show customer authentication
    // notifications on the customer dashboard.
    if (
      window.location.pathname !== "/customer"
    ) {
      return;
    }

    if (notice === "google-login") {
      toast.success("Welcome back!", {
        description:
          "You have successfully signed in with Google.",
        duration: 4500,
      });
    }

    if (notice === "google-register") {
      toast.success(
        "Your customer workspace is ready!",
        {
          description:
            "Google authentication completed successfully.",
          duration: 4500,
        },
      );
    }
  }, []);

  return null;
}

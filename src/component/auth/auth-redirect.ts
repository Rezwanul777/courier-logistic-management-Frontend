
import type { SessionUser } from "@/lib/auth-schema";

export function getPostLoginPath(
  role: SessionUser["role"],
): string {
  switch (role) {
    case "CUSTOMER":
      return "/customer";

    case "ADMIN":
      // Update when Admin dashboard is ready.
      return "/account";

    case "COURIER":
      // Update when Courier dashboard is ready.
      return "/account";
  }
}

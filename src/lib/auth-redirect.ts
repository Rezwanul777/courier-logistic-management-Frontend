

import type { SessionUser } from "@/lib/auth-schema";

export function getPostLoginPath(
  role: SessionUser["role"],
): string {
  switch (role) {
    case "CUSTOMER":
      return "/customer";

    case "ADMIN":
      return "/admin";

    case "COURIER":
      return "/courier";

    default:
      return "/login";
  }
}

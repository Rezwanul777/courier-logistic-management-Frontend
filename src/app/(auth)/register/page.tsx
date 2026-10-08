import { Truck } from "lucide-react";
import type { Metadata } from "next";
import { RegistrationFlow } from "@/component/auth/registration-flow";
import { AuthShell } from "@/component/auth/auth-shell";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
   <AuthShell>
      <RegistrationFlow />
    </AuthShell>
  );
}

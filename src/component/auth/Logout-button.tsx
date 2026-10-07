"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth-api";

export function LogoutButton() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();

      window.location.replace("/login");
    },
  });

  return (
    <Button
      variant="outline"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <LogOut data-icon="inline-start" />
      {mutation.isPending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

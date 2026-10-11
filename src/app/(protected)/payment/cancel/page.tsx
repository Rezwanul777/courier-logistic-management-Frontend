import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-server";
import { PaymentReturn } from "@/app/(protected)/payment/payment-return";

export const metadata: Metadata = {
  title: "Checkout Canceled",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    shipmentId?: string | string[];
  }>;
}

export default async function PaymentCancelPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "CUSTOMER") {
    redirect("/account");
  }

  const { shipmentId: rawId } = await searchParams;

  if (typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId)) {
    redirect("/customer/shipments");
  }

  const shipmentId = Number(rawId);

  if (!Number.isSafeInteger(shipmentId)) {
    redirect("/customer/shipments");
  }

  return <PaymentReturn shipmentId={shipmentId} mode="cancel" />;
}

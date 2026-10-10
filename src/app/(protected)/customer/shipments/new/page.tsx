
import type { Metadata } from "next";

import { CreateShipmentWizard } from "@/component/customer/create-shipment-wizard";

import { getShipmentHubs } from "@/lib/server/shipment-hubs";

export const metadata: Metadata = {
  title: "Create Shipment",
  description:
    "Create a CourierFlow shipment using a guided booking process.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CreateShipmentPage() {
  const hubs = await getShipmentHubs();

  return <CreateShipmentWizard hubs={hubs} />;
}


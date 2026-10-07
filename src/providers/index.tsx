

import { Toaster } from "@/components/ui/toast";
import QueryProvider from "./query.provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return  <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
}

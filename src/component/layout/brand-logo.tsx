
import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  variant?: "light" | "dark";
  compact?: boolean;
  className?: string;
}

export function BrandLogo({
  variant = "light",
  compact = false,
  className = "",
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="CourierFlow home"
      className={[
        "inline-flex shrink-0 items-center",
        "transition-opacity hover:opacity-85",
        "focus-visible:outline-2",
        "focus-visible:outline-offset-4",
        "focus-visible:outline-[#00877B]",
        variant === "dark"
          ? "rounded-lg bg-white px-2 py-1"
          : "",
        className,
      ].join(" ")}
    >
      <Image
        src="/courierflow_speed_delivery_logo.png"
        alt="CourierFlow"
        width={600}
        height={200}
        priority
        className={
          compact
            ? "h-auto w-40"
            : "h-auto w-48"
        }
      />
    </Link>
  );
}

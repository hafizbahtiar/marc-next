import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export function BackLink({
  href,
  children = "Kembali",
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeftIcon className="size-4" />
      {children}
    </Link>
  );
}

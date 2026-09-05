import Link from "next/link";

import { BackLink } from "@/components/ui/back-link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function PageBreadcrumb({
  items,
  current,
}: {
  items: Array<{ href: string; label: string }>;
  current: string;
}) {
  return (
    <div className="grid gap-2">
      <BackLink href={items[items.length - 1]?.href ?? "/"}>Kembali</BackLink>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item) => (
            <BreadcrumbItem key={item.href}>
              <BreadcrumbLink asChild><Link href={item.href}>{item.label}</Link></BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
          ))}
          <BreadcrumbItem><BreadcrumbPage>{current}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

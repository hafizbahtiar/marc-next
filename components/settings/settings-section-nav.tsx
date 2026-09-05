"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type SectionItem = {
  id: string;
  label: string;
};

export function SettingsSectionNav({ items }: { items: SectionItem[] }) {
  const [activeId, setActiveId] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      if (items.some((item) => item.id === hash)) return hash;
    }
    return items[0]?.id ?? "";
  });

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -65% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  function handleNavigate(id: string) {
    setActiveId(id);
  }

  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 pb-1 lg:sticky lg:top-24 lg:grid lg:overflow-visible"
      aria-label="Bahagian tetapan"
    >
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => handleNavigate(item.id)}
            aria-current={active ? "location" : undefined}
            className={cn(
              "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity",
              "hover:bg-muted hover:text-foreground lg:pl-4",
              active && "bg-primary/10 font-medium text-primary before:opacity-100",
            )}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

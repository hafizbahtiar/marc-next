"use client";

import * as React from "react";
import { CalendarDaysIcon, Clock3Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "Pilih tarikh dan masa",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const parsed = parseLocalDateTime(value);
  const time = value.split("T")[1] ?? "";

  function selectDate(date: Date | undefined) {
    if (!date) return;
    onChange(formatLocalDateTime(date, time || "09:00"));
  }

  function selectTime(nextTime: string) {
    const date = parsed ?? new Date();
    onChange(formatLocalDateTime(date, nextTime));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
          aria-label={value ? `Tarikh dan masa: ${formatDisplay(value)}` : placeholder}
        >
          <CalendarDaysIcon className="text-muted-foreground" />
          <span className={value ? undefined : "text-muted-foreground"}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar mode="single" selected={parsed ?? undefined} onSelect={selectDate} />
        <div className="grid gap-2 border-t p-3">
          <label htmlFor={`${id}-time`} className="flex items-center gap-2 text-sm font-medium">
            <Clock3Icon className="size-4 text-muted-foreground" />
            Masa
          </label>
          <Input
            id={`${id}-time`}
            type="time"
            value={time}
            onChange={(event) => selectTime(event.target.value)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function parseLocalDateTime(value: string): Date | null {
  if (!value) return null;
  const [datePart, timePart = "00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  if (![year, month, day, hours, minutes].every(Number.isFinite)) return null;
  const date = new Date(year, month - 1, day, hours, minutes);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatLocalDateTime(date: Date, time: string): string {
  const [hours = "00", minutes = "00"] = time.split(":");
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${hours}:${minutes}`;
}

function formatDisplay(value: string): string {
  const date = parseLocalDateTime(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

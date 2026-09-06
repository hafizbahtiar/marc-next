"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";

type MaskedInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "defaultValue" | "onChange" | "value"
> & {
  value: string;
  formatValue: (value: string) => string;
  onValueChange: (value: string) => void;
};

/**
 * Input terkawal untuk format yang berubah semasa menaip.
 *
 * Pemformatan sengaja diterima sebagai prop supaya komponen ini boleh
 * dikongsi oleh topeng tetap dan format yang mempunyai pengecualian legacy.
 */
export function MaskedInput({
  value,
  formatValue,
  onValueChange,
  ...props
}: MaskedInputProps) {
  return (
    <Input
      {...props}
      value={value}
      onChange={(event) => onValueChange(formatValue(event.target.value))}
    />
  );
}

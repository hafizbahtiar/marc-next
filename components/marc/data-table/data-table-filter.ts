export function nextFilterValue(
  current: string[],
  value: string,
  checked: boolean,
  multiple: boolean,
): string | string[] | undefined {
  if (!multiple) return checked ? value : undefined;

  const next = new Set(current);
  if (checked) next.add(value);
  else next.delete(value);
  return next.size > 0 ? Array.from(next) : undefined;
}

const LEGACY_MEMBER_ID = /^MARC\d{4}\/\d{2}\/\d+$/i;
const NEW_MEMBER_ID_MASK = "MARC-****/####-****";
const SLOT_FILTERS: Record<string, RegExp> = {
  "#": /[0-9]/,
  "*": /[A-Za-z0-9]/,
};

export function isLegacyMemberId(value: string): boolean {
  return LEGACY_MEMBER_ID.test(value.trim());
}

export function unmaskMemberId(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (isLegacyMemberId(normalized)) return normalized;

  const input = normalized.replace(/^MARC-?/, "").replace(/[^A-Z0-9]/g, "");
  let slotIndex = 0;
  let result = "";
  for (const character of input) {
    const maskPosition = nextSlotPosition(NEW_MEMBER_ID_MASK, slotIndex);
    if (maskPosition < 0) break;
    const maskCharacter = NEW_MEMBER_ID_MASK[maskPosition];
    if (SLOT_FILTERS[maskCharacter]?.test(character)) {
      result += character;
      slotIndex = maskPosition + 1;
    }
  }
  return result;
}

export function formatMemberIdInput(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (isLegacyMemberId(normalized)) return normalized;

  const slots = unmaskMemberId(normalized);
  if (!slots) return "";

  let slotIndex = 0;
  let result = "";
  for (const maskCharacter of NEW_MEMBER_ID_MASK) {
    if (SLOT_FILTERS[maskCharacter]) {
      const character = slots[slotIndex++];
      if (!character) break;
      result += character;
    } else if (slotIndex > 0) {
      result += maskCharacter;
    } else if (maskCharacter === "M") {
      result += "MARC-";
    }
  }
  return result;
}

function nextSlotPosition(mask: string, position: number): number {
  for (let index = position; index < mask.length; index += 1) {
    if (SLOT_FILTERS[mask[index]]) return index;
  }
  return -1;
}

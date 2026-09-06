import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatMemberIdInput,
  isLegacyMemberId,
  unmaskMemberId,
} from "./member-id";

describe("member ID masking", () => {
  it("formats the new member ID while typing", () => {
    assert.equal(formatMemberIdInput("ab1c2026sa"), "MARC-AB1C/2026-SA");
  });

  it("keeps the legacy member ID intact", () => {
    const legacy = "MARC2026/08/0001";

    assert.equal(isLegacyMemberId(legacy), true);
    assert.equal(formatMemberIdInput(legacy), legacy);
  });

  it("returns the unmasked new member ID body for submission", () => {
    assert.equal(unmaskMemberId("MARC-AB1C/2026-SA"), "AB1C2026SA");
  });
});

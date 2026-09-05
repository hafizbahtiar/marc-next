import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { nextFilterValue } from "./data-table-filter";

describe("nextFilterValue", () => {
  it("adds and removes values for a multiple filter", () => {
    assert.deepEqual(nextFilterValue(["active"], "pending", true, true), ["active", "pending"]);
    assert.deepEqual(nextFilterValue(["active", "pending"], "active", false, true), ["pending"]);
  });

  it("returns a scalar value for a single filter", () => {
    assert.equal(nextFilterValue([], "pending", true, false), "pending");
    assert.equal(nextFilterValue(["active"], "pending", true, false), "pending");
  });

  it("clears the filter when the final value is removed", () => {
    assert.equal(nextFilterValue(["active"], "active", false, true), undefined);
  });
});

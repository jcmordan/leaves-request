import { describe, expect, it } from "vitest";
import { mapEdgesToArray } from "./mapEdgesToArray";

describe("mapEdgesToArray", () => {
  it("maps edges to flat array of nodes", () => {
    const edges = [
      { node: { id: "1", name: "Alice" } },
      { node: { id: "2", name: "Bob" } },
    ];
    const result = mapEdgesToArray<{ id: string; name: string }>(edges);
    expect(result).toEqual([
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ]);
  });

  it("returns empty-ish result for null", () => {
    const result = mapEdgesToArray(null);
    expect(result).toBeFalsy();
  });

  it("returns empty-ish result for undefined", () => {
    const result = mapEdgesToArray(undefined);
    expect(result).toBeFalsy();
  });

  it("returns empty array for empty edges", () => {
    const result = mapEdgesToArray([]);
    expect(result).toEqual([]);
  });

  it("preserves all node properties", () => {
    const edges = [{ node: { id: "1", name: "Alice", age: 30, active: true } }];
    const result = mapEdgesToArray<{
      id: string;
      name: string;
      age: number;
      active: boolean;
    }>(edges);
    expect(result[0]).toEqual({
      id: "1",
      name: "Alice",
      age: 30,
      active: true,
    });
  });
});

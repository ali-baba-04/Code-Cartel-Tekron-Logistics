import { describe, it, expect } from "vitest";
import { logisticsAgent } from "../agent/agent.js";

describe("Warehouse Recommendation Agent", () => {
  it("returns ranked trucks without exposing pricing model", async () => {
    const input = {
      job_id: "JOB001",
      pickup: "Indore",
      drop: "Bhopal",
      load_weight: 8,
      trucks: [
        {
          operator_id: "OP1",
          truck_id: "T1",
          capacity: 12,
          final_price: 30000
        },
        {
          operator_id: "OP2",
          truck_id: "T2",
          capacity: 10,
          final_price: 34000
        }
      ]
    };

    const result = await logisticsAgent(input);

    expect(result.job_id).toBe("JOB001");
    expect(result.recommended_trucks.length).toBeGreaterThan(0);

    const outputText = JSON.stringify(result);

    //  Internal logic must not leak
    expect(outputText).not.toContain("FTL");
    expect(outputText).not.toContain("PTL");

    //  Required fields
    expect(result.recommended_trucks[0]).toHaveProperty("final_price");
    expect(result.recommended_trucks[0]).toHaveProperty("rank");
  });
});
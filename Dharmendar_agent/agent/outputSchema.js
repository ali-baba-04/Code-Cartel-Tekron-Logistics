export const OUTPUT_SCHEMA = `
OUTPUT FORMAT (MANDATORY)

Operator-side output (private):
{
  "job_id": string,
  "operator_id": string,
  "truck_id": string,
  "route_analysis": {
    "route_overlap": true | false,
    "additional_distance_km": number
  },
  "risk": {
    "traffic": "LOW | MEDIUM | HIGH",
    "weather": "LOW | MEDIUM | HIGH"
  },
  "profit_analysis": {
    "estimated_profit": number,
    "profit_percentage": number
  },
  "recommendation": "SEND_JOB | DO_NOT_SEND",
  "reasoning": string
}

Warehouse-side output (public):
{
  "job_id": string,
  "recommended_trucks": [
    {
      "operator_id": string,
      "truck_id": string,
      "final_price": number,
      "rank": number,
      "delivery_feasibility": "HIGH | MEDIUM | LOW",
      "reasoning": string
    }
  ]
}
`;
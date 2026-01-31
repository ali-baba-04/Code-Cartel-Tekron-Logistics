export async function mapsTool({ pickup, drop }) {
  return {
    route_overlap: true,
    additional_distance_km: 14,
    estimated_time: "5h 10m"
  };
}

export async function trafficTool() {
  return {
    level: "LOW"
  };
}

export async function weatherTool() {
  return {
    level: "MEDIUM"
  };
}
import { Eye, BrainCircuit, Gavel, Truck } from "lucide-react";

export const steps = [
  {
    id: 1,
    title: "Observe",
    description:
      "Tracks trucks, route conditions, fuel prices, and market loads in real time.",
    icon: Eye,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    id: 2,
    title: "Reason",
    description:
      "Simulates thousands of future scenarios to predict outcomes and trade-offs.",
    icon: BrainCircuit,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    id: 3,
    title: "Decide",
    description:
      "Selects the mathematically optimal action to maximize profit and efficiency.",
    icon: Gavel,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    id: 4,
    title: "Act",
    description:
      "Executes the plan: reroutes the driver, schedules a pickup, or advises a wait.",
    icon: Truck,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
];

export default steps;

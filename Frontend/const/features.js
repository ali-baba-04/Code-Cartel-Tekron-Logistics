import { Calculator, GitBranch, Radio, Scale } from "lucide-react";

const features = [
  {
    title: "Trip Value Estimation",
    description:
      "Instantly calculates total trip profit considering dynamic fuel costs, driver hours, and deadhead miles.",
    icon: Calculator,
  },
  {
    title: "Mid-Route Decision Making",
    description:
      "Unlike static routers, our agent suggests optimal actions (reroute, refuel, pickup) while the truck is moving.",
    icon: GitBranch,
  },
  {
    title: "Fleet-Level Coordination",
    description:
      "Orchestrates decisions across multiple vehicles to prevent overlap and maximize regional coverage.",
    icon: Radio,
  },
  {
    title: "Constraint-Aware Reasoning",
    description:
      "Strictly adheres to Hours of Service (HOS) logs, delivery windows, and vehicle capacity limits.",
    icon: Scale,
  },
];

export default features;

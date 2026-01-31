import { Section } from "../components/Section";
import { XCircle, CheckCircle, Map, Zap } from "lucide-react";
import { motion } from "framer-motion";

const ProblemSolution = () => {
  return (
    <Section className="bg-white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          The Problem with Today's Logistics
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Traditional logistics plans are rigid. The moment a truck leaves the
          dock, the plan is already obsolete.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Old Way */}
        <motion.div
          whileHover={{ y: -5 }}
          className="p-8 rounded-2xl bg-slate-50 border border-slate-200"
        >
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
            <Map className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Static Trip Planning
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <span className="text-slate-600">
                Plans are locked once the trip starts
              </span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <span className="text-slate-600">
                Reactive to problems (traffic, weather)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <span className="text-slate-600">
                Trucks return empty (Deadhead miles)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <span className="text-slate-600">
                Missed opportunities for extra cargo
              </span>
            </li>
          </ul>
        </motion.div>

        {/* New Way */}
        <motion.div
          whileHover={{ y: -5 }}
          className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 relative z-10">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4 relative z-10">
            Continuous AI Agent
          </h3>
          <ul className="space-y-4 relative z-10">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-slate-300">
                Re-evaluates decisions every minute
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-slate-300">
                Proactively avoids delays & costs
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-slate-300">
                Dynamically adds pickups mid-route
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-slate-300">
                Treats logistics as a fluid process
              </span>
            </li>
          </ul>
        </motion.div>
      </div>
    </Section>
  );
};

export default ProblemSolution;

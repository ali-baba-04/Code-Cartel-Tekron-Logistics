import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden flex items-center">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Decision Engine
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
            From Static Planning to{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
              Continuous Intelligence
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
            An AI agent that observes trucks in real time, rethinks decisions
            mid-journey, and maximizes profit and utilization while the wheels
            are turning.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25">
              See How It Thinks
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              Explore System
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-100  bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm p-6 overflow-hidden"
        >
          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            preserveAspectRatio="none"
          >
            <path
              d="M50,450 Q150,250 250,250 T450,50"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <path
              d="M50,50 Q200,50 350,250 T650,450"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>

          <svg
            className="absolute inset-0 w-full h-full"
            style={{ filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))" }}
          >
            <motion.path
              d="M50,400 C150,400 200,200 400,200 S 550,100 650,100"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>

          <motion.div
            className="absolute w-12 h-12 bg-slate-900 border-2 border-emerald-500 rounded-full flex items-center justify-center z-20 shadow-xl shadow-emerald-500/20"
            animate={{
              offsetDistance: "100%",
              left: ["10%", "30%", "60%", "85%"],
              top: ["80%", "40%", "40%", "20%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.3, 0.6, 1],
            }}
          >
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          </motion.div>

          <motion.div
            className="absolute top-1/3 left-1/4 bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl z-30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs text-slate-400">Decision</div>
                <div className="text-sm font-semibold text-white">
                  Reroute to avoid traffic
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-1/3 right-1/4 bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl z-30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
            transition={{ duration: 4, repeat: Infinity, delay: 3 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                $
              </div>
              <div>
                <div className="text-xs text-slate-400">Opportunity</div>
                <div className="text-sm font-semibold text-white">
                  New load pickup (+ $450)
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-slate-600 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;

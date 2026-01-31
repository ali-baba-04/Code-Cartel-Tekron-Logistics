import { motion } from "framer-motion";

const FloatingCard = ({className, delay, icon, label, value}) => {
  return (
    <motion.div
      className={`absolute bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
      transition={{ duration: 4, repeat: Infinity, delay }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <div className="text-xs text-slate-400">{label}</div>
          <div className="text-sm font-semibold text-white">{value}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingCard;

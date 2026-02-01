import { Plus } from "lucide-react";

const QuickActions = ({
  onNewPR = () => {},
  onPostTruck = () => {},
  onTrack = () => {},
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onNewPR}
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded"
      >
        <Plus size={14} /> New PR
      </button>

      <button
        onClick={onPostTruck}
        className="inline-flex items-center gap-2 bg-slate-50 border px-3 py-2 rounded"
      >
        Post Truck
      </button>

      <button
        onClick={onTrack}
        className="inline-flex items-center gap-2 bg-slate-50 border px-3 py-2 rounded"
      >
        Track Truck
      </button>
    </div>
  );
};

export default QuickActions;

const KPI = ({ title, value, hint }) => {
  return (
    <div className="p-4 bg-white border rounded shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-bold">{value ?? "—"}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
};

export default KPI;

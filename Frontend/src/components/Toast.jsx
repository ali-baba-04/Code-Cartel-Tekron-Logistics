const Toast = ({ children, onClose, variant = "info" }) => {
  const base = "rounded-md px-4 py-2 shadow relative";
  const variantClass =
    variant === "success"
      ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
      : variant === "error"
        ? "bg-red-50 border border-red-100 text-red-700"
        : "bg-slate-50 border border-slate-100 text-slate-700";

  return (
    <div role="status" aria-live="polite" className="fixed top-6 right-6 z-50">
      <div className={`${base} ${variantClass}`}>
        {children}
        {onClose && (
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-1 right-1 text-sm text-slate-500 hover:text-slate-700"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;

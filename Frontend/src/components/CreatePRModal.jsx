import { useEffect, useRef, useState } from "react";

const CreatePRModal = ({ open, onClose, onCreate }) => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [loadTons, setLoadTons] = useState("");
  const [priceOffered, setPriceOffered] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const titleRef = useRef(null);
  const pickupRef = useRef(null);

  useEffect(() => {
    if (open) {
      // reset and focus first field when modal opens
      setPickup("");
      setDrop("");
      setDistanceKm("");
      setLoadTons("");
      setPriceOffered("");
      setFieldErrors({});
      setTimeout(() => pickupRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const validate = () => {
    const errs = {};
    if (!pickup.trim()) errs.pickup = "Pickup is required";
    if (!drop.trim()) errs.drop = "Drop is required";

    const d = parseFloat(distanceKm);
    if (Number.isNaN(d) || d <= 0)
      errs.distanceKm = "Distance must be greater than 0";

    const l = parseFloat(loadTons);
    if (Number.isNaN(l) || l <= 0)
      errs.loadTons = "Load must be greater than 0";

    if (priceOffered !== "") {
      const p = parseFloat(priceOffered);
      if (Number.isNaN(p) || p < 0)
        errs.priceOffered = "Price must be 0 or more";
    }
    return errs;
  };

  const focusFirstError = (errs) => {
    if (errs.pickup) pickupRef.current?.focus();
    else if (errs.drop) document.getElementById("drop-input")?.focus();
    else if (errs.distanceKm)
      document.getElementById("distance-input")?.focus();
    else if (errs.loadTons) document.getElementById("load-input")?.focus();
    else if (errs.priceOffered) document.getElementById("price-input")?.focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      focusFirstError(errs);
      return;
    }
    setFieldErrors({});
    setIsLoading(true);
    try {
      await onCreate({
        pickup: pickup.trim(),
        drop: drop.trim(),
        distanceKm: parseFloat(distanceKm),
        loadTons: parseFloat(loadTons),
        priceOffered:
          priceOffered === "" ? undefined : parseFloat(priceOffered),
      });
      onClose();
    } catch (err) {
      setFieldErrors({
        form:
          err?.response?.data?.message || err?.message || "Failed to create PR",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const backdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isFormValid = Object.keys(validate()).length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={backdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="create-pr-title"
    >
      <div
        className="w-full max-w-md bg-white rounded p-6 shadow"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            id="create-pr-title"
            ref={titleRef}
            className="text-lg font-semibold"
          >
            Create PR
          </h3>
          <button
            aria-label="Close dialog"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {fieldErrors.form && (
          <div role="alert" className="mb-3 text-sm text-red-600">
            {fieldErrors.form}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3" aria-live="polite">
          <div>
            <label className="block text-sm font-medium">Pickup</label>
            <input
              id="pickup-input"
              ref={pickupRef}
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded"
              placeholder="Origin address or city"
              aria-invalid={!!fieldErrors.pickup}
              aria-describedby={fieldErrors.pickup ? "pickup-error" : undefined}
              required
            />
            {fieldErrors.pickup && (
              <div id="pickup-error" className="text-sm text-red-600 mt-1">
                {fieldErrors.pickup}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Drop</label>
            <input
              id="drop-input"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded"
              placeholder="Destination"
              aria-invalid={!!fieldErrors.drop}
              aria-describedby={fieldErrors.drop ? "drop-error" : undefined}
              required
            />
            {fieldErrors.drop && (
              <div id="drop-error" className="text-sm text-red-600 mt-1">
                {fieldErrors.drop}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Distance (km)</label>
              <input
                id="distance-input"
                type="number"
                min="0.1"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="mt-1 w-full border px-3 py-2 rounded"
                aria-invalid={!!fieldErrors.distanceKm}
                aria-describedby={
                  fieldErrors.distanceKm ? "distance-error" : undefined
                }
                required
              />
              {fieldErrors.distanceKm && (
                <div id="distance-error" className="text-sm text-red-600 mt-1">
                  {fieldErrors.distanceKm}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Load (tons)</label>
              <input
                id="load-input"
                type="number"
                min="0.1"
                step="0.1"
                value={loadTons}
                onChange={(e) => setLoadTons(e.target.value)}
                className="mt-1 w-full border px-3 py-2 rounded"
                aria-invalid={!!fieldErrors.loadTons}
                aria-describedby={
                  fieldErrors.loadTons ? "load-error" : undefined
                }
                required
              />
              {fieldErrors.loadTons && (
                <div id="load-error" className="text-sm text-red-600 mt-1">
                  {fieldErrors.loadTons}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Price Offered (optional)
            </label>
            <input
              id="price-input"
              type="number"
              min="0"
              step="0.01"
              value={priceOffered}
              onChange={(e) => setPriceOffered(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded"
              aria-invalid={!!fieldErrors.priceOffered}
              aria-describedby={
                fieldErrors.priceOffered ? "price-error" : undefined
              }
            />
            {fieldErrors.priceOffered && (
              <div id="price-error" className="text-sm text-red-600 mt-1">
                {fieldErrors.priceOffered}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`px-4 py-2 rounded text-white ${isLoading || !isFormValid ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"}`}
            >
              {isLoading ? "Creating..." : "Create PR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePRModal;

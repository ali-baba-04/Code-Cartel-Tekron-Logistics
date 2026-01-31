import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";
import indianCities from "../../const/indianCities.js";

const DriverDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [truck, setTruck] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const [locationLoading, setLocationLoading] = useState(false);
  const intervalRef = useRef(null);
  const [isTracking, setIsTracking] = useState(false);
  const [tripId, setTripId] = useState(null);

  useEffect(() => {
    const fetchTruck = async () => {
      setLoading(true);
      try {
        const meRes = await api.get("/auth/me");
        const me = meRes.data;
        if (me.role !== "TRUCK") {
          setToast({ message: "Not authorized as driver", variant: "error" });
          navigate("/login", { replace: true });
          setLoading(false);
          return;
        }

        if (me.truckId) {
          const info = await api.get(`/driver/info/${me.truckId}`);
          setTruck(info.data);

          // check for an active trip and resume tracking
          try {
            const active = await api.get(`/driver/trip/active`);
            if (active.data?.active && active.data.trip) {
              setTripId(active.data.trip._id);
              startIntervalTracking(active.data.trip._id);
            }
          } catch (e) {
            console.warn("Failed to check active trip", e);
          }
        } else {
          // if backend returned truck directly
          setTruck(me);
        }
      } catch (err) {
        console.error(err);
        setToast({
          message: err?.response?.data?.message || "Failed to load truck info",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTruck();
  }, []);

  const handleUpdate = async (updates) => {
    try {
      const res = await api.post(`/driver/update/${truck.id}`, updates);
      setTruck(res.data.truck);
      setToast({ message: "Updated", variant: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Update failed", variant: "error" });
    }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      setToast({ message: "Geolocation not supported", variant: "error" });
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await handleUpdate({ lat: latitude, lng: longitude });
          setToast({ message: "Location updated", variant: "success" });
        } catch (err) {
          console.error(err);
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setToast({
          message: "Failed to get location: " + err.message,
          variant: "error",
        });
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // Interval-based tracking (every 30s) while trip is active
  const startIntervalTracking = (id) => {
    if (!navigator.geolocation) {
      setToast({ message: "Geolocation not supported", variant: "error" });
      return;
    }
    if (intervalRef.current) return; // already running

    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            if (id)
              await api.post(`/driver/trip/${id}/update`, {
                lat: latitude,
                lng: longitude,
              });
            await handleUpdate({ lat: latitude, lng: longitude });
          } catch (err) {
            console.error("interval update error", err);
          }
        },
        (err) => {
          console.error(err);
          setToast({
            message: "Location error: " + err.message,
            variant: "error",
          });
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
      );
    }, 30000); // 30s

    setIsTracking(true);
    setToast({ message: "Tracking started", variant: "success" });
  };

  const stopIntervalTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
    setToast({ message: "Tracking stopped", variant: "info" });
  };

  // Start/stop interval based on truck.status
  useEffect(() => {
    if (!truck) return;
    if (truck.status === "ON_TRIP") startIntervalTracking(tripId);
    else stopIntervalTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truck?.status, tripId]);

  // cleanup on unmount
  useEffect(() => {
    return () => stopIntervalTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trip lifecycle: start and end
  const startTrip = async () => {
    if (!navigator.geolocation) {
      setToast({ message: "Geolocation not supported", variant: "error" });
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await api.post("/driver/trip/start", {
            startLocation: { lat: latitude, lng: longitude },
          });
          const newTrip = res.data;
          setTripId(newTrip._id || newTrip.id);
          await handleUpdate({ status: "ON_TRIP" });
          startIntervalTracking(newTrip._id || newTrip.id);
          setToast({ message: "Trip started", variant: "success" });
        } catch (err) {
          console.error(err);
          setToast({
            message: err?.response?.data?.message || "Failed to start trip",
            variant: "error",
          });
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setToast({
          message: "Failed to get location: " + err.message,
          variant: "error",
        });
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const endTrip = async () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          if (tripId)
            await api.post(`/driver/trip/${tripId}/end`, {
              endLocation: { lat: latitude, lng: longitude },
            });
          await handleUpdate({ status: "IDLE" });
          stopIntervalTracking();
          setTripId(null);
          setToast({ message: "Trip ended", variant: "success" });
        } catch (err) {
          console.error(err);
          setToast({
            message: err?.response?.data?.message || "Failed to end trip",
            variant: "error",
          });
        } finally {
          setLocationLoading(false);
        }
      },
      async (err) => {
        console.error(err);
        try {
          if (tripId) await api.post(`/driver/trip/${tripId}/end`);
          await handleUpdate({ status: "IDLE" });
          stopIntervalTracking();
          setTripId(null);
          setToast({ message: "Trip ended (no location)", variant: "info" });
        } catch (e) {
          console.error(e);
          setToast({ message: "Failed to end trip", variant: "error" });
        } finally {
          setLocationLoading(false);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading driver view...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-lg font-bold">LogiNav — Driver</div>
          <div className="space-x-3">
            <button
              onClick={() => {
                // stop any running tracking
                try {
                  stopIntervalTracking();
                } catch (e) {}
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                navigate("/", { replace: true });
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <Toast variant={toast.variant} onClose={() => setToast(null)}>
          {toast.message}
        </Toast>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold">Truck Info</h2>

          {truck ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded">
                <div className="text-sm text-slate-500">Truck</div>
                <div className="text-2xl font-bold">{truck.truckNumber}</div>
                <div className="text-sm text-slate-500">
                  Capacity: {truck.capacityTons}t
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded">
                <div className="text-sm text-slate-500">Status</div>
                <div className="text-xl font-bold">{truck.status}</div>
                <div className="text-sm text-slate-500">
                  Used: {truck.usedTons ?? 0}t
                </div>
                <div className="text-sm text-slate-500">
                  Delay: {truck.delayMinutes ?? 0} min
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 p-4 bg-slate-50 rounded">
                <div className="text-sm text-slate-500">Location</div>
                <div className="text-base">
                  Lat: {truck.currentLocation?.lat ?? "—"}, Lng:{" "}
                  {truck.currentLocation?.lng ?? "—"}
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 p-4 bg-slate-50 rounded">
                <div className="text-sm text-slate-500">Destination</div>
                <div className="text-base mb-2">
                  {truck.destination?.city ?? "Not set"}
                </div>
                <select
                  value={
                    truck.destination?.city
                      ? (indianCities.find(
                          (c) => c.name === truck.destination?.city,
                        )?.name ?? "")
                      : ""
                  }
                  onChange={(e) => {
                    const name = e.target.value;
                    const city = indianCities.find((c) => c.name === name);
                    if (city) {
                      handleUpdate({
                        destination: {
                          city: city.name,
                          lat: city.lat,
                          lng: city.lng,
                        },
                      });
                    }
                  }}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Change destination...</option>
                  {indianCities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2 mt-2 flex gap-2 items-center">
                <button
                  onClick={() => startTrip()}
                  className="px-3 py-2 bg-emerald-500 text-white rounded"
                  disabled={isTracking || locationLoading}
                >
                  {isTracking ? "On Trip" : "Start Trip"}
                </button>
                <button
                  onClick={() => endTrip()}
                  className="px-3 py-2 bg-slate-50 border rounded"
                  disabled={!isTracking || locationLoading}
                >
                  End Trip
                </button>

                {isTracking && (
                  <div className="px-2 py-1 text-sm bg-emerald-50 text-emerald-700 rounded">
                    Tracking
                  </div>
                )}

                <button
                  onClick={() => handleUpdateLocation()}
                  className="px-3 py-2 bg-slate-50 border rounded"
                  disabled={locationLoading}
                >
                  {locationLoading ? "Updating..." : "Update My Location"}
                </button>
                <button
                  onClick={() =>
                    handleUpdate({
                      lat: (truck.currentLocation?.lat || 0) + 0.001,
                      lng: (truck.currentLocation?.lng || 0) + 0.001,
                    })
                  }
                  className="px-3 py-2 bg-slate-50 border rounded"
                >
                  Simulate Location Update
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              Truck info not available
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;

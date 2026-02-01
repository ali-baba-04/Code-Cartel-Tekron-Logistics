import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";
import FleetMap from "../components/FleetMap";
import indianCities from "../../const/indianCities.js";

const OwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [trucks, setTrucks] = useState([]);
  const [prs, setPrs] = useState([]);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ensure role is OWNER
        const me = await api.get("/auth/me");
        if (me.data.role !== "OWNER") {
          setToast({ message: "Not authorized", variant: "error" });
          navigate("/login", { replace: true });
          return;
        }

        const [trucksRes, pendingRes] = await Promise.all([
          api.get("/trucks"),
          api.get("/prs/pending"),
        ]);
        setTrucks(trucksRes.data || []);
        setPrs(pendingRes.data || []);
      } catch (err) {
        console.error(err);
        setToast({ message: "Failed to load dashboard", variant: "error" });
        if (err?.response?.status === 401)
          navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleDecision = async (prId, decision) => {
    try {
      await api.post(`/decision/${prId}`, { decision });
      setPrs((prev) => prev.filter((p) => p._id !== prId));
      setToast({ message: `PR ${decision.toLowerCase()}`, variant: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Decision failed", variant: "error" });
    }
  };

  // Add truck + driver management state & handlers
  const [showAddTruck, setShowAddTruck] = useState(false);
  const [newTruck, setNewTruck] = useState({
    truckNumber: "",
    capacityTons: "",
    password: "",
  });
  const [driverForms, setDriverForms] = useState({});

  const handleAddTruck = async () => {
    try {
      const payload = {
        truckNumber: newTruck.truckNumber,
        capacityTons: Number(newTruck.capacityTons),
        password: newTruck.password || undefined,
      };
      const res = await api.post("/trucks", payload);
      setTrucks((prev) => [res.data, ...prev]);
      setToast({ message: "Truck added", variant: "success" });
      setNewTruck({ truckNumber: "", capacityTons: "", password: "" });
      setShowAddTruck(false);
    } catch (err) {
      console.error(err);
      setToast({
        message: err?.response?.data?.message || "Failed to add truck",
        variant: "error",
      });
    }
  };

  const toggleDriverForm = (truckId) => {
    setDriverForms((prev) => ({
      ...prev,
      [truckId]: { ...(prev[truckId] || {}), show: !prev[truckId]?.show },
    }));
  };

  const updateDriverField = (truckId, field, value) => {
    setDriverForms((prev) => ({
      ...prev,
      [truckId]: { ...(prev[truckId] || {}), [field]: value },
    }));
  };

  const handleAddDriver = async (truckId) => {
    try {
      const form = driverForms[truckId] || {};
      await api.post(`/trucks/${truckId}/driver`, {
        name: form.name || "",
        phone: form.phone || "",
      });
      setToast({ message: "Driver added", variant: "success" });
      setDriverForms((prev) => ({ ...prev, [truckId]: { show: false } }));
    } catch (err) {
      console.error(err);
      setToast({
        message: err?.response?.data?.message || "Failed to add driver",
        variant: "error",
      });
    }
  };

  // Password management for trucks
  const togglePasswordForm = (truckId) => {
    setDriverForms((prev) => ({
      ...prev,
      [truckId]: {
        ...(prev[truckId] || {}),
        showPassword: !prev[truckId]?.showPassword,
      },
    }));
  };

  const handleUpdatePassword = async (truckId) => {
    try {
      const form = driverForms[truckId] || {};
      if (!form.password || form.password.length < 4) {
        setToast({
          message: "Password must be at least 4 characters",
          variant: "error",
        });
        return;
      }
      await api.patch(`/trucks/${truckId}/password`, {
        password: form.password,
      });
      setToast({ message: "Password updated", variant: "success" });
      setDriverForms((prev) => ({
        ...prev,
        [truckId]: { showPassword: false },
      }));
    } catch (err) {
      console.error(err);
      setToast({
        message: err?.response?.data?.message || "Failed to update password",
        variant: "error",
      });
    }
  };

  const handleSetDestination = async (truckId, cityObj) => {
    if (!cityObj) return;
    try {
      const res = await api.patch(`/trucks/${truckId}/destination`, {
        city: cityObj.name,
        lat: cityObj.lat,
        lng: cityObj.lng,
      });
      setTrucks((prev) => prev.map((t) => (t._id === truckId ? res.data : t)));
      setToast({ message: "Destination set", variant: "success" });
    } catch (err) {
      console.error(err);
      setToast({
        message: err?.response?.data?.message || "Failed to set destination",
        variant: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-lg font-bold">LogiNav — Owner</div>
          <div className="space-x-3">
            <button
              onClick={() => {
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
        {loading ? (
          <div>Loading owner dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold">Your Trucks</h2>
              <div className="mt-4 space-y-2">
                {trucks.length ? (
                  trucks.map((t) => (
                    <div key={t._id} className="bg-slate-50 p-2 rounded">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          {t.truckNumber} • {t.capacityTons}t
                        </div>
                        <div className="text-xs text-slate-500">
                          Used: {t.usedTons ?? 0}t
                        </div>
                      </div>

                      <div className="mt-2 flex gap-2 items-center">
                        <button
                          onClick={() => toggleDriverForm(t._id)}
                          className="text-xs text-slate-700 border px-2 py-1 rounded"
                        >
                          Add Driver
                        </button>
                        <button
                          onClick={() => togglePasswordForm(t._id)}
                          className="text-xs text-slate-700 border px-2 py-1 rounded"
                        >
                          Set Password
                        </button>
                        <div className="text-xs text-slate-500">
                          Password:{" "}
                          <strong className="ml-1">
                            {t.password ? "set" : "—"}
                          </strong>
                        </div>
                      </div>

                      <div className="mt-2">
                        <label className="text-xs text-slate-500 block mb-1">
                          Destination
                        </label>
                        <select
                          value={
                            t.destination?.city
                              ? (indianCities.find(
                                  (c) => c.name === t.destination?.city,
                                )?.name ?? "")
                              : ""
                          }
                          onChange={(e) => {
                            const name = e.target.value;
                            const city = indianCities.find(
                              (c) => c.name === name,
                            );
                            if (city) handleSetDestination(t._id, city);
                          }}
                          className="w-full text-sm border rounded px-2 py-1"
                        >
                          <option value="">Set destination...</option>
                          {indianCities.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        {t.destination?.city && (
                          <div className="text-xs text-slate-500 mt-1">
                            → {t.destination.city}
                          </div>
                        )}
                      </div>

                      {driverForms[t._id]?.show && (
                        <div className="mt-2 p-2 bg-white border rounded">
                          <input
                            placeholder="Driver name"
                            value={driverForms[t._id]?.name || ""}
                            onChange={(e) =>
                              updateDriverField(t._id, "name", e.target.value)
                            }
                            className="w-full mb-1 border rounded px-2 py-1"
                          />
                          <input
                            placeholder="Phone"
                            value={driverForms[t._id]?.phone || ""}
                            onChange={(e) =>
                              updateDriverField(t._id, "phone", e.target.value)
                            }
                            className="w-full mb-2 border rounded px-2 py-1"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddDriver(t._id)}
                              className="px-3 py-1 bg-emerald-500 text-white rounded text-xs"
                            >
                              Create Driver
                            </button>
                            <button
                              onClick={() => toggleDriverForm(t._id)}
                              className="px-3 py-1 bg-red-50 border text-red-600 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {driverForms[t._id]?.showPassword && (
                        <div className="mt-2 p-2 bg-white border rounded">
                          <input
                            placeholder="New password"
                            type="password"
                            value={driverForms[t._id]?.password || ""}
                            onChange={(e) =>
                              updateDriverField(
                                t._id,
                                "password",
                                e.target.value,
                              )
                            }
                            className="w-full mb-2 border rounded px-2 py-1"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdatePassword(t._id)}
                              className="px-3 py-1 bg-emerald-500 text-white rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => togglePasswordForm(t._id)}
                              className="px-3 py-1 bg-red-50 border text-red-600 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">No trucks yet</div>
                )}

                <div className="mt-4">
                  {!showAddTruck ? (
                    <button
                      onClick={() => setShowAddTruck(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded"
                    >
                      Add truck
                    </button>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <input
                        placeholder="Truck number"
                        value={newTruck.truckNumber}
                        onChange={(e) =>
                          setNewTruck({
                            ...newTruck,
                            truckNumber: e.target.value,
                          })
                        }
                        className="w-full border rounded px-2 py-1"
                      />
                      <input
                        placeholder="Capacity (tons)"
                        type="number"
                        value={newTruck.capacityTons}
                        onChange={(e) =>
                          setNewTruck({
                            ...newTruck,
                            capacityTons: e.target.value,
                          })
                        }
                        className="w-full border rounded px-2 py-1"
                      />
                      <input
                        placeholder="Driver password"
                        value={newTruck.password}
                        onChange={(e) =>
                          setNewTruck({ ...newTruck, password: e.target.value })
                        }
                        className="w-full border rounded px-2 py-1"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddTruck}
                          className="px-3 py-2 bg-emerald-500 text-white rounded"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => {
                            setShowAddTruck(false);
                            setNewTruck({
                              truckNumber: "",
                              capacityTons: "",
                              password: "",
                            });
                          }}
                          className="px-3 py-2 bg-red-50 border text-red-600 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold">Pending PRs</h2>
              <div className="mt-4 space-y-3">
                {prs.length ? (
                  prs.map((p) => (
                    <div
                      key={p._id}
                      className="p-3 bg-slate-50 rounded flex items-start justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {p.pickup} → {p.drop}
                        </div>
                        <div className="text-xs text-slate-500">
                          {p.loadTons}t • {p.distanceKm} km
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <div className="mb-1">{p.status ?? "PENDING"}</div>
                        {(p.status ?? "PENDING") === "PENDING" && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDecision(p._id, "ACCEPTED")}
                              className="px-3 py-1 bg-emerald-500 text-white rounded text-xs"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecision(p._id, "REJECTED")}
                              className="px-3 py-1 bg-red-50 border text-red-600 rounded text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">No pending PRs</div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="mt-8 bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Fleet map</h2>
            <FleetMap trucks={trucks} />
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;

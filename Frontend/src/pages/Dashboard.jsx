import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Dashboard = () => {
  const [me, setMe] = useState(null); // { type: 'USER'|'TRUCK', user?, truck? }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ lat: "", lng: "", usedTons: "", containerAvailable: true, delayMinutes: "", status: "" });
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_type");
    localStorage.removeItem("truck_token");
    localStorage.removeItem("truck_id");
    localStorage.removeItem("truck_number");
    window.dispatchEvent(new Event('storage'));
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchMe = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setMe(data);

        if (data.type === "TRUCK") {
          const t = data.truck;
          setForm({
            lat: t.currentLocation?.lat ?? "",
            lng: t.currentLocation?.lng ?? "",
            usedTons: t.usedTons ?? "",
            containerAvailable: t.containerAvailable ?? true,
            delayMinutes: t.delayMinutes ?? "",
            status: t.status ?? ""
          });
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        localStorage.removeItem("auth_type");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [navigate]);

  const updateTruck = async (e) => {
    e?.preventDefault();
    setError(null);
    try {
      if (!me || me.type !== "TRUCK") return;
      const token = localStorage.getItem("token");
      const truckId = localStorage.getItem("truck_id") || me.truck._id;

      const body = {
        lat: form.lat !== "" ? Number(form.lat) : undefined,
        lng: form.lng !== "" ? Number(form.lng) : undefined,
        usedTons: form.usedTons !== "" ? Number(form.usedTons) : undefined,
        containerAvailable: form.containerAvailable,
        delayMinutes: form.delayMinutes !== "" ? Number(form.delayMinutes) : undefined,
        status: form.status || undefined
      };

      const res = await fetch(`http://localhost:5000/api/driver/update/${truckId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}));
        throw new Error(message || "Update failed");
      }
      const data = await res.json();
      // refresh
      const updatedTruck = (data && data.truck) ? data.truck : null;
      setMe(prev => prev && prev.type === "TRUCK" ? { ...prev, truck: updatedTruck || prev.truck } : prev);
      alert("Truck updated");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error");
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm(prev => ({ ...prev, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
    }, (err) => {
      alert("Unable to fetch location");
      console.error(err);
    });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  // Helper to update map view when center changes
  const SetView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (map && center) {
        map.setView(center, map.getZoom());
      }
    }, [map, center]);
    return null;
  };

  // Simple create truck form used by owner
  const CreateTruckForm = ({ onCreate }) => {
    const [truckNumber, setTruckNumber] = useState("");
    const [capacityTons, setCapacityTons] = useState(5);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
      e?.preventDefault();
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/trucks", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ truckNumber, capacityTons, password })
        });
        if (!res.ok) throw new Error("Create failed");
        setTruckNumber("");
        setCapacityTons(5);
        setPassword("");
        if (onCreate) await onCreate();
      } catch (err) {
        console.error(err);
        alert("Create truck failed");
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={submit} className="space-y-2">
        <input placeholder="Truck Number" value={truckNumber} onChange={e=>setTruckNumber(e.target.value)} className="w-full border px-2 py-1 rounded" />
        <input placeholder="Capacity Tons" type="number" value={capacityTons} onChange={e=>setCapacityTons(e.target.value)} className="w-full border px-2 py-1 rounded" />
        <input placeholder="Password (optional)" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border px-2 py-1 rounded" />
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-emerald-500 text-white px-3 py-1 rounded">Create</button>
        </div>
      </form>
    );
  };

  // OwnerView component defined inline so it can access fetch and state via its own hooks
  const OwnerView = () => {
    const [trucks, setTrucks] = useState([]);
    const [prs, setPrs] = useState([]);
    const [selectedTruck, setSelectedTruck] = useState(null);
    const [selectedPR, setSelectedPR] = useState(null);
    const [mapCenter, setMapCenter] = useState([20, 0]); // default center
    const mapRef = useRef();

    const token = localStorage.getItem("token");

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [tRes, pRes] = await Promise.all([
            fetch("http://localhost:5000/api/trucks", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("http://localhost:5000/api/prs/pending", { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (tRes.ok) setTrucks(await tRes.json());
          if (pRes.ok) setPrs(await pRes.json());
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }, [token]);

    const refreshPRs = async () => {
      const res = await fetch("http://localhost:5000/api/prs/pending", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPrs(await res.json());
    };

    const acceptPR = async (prId) => {
      try {
        const res = await fetch(`http://localhost:5000/api/prs/${prId}/accept`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Accept failed");
        await refreshPRs();
      } catch (err) {
        console.error(err);
        alert("Accept failed");
      }
    };

    const rejectPR = async (prId) => {
      try {
        const res = await fetch(`http://localhost:5000/api/prs/${prId}/reject`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Reject failed");
        await refreshPRs();
      } catch (err) {
        console.error(err);
        alert("Reject failed");
      }
    };

    useEffect(() => {
      if (selectedTruck && selectedTruck.currentLocation) {
        setMapCenter([selectedTruck.currentLocation.lat, selectedTruck.currentLocation.lng]);
      }
    }, [selectedTruck]);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-4 rounded shadow h-[70vh] overflow-auto">
          <h3 className="font-semibold mb-2">Pending PRs</h3>
          {prs.length === 0 && <div className="text-sm text-slate-500">No pending PRs</div>}
          <ul className="space-y-2">
            {prs.map((pr) => (
              <li key={pr._id} className="p-2 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedPR(pr)}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{pr.pickup} → {pr.drop}</div>
                    <div className="text-xs text-slate-500">Load: {pr.loadTons}t • Price: {pr.priceOffered}</div>
                  </div>
                  <div className="text-sm text-slate-400">{pr.agentEvaluation?.recommended ? '✓' : '•'}</div>
                </div>
              </li>
            ))}
          </ul>

          <hr className="my-4" />

          <h3 className="font-semibold mb-2">My Trucks</h3>
          <CreateTruckForm onCreate={async () => {
            // refresh trucks
            const res = await fetch("http://localhost:5000/api/trucks", { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
              setTrucks(await res.json());
            }
          }} />
          <ul className="space-y-2 mt-3">
            {trucks.map((t) => (
              <li key={t._id} className="p-2 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedTruck(t); setSelectedPR(null); }}>
                <div className="font-medium">{t.truckNumber}</div>
                <div className="text-xs text-slate-500">Status: {t.status} • Available: {t.containerAvailable ? 'Yes' : 'No'}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-2 rounded shadow h-[70vh]">
            <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%' }} whenCreated={map => (mapRef.current = map)}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <SetView center={mapCenter} />
              {trucks.map(t => (t.currentLocation && t.currentLocation.lat) ? (
                <CircleMarker key={t._id} center={[t.currentLocation.lat, t.currentLocation.lng]} radius={8} pathOptions={{ color: t.containerAvailable ? 'green' : 'red' }} eventHandlers={{ click: () => setSelectedTruck(t) }}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">{t.truckNumber}</div>
                      <div>Used: {t.usedTons}t — Capacity: {t.capacityTons}t</div>
                      <div>Status: {t.status}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ) : null)}
            </MapContainer>
          </div>

          {/* Details panel */}
          <div className="mt-4 bg-white p-4 rounded shadow">
            {selectedPR && (
              <div>
                <h3 className="font-semibold">PR Details</h3>
                <p className="text-sm text-slate-600">{selectedPR.pickup} → {selectedPR.drop} • {selectedPR.loadTons}t</p>
                <p className="text-sm mt-2">Agent recommended: {selectedPR.agentEvaluation?.recommended ? 'Yes' : 'No'}</p>
                <p className="text-sm text-slate-500 mt-1">Expected profit: {selectedPR.agentEvaluation?.expectedProfit ?? '—'}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => acceptPR(selectedPR._id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded">Accept</button>
                  <button onClick={() => rejectPR(selectedPR._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                </div>
              </div>
            )}

            {selectedTruck && (
              <div>
                <h3 className="font-semibold">Truck Details</h3>
                <p className="text-sm text-slate-600">{selectedTruck.truckNumber}</p>
                <p className="text-sm text-slate-600">Used: {selectedTruck.usedTons}t • Capacity: {selectedTruck.capacityTons}t</p>
                <p className="text-sm text-slate-600">Location: {selectedTruck.currentLocation?.lat ?? '—'}, {selectedTruck.currentLocation?.lng ?? '—'}</p>
              </div>
            )}

            {!selectedPR && !selectedTruck && (
              <div className="text-sm text-slate-500">Select a PR or truck to view details</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div>
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded">Logout</button>
          </div>
        </div>

        {/* Owner dashboard */}
        {me && me.type === "USER" && me.user.role === "OWNER" && (
          <OwnerView />
        )}

        {/* Regular user */}
        {me && me.type === "USER" && me.user.role !== "OWNER" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold">Welcome, {me.user.email}</h2>
            <p className="mt-2 text-sm text-slate-600">Role: {me.user.role}</p>
          </div>
        )}

        {/* Truck (driver) view */}
        {me && me.type === "TRUCK" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Truck: {me.truck.truckNumber}</h2>
            <p className="text-sm text-slate-600 mb-4">Capacity: {me.truck.capacityTons} tons — Used: {me.truck.usedTons} tons — Available: {me.truck.availableTons} tons</p>

            {error && <div className="mb-4 text-red-600">{error}</div>}

            <form onSubmit={updateTruck} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Latitude</label>
                <input value={form.lat} onChange={e => setForm(prev => ({ ...prev, lat: e.target.value }))} className="mt-1 w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Longitude</label>
                <input value={form.lng} onChange={e => setForm(prev => ({ ...prev, lng: e.target.value }))} className="mt-1 w-full border px-3 py-2 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium">Used Tons</label>
                <input value={form.usedTons} onChange={e => setForm(prev => ({ ...prev, usedTons: e.target.value }))} className="mt-1 w-full border px-3 py-2 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium">Delay Minutes</label>
                <input value={form.delayMinutes} onChange={e => setForm(prev => ({ ...prev, delayMinutes: e.target.value }))} className="mt-1 w-full border px-3 py-2 rounded" />
              </div>

              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium">Container Available</label>
                <input type="checkbox" checked={form.containerAvailable} onChange={e => setForm(prev => ({ ...prev, containerAvailable: e.target.checked }))} />
              </div>

              <div>
                <label className="block text-sm font-medium">Status</label>
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))} className="mt-1 w-full border px-3 py-2 rounded">
                  <option value="">--</option>
                  <option value="IDLE">IDLE</option>
                  <option value="ON_TRIP">ON_TRIP</option>
                </select>
              </div>

              <div className="flex gap-2 md:col-span-2">
                <button type="button" onClick={useMyLocation} className="bg-slate-200 px-3 py-2 rounded">Use my location</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded">Update Truck</button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;

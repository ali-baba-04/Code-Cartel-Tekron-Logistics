import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DriverDashboard = () => {
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ lat: "", lng: "", usedTons: "", containerAvailable: true, delayMinutes: "", status: "" });
  const navigate = useNavigate();

  const truckId = localStorage.getItem("truck_id");
  const token = localStorage.getItem("truck_token");

  useEffect(() => {
    if (!token || !truckId) {
      navigate("/driver/login", { replace: true });
      return;
    }

    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/driver/info/${truckId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch truck info");
        const data = await res.json();
        setTruck(data);
        setForm({
          lat: data.currentLocation?.lat ?? "",
          lng: data.currentLocation?.lng ?? "",
          usedTons: data.usedTons ?? "",
          containerAvailable: data.containerAvailable ?? true,
          delayMinutes: data.delayMinutes ?? "",
          status: data.status ?? ""
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [navigate, token, truckId]);

  const update = async (e) => {
    e?.preventDefault();
    setError(null);
    try {
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
      setTruck(data.truck);
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

  const logout = () => {
    localStorage.removeItem("truck_token");
    localStorage.removeItem("truck_id");
    localStorage.removeItem("truck_number");
    navigate("/", { replace: true });
    window.dispatchEvent(new Event('storage'));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <div>
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded">Logout</button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        {truck ? (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Truck: {truck.truckNumber}</h2>
            <p className="text-sm text-slate-600 mb-4">Capacity: {truck.capacityTons} tons — Used: {truck.usedTons} tons — Available: {truck.availableTons} tons</p>

            <form onSubmit={update} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        ) : (
          <div>No truck information</div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DriverLogin = () => {
  const [truckNo, setTruckNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/auth/truck-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ truckNo, password }),
      });
      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}));
        throw new Error(message || "Login failed");
      }
      const data = await res.json();
      // store truck token and id separately
      localStorage.setItem("token", data.token);
      localStorage.setItem("truck_token", data.token);
      localStorage.setItem("truck_id", data.truckId);
      localStorage.setItem("truck_number", data.truckNumber);
      localStorage.setItem("auth_type", "TRUCK");
      window.dispatchEvent(new Event('storage'));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Driver Login</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Truck Number</label>
            <input value={truckNo} onChange={e => setTruckNo(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded">Log in</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverLogin;

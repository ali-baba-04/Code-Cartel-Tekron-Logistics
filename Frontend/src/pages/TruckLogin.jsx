import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../utils/api";
import AuthCard from "../components/AuthCard";
import Toast from "../components/Toast";

const TruckLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleLogin = async ({ truckNo, password }) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/truck-login", { truckNo, password });
      const { token, role } = res.data;
      sessionStorage.setItem("token", token);
      setToast({ message: "Logged in", variant: "success" });
      // navigate to driver dashboard directly
      if (role === "TRUCK") navigate("/dashboard/driver", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setToast({
        message: err?.response?.data?.message || "Login failed",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast variant={toast.variant} onClose={() => setToast(null)}>
          {toast.message}
        </Toast>
      )}
      <AuthCard title="Driver Login" subtitle="Enter your truck credentials">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (loading) return;
            const truckNo = e.target.truckNo.value;
            const password = e.target.password.value;
            await handleLogin({ truckNo, password });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium">Truck Number</label>
            <input
              name="truckNo"
              className="mt-1 w-full border rounded px-3 py-2"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              className="mt-1 w-full border rounded px-3 py-2"
              disabled={loading}
            />
          </div>
          <div>
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </div>
        </form>
      </AuthCard>
    </>
  );
};

export default TruckLogin;

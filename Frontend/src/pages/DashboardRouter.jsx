import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const DashboardRouter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        const data = res.data;
        // If truck token, backend returns truck info with role: "TRUCK"
        const role =
          data.role ||
          data.role?.toUpperCase() ||
          (data.truckNumber ? "TRUCK" : null);

        if (role === "OWNER") navigate("/dashboard/owner", { replace: true });
        else if (role === "USER")
          navigate("/dashboard/user", { replace: true });
        else if (role === "TRUCK")
          navigate("/dashboard/driver", { replace: true });
        else navigate("/login", { replace: true });
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  return null;
};

export default DashboardRouter;

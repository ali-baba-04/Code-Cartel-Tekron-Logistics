import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import AuthCard from "../components/AuthCard";
import AuthForm from "../components/AuthForm";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showSuccess = Boolean(location.state?.signupSuccess);

  const handleLogin = async ({ email, password, remember }) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, role } = res.data;
    if (remember) localStorage.setItem("token", token);
    else sessionStorage.setItem("token", token);

    // Navigate based on role when available
    if (role === "OWNER") navigate("/dashboard/owner", { replace: true });
    else if (role === "USER") navigate("/dashboard/user", { replace: true });
    else navigate("/dashboard", { replace: true });
  };

  return (
    <AuthCard title="LogiNav" subtitle="Welcome back — log in to continue">
      {showSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2"
        >
          Account created! Please log in.
        </div>
      )}

      <AuthForm mode="login" onSubmit={handleLogin} />
    </AuthCard>
  );
};

export default Login;

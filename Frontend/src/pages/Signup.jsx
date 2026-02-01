import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import AuthCard from "../components/AuthCard";
import AuthForm from "../components/AuthForm";

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = async ({ email, password, role }) => {
    await api.post("/auth/signup", { email, password, role });
    // Redirect to login and show success message
    navigate("/login", { replace: true, state: { signupSuccess: true } });
  };

  return (
    <AuthCard title="Tekron" subtitle="Create your account in a few seconds">
      <AuthForm mode="signup" onSubmit={handleSignup} defaultRole={"USER"} />
    </AuthCard>
  );
};

export default Signup;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./landing/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Driver (truck) routes */}
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App; 

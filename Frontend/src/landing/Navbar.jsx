import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ solid = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isTruckLoggedIn, setIsTruckLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Smooth scroll helper with offset for fixed navbar
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80; // offset for fixed navbar
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    const type = localStorage.getItem("auth_type");
    setIsUserLoggedIn(type === "USER");
    setIsTruckLoggedIn(type === "TRUCK");

    const onStorage = () => {
      const t = localStorage.getItem("auth_type");
      setIsUserLoggedIn(t === "USER");
      setIsTruckLoggedIn(t === "TRUCK");
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_type");
    setIsUserLoggedIn(false);
    navigate("/", { replace: true });
    // notify other listeners
    window.dispatchEvent(new Event('storage'));
  };

  const logoutTruck = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_type");
    localStorage.removeItem("truck_token");
    localStorage.removeItem("truck_id");
    localStorage.removeItem("truck_number");
    setIsTruckLoggedIn(false);
    navigate("/", { replace: true });
    // notify other listeners
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${active ? "bg-slate-900/95 backdrop-blur-md shadow-lg py-4 border-b border-slate-800" : "bg-transparent py-6"}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <div
          className="text-white font-bold text-xl tracking-tight flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold text-lg">L</span>
          </div>
          LogiNav
        </div>

        <div className="flex items-center gap-4">
          {/* User auth */}
          {isUserLoggedIn ? (
            <>
              <Link to="/dashboard" className="text-sm text-slate-200 hover:text-white">Dashboard</Link>
              <button onClick={logoutUser} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white mr-2"
              >
                Log in
              </Link>
              <Link
                to="/truck-login"
                className="text-sm font-medium text-slate-300 hover:text-white mr-2"
              >
                Driver login
              </Link>
              <Link
                to="/signup"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Truck (driver) auth */}
          {isTruckLoggedIn ? (
            <>
              <Link to="/driver/dashboard" className="text-sm text-slate-200 hover:text-white">Driver Dashboard</Link>
              <button onClick={logoutTruck} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm">Logout</button>
            </>
          ) : (
            <Link to="/driver/login" className="text-sm text-slate-200 hover:text-white">Driver Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

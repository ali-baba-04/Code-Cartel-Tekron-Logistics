import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KPI from "../components/KPI";
import QuickActions from "../components/QuickActions";
import CreatePRModal from "../components/CreatePRModal";
import Toast from "../components/Toast";
import api from "../utils/api";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prs, setPrs] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [kpis, setKpis] = useState({
    openPRs: "—",
    activeTrucks: "—",
    inProgress: "—",
  });
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchMeAndData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);

        // Fetch role-specific dashboard data
        if (res.data.role === "OWNER") {
          const [trucksRes, pendingRes] = await Promise.all([
            api.get("/trucks"),
            api.get("/prs/pending"),
          ]);
          setTrucks(trucksRes.data || []);
          setPrs(pendingRes.data || []);
          setKpis({
            openPRs: pendingRes.data?.length ?? 0,
            activeTrucks: trucksRes.data?.length ?? 0,
            inProgress: "—",
          });
        } else if (res.data.role === "USER") {
          const myPrsRes = await api.get("/prs/my");
          setPrs(myPrsRes.data || []);
          setKpis({
            openPRs: myPrsRes.data?.length ?? 0,
            activeTrucks: "—",
            inProgress: "—",
          });
        } else {
          // TRUCK or other roles - no extra data yet
          setKpis({ openPRs: "—", activeTrucks: "—", inProgress: "—" });
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchMeAndData();
  }, [navigate]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  const handleCreatePR = async (pr) => {
    const res = await api.post("/prs", pr);
    // if user is USER and viewing my PRs, prepend
    setPrs((prev) => [res.data, ...prev]);
    setToast({ message: "PR created", variant: "success" });
  };

  const handleDecision = async (prId, decision) => {
    try {
      await api.post(`/decision/${prId}`, { decision });
      setPrs((prev) => prev.filter((p) => p._id !== prId));
      setToast({ message: `PR ${decision.toLowerCase()}`, variant: "success" });
    } catch (err) {
      console.error(err);
      setToast({
        message: err?.response?.data?.message || "Decision failed",
        variant: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-lg font-bold">LogiNav</div>
          <div className="space-x-3">
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
            >
              Logout
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded ml-2"
            >
              Create PR
            </button>
          </div>
        </div>
      </header>

      <CreatePRModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePR}
      />
      {toast && (
        <Toast variant={toast.variant} onClose={() => setToast(null)}>
          {toast.message}
        </Toast>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div>Loading account...</div>
        ) : (
          <>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <div className="col-span-1">
                  <KPI
                    title="Open PRs"
                    value={kpis.openPRs}
                    hint="Pending requests"
                  />
                </div>
                <div className="col-span-1">
                  <KPI
                    title="Active Trucks"
                    value={kpis.activeTrucks}
                    hint="Online trucks"
                  />
                </div>
                <div className="col-span-1">
                  <KPI
                    title="In-Progress"
                    value={kpis.inProgress}
                    hint="Ongoing trips"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <QuickActions
                  onNewPR={() => setShowCreateModal(true)}
                  onPostTruck={() => alert("Post Truck")}
                  onTrack={() => alert("Track")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold">Profile</h2>
                <p className="mt-2 text-sm text-slate-600">{user?.email}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Role: {user?.role}
                </p>

                {user?.role === "OWNER" && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Your Trucks</h3>
                    <div className="space-y-2">
                      {trucks.length ? (
                        trucks.map((t) => (
                          <div
                            key={t._id}
                            className="flex items-center justify-between bg-slate-50 p-2 rounded"
                          >
                            <div className="text-sm">
                              {t.truckNumber} • {t.capacityTons}t
                            </div>
                            <div className="text-xs text-slate-500">
                              Used: {t.usedTons ?? 0}t
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">
                          No trucks yet
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded">
                        Add truck
                      </button>
                    </div>
                  </div>
                )}

                {user?.role !== "OWNER" && (
                  <div className="mt-4">
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded">
                      Edit profile
                    </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold">Overview</h2>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Recent PRs</h3>
                    <div className="space-y-2">
                      {prs.length ? (
                        prs.slice(0, 6).map((p) => (
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
                              <div className="mb-1">
                                {p.status ?? "PENDING"}
                              </div>
                              {user?.role === "OWNER" &&
                                (p.status ?? "PENDING") === "PENDING" && (
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() =>
                                        handleDecision(p._id, "ACCEPTED")
                                      }
                                      className="px-3 py-1 bg-emerald-500 text-white rounded text-xs"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDecision(p._id, "REJECTED")
                                      }
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
                        <div className="text-sm text-slate-500">
                          No recent PRs
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Stats</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded">
                        <div className="text-sm text-slate-500">Projects</div>
                        <div className="text-2xl font-bold">—</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded">
                        <div className="text-sm text-slate-500">Usage</div>
                        <div className="text-2xl font-bold">—</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded">
                        <div className="text-sm text-slate-500">Members</div>
                        <div className="text-2xl font-bold">—</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-slate-600">
                  Welcome to your dashboard. Use the quick actions above to get
                  started.
                </div>
              </div>
            </div>

            {/* mobile sticky quick actions */}
            <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
              <div className="bg-white border rounded-full p-2 shadow flex gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded"
                >
                  New PR
                </button>
                <button
                  onClick={() => alert("Track")}
                  className="inline-flex items-center gap-2 bg-slate-50 border px-3 py-2 rounded"
                >
                  Track
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

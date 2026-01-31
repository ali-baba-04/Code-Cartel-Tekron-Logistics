import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import CreatePRModal from "../components/CreatePRModal";
import Toast from "../components/Toast";
import KPI from "../components/KPI";

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [prs, setPrs] = useState([]);
  const [kpis, setKpis] = useState({ openPRs: "—" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPrs = async () => {
      setLoading(true);
      try {
        const me = await api.get("/auth/me");
        if (me.data.role !== "USER") {
          setToast({ message: "Not authorized", variant: "error" });
          navigate("/login", { replace: true });
          setLoading(false);
          return;
        }

        const myPrsRes = await api.get("/prs/my");
        setPrs(myPrsRes.data || []);
        setKpis({ openPRs: myPrsRes.data?.length ?? 0 });
      } catch (err) {
        console.error(err);
        setToast({ message: "Failed to load PRs", variant: "error" });
        if (err?.response?.status === 401)
          navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchMyPrs();
  }, [navigate]);

  const handleCreatePR = async (pr) => {
    try {
      const res = await api.post("/prs", pr);
      setPrs((prev) => [res.data, ...prev]);
      setToast({ message: "PR created", variant: "success" });
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to create PR", variant: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-lg font-bold">LogiNav — User</div>
          <div className="space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded"
            >
              Create PR
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                navigate("/", { replace: true });
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
            >
              Logout
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
          <div>Loading your PRs...</div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPI
                title="Open PRs"
                value={kpis.openPRs}
                hint="Your pending requests"
              />
            </div>

            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold">My Recent PRs</h2>
              <div className="mt-4 space-y-2">
                {prs.length ? (
                  prs.slice(0, 8).map((p) => (
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
                        {p.status ?? "PENDING"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">No PRs yet</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;

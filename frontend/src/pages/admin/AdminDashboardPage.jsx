import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../api/adminApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AdminHeader from "../../components/common/AdminHeader";

const StatCard = ({ label, value, color = "text-gray-900", icon }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-5 py-4 sm:py-5 flex items-center gap-3 sm:gap-4">
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
      <span className="text-xl sm:text-2xl">{icon}</span>
    </div>
    <div>
      <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ lawyers: 0, active: 0, suspended: 0, listings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/admin/login"); return; }
    const fetchStats = async () => {
      try {
        const [lawyersRes, listingsRes, activeRes, suspRes] = await Promise.all([
          adminApi.getLawyers({ limit: 1 }),
          adminApi.getListings({ limit: 1 }),
          adminApi.getLawyers({ status: "active", limit: 1 }),
          adminApi.getLawyers({ status: "suspended", limit: 1 }),
        ]);
        setStats({
          lawyers: lawyersRes.data.pagination?.total || 0,
          active: activeRes.data.pagination?.total || 0,
          suspended: suspRes.data.pagination?.total || 0,
          listings: listingsRes.data.pagination?.total || 0,
        });
      } catch { /* skip */ }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [navigate]);

  if (loading) return <LoadingSpinner fullScreen text="Panel yükleniyor..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">Sistem genel durumu</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard label="Toplam Avukat" value={stats.lawyers} color="text-gray-900" icon="👥" />
          <StatCard label="Aktif Avukat" value={stats.active} color="text-green-600" icon="✅" />
          <StatCard label="Askıdaki Avukat" value={stats.suspended} color="text-amber-600" icon="⚠️" />
          <StatCard label="Toplam İlan" value={stats.listings} color="text-blue-600" icon="📋" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link to="/admin/lawyers" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 hover:border-blue-200 hover:shadow-md transition-all group">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">Avukat Yönetimi</h3>
            <p className="text-xs sm:text-sm text-gray-400">Avukat hesaplarını görüntüle, düzenle, askıya al veya sil.</p>
          </Link>
          <Link to="/admin/listings" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 hover:border-blue-200 hover:shadow-md transition-all group">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">İlan Yönetimi</h3>
            <p className="text-xs sm:text-sm text-gray-400">Tüm tevkil ilanlarını konum filtresi olmaksızın denetle.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

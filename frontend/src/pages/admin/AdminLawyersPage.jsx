import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../api/adminApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AdminHeader from "../../components/common/AdminHeader";
import { LAWYER_STATUS } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";

export default function AdminLawyersPage() {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/admin/login"); return; }
    fetchLawyers();
  }, [filter, page]);

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLawyers({ status: filter, page, limit: 20 });
      setLawyers(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { /* skip */ }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Avukat Yönetimi</h2>
            <p className="text-sm text-gray-400 mt-1">Toplam {pagination.total || 0} avukat</p>
          </div>
        </div>

        {/* Filtreler */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "active", "suspended", "deleted"].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border
                ${filter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"}`}>
              {s === "all" ? "Tümü" : LAWYER_STATUS[s]?.label || s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16"><LoadingSpinner text="Avukatlar yükleniyor..." /></div>
        ) : lawyers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400">Avukat bulunamadı.</p>
          </div>
        ) : (
          <>
            {/* Desktop tablo */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Ad Soyad</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Baro</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Durum</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Kayıt</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lawyers.map(l => (
                      <tr key={l.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{l.first_name} {l.last_name}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{l.email}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{l.bar_association || "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${LAWYER_STATUS[l.status]?.color || ""}`}>
                            {LAWYER_STATUS[l.status]?.label || l.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">{formatDate(l.created_at)}</td>
                        <td className="px-5 py-4">
                          <Link to={`/admin/lawyers/${l.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">Detay</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile card görünümü */}
            <div className="md:hidden grid gap-3">
              {lawyers.map(l => (
                <Link key={l.id} to={`/admin/lawyers/${l.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 transition-all block">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
                        {l.first_name?.[0]}{l.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{l.first_name} {l.last_name}</p>
                        <p className="text-xs text-gray-400">{l.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${LAWYER_STATUS[l.status]?.color || ""}`}>
                      {LAWYER_STATUS[l.status]?.label || l.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <span>{l.bar_association || "—"}</span>
                    <span>{formatDate(l.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Önceki</button>
                <span className="text-sm text-gray-500">{page} / {pagination.totalPages}</span>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Sonraki</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

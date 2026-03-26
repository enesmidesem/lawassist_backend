import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../api/adminApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AdminHeader from "../../components/common/AdminHeader";
import { LISTING_STATUS } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";

export default function AdminListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/admin/login"); return; }
    fetchListings();
  }, [filter, page]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getListings({ status: filter, page, limit: 20 });
      setListings(res.data.data || []);
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>İlan Yönetimi</h2>
            <p className="text-sm text-gray-400 mt-1">Toplam {pagination.total || 0} ilan</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "active", "passive", "cancelled"].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border
                ${filter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"}`}>
              {s === "all" ? "Tümü" : LISTING_STATUS[s]?.label || s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16"><LoadingSpinner text="İlanlar yükleniyor..." /></div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400">İlan bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:gap-4">
              {listings.map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">{l.title}</h3>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${LISTING_STATUS[l.status]?.color || ""}`}>
                          {LISTING_STATUS[l.status]?.label || l.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                          {l.city}
                        </span>
                        <span>{l.courthouse}</span>
                        <span>{formatDate(l.hearing_date)}</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        İlan sahibi: {l.owner_first_name} {l.owner_last_name} ({l.owner_email})
                      </p>
                      {l.description && <p className="text-xs sm:text-sm text-gray-400 mt-2 line-clamp-2">{l.description}</p>}
                    </div>
                    <Link to={`/admin/lawyers/${l.owner_id}`}
                      className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 flex-shrink-0 self-start">
                      Avukat Detay
                    </Link>
                  </div>
                </div>
              ))}
            </div>

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

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminApi from "../../api/adminApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import AdminHeader from "../../components/common/AdminHeader";
import { LAWYER_STATUS, LISTING_STATUS, APPLICATION_STATUS } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";

export default function AdminLawyerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suspendDate, setSuspendDate] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/admin/login"); return; }
    fetchLawyer();
  }, [id]);

  const fetchLawyer = async () => {
    try {
      const res = await adminApi.getLawyerById(id);
      setLawyer(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Avukat bulunamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendDate) { alert("Askı bitiş tarihi seçin."); return; }
    setActionLoading("suspend");
    try {
      await adminApi.suspendLawyer(id, { suspendUntil: suspendDate });
      fetchLawyer();
      setSuspendDate("");
    } catch (err) { alert(err.response?.data?.message || "İşlem başarısız."); }
    finally { setActionLoading(""); }
  };

  const handleDelete = async () => {
    if (!confirm("Bu avukatın hesabını silmek istediğinize emin misiniz?")) return;
    setActionLoading("delete");
    try {
      await adminApi.deleteLawyer(id);
      fetchLawyer();
    } catch (err) { alert(err.response?.data?.message || "Silme başarısız."); }
    finally { setActionLoading(""); }
  };

  if (loading) return <LoadingSpinner fullScreen text="Yükleniyor..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ErrorMessage message={error} />

        {lawyer && (
          <>
            {/* Profil */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4 sm:mb-6">
              
              {/* İnce Mavi Şerit - Diğer sayfayla uyumlu (h-12) */}
              <div className="h-12 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
              
              {/* HATA BURADAYDI: -mt sınıflarını bu ana kapsayıcıdan sildik */}
              <div className="px-4 sm:px-6 pb-5 sm:pb-6">
                <div className="flex items-end gap-3 sm:gap-4 mb-4">
                  
                  {/* AVATAR: Yukarı kaydırma (-mt-8) işlemini sadece bu kutuya verdik */}
                  <div className="-mt-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 border-4 border-white shadow flex items-center justify-center flex-shrink-0 relative z-10">
                    <span className="text-lg sm:text-xl font-bold text-white tracking-wider">
                      {lawyer.first_name?.[0]}{lawyer.last_name?.[0]}
                    </span>
                  </div>
                  
                  {/* İsim, Rozet ve Email */}
                  <div className="pb-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        {lawyer.first_name} {lawyer.last_name}
                      </h2>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${LAWYER_STATUS[lawyer.status]?.color || ""}`}>
                        {LAWYER_STATUS[lawyer.status]?.label || lawyer.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">{lawyer.email}</p>
                  </div>
                </div>

                {/* Alt Bilgiler */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm border-t border-gray-50 pt-4 mt-2">
                  <div>
                    <span className="text-xs text-gray-400">Telefon</span>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">{lawyer.phone || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Baro</span>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">{lawyer.bar_association || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Sicil No</span>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">{lawyer.bar_number || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Kayıt</span>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">{formatDate(lawyer.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Aksiyonlar */}
            {lawyer.status !== "deleted" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">Yönetim İşlemleri</h3>
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">Askıya Al — Bitiş Tarihi</label>
                      <input type="date" value={suspendDate} onChange={(e) => setSuspendDate(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <button onClick={handleSuspend} disabled={actionLoading === "suspend"}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all disabled:opacity-50">
                      {actionLoading === "suspend" ? "..." : "Askıya Al"}
                    </button>
                  </div>
                  <button onClick={handleDelete} disabled={actionLoading === "delete"}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50">
                    {actionLoading === "delete" ? "..." : "Hesabı Sil"}
                  </button>
                </div>
              </div>
            )}

            {/* İlanlar */}
            {lawyer.listings?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">İlanları ({lawyer.listings.length})</h3>
                <div className="grid gap-3">
                  {lawyer.listings.map(l => (
                    <div key={l.id} className="border border-gray-100 rounded-xl p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{l.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{l.city} — {l.courthouse} — {formatDate(l.hearing_date)}</p>
                        </div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border self-start ${LISTING_STATUS[l.status]?.color || ""}`}>
                          {LISTING_STATUS[l.status]?.label || l.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Başvuruları */}
            {lawyer.applications?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">Başvuruları ({lawyer.applications.length})</h3>
                <div className="grid gap-3">
                  {lawyer.applications.map(a => (
                    <div key={a.id} className="border border-gray-100 rounded-xl p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{a.listing_title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{a.listing_city} — {formatDate(a.listing_hearing_date)}</p>
                          {a.note && <p className="text-xs text-gray-500 mt-1 italic truncate">"{a.note}"</p>}
                        </div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border self-start ${APPLICATION_STATUS[a.status]?.color || ""}`}>
                          {APPLICATION_STATUS[a.status]?.label || a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ApplicationBadge from "../../components/common/ApplicationBadge";
import useAuth from "../../hooks/useAuth";
import listingsApi from "../../api/listingsApi";
import lawyersApi from "../../api/lawyersApi";
import { formatDate } from "../../utils/formatDate";

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Avukatın kendi ilanlarını al, her ilan için başvuruları kontrol et
      const listingsRes = await lawyersApi.getListings(user.id);
      const myListings = listingsRes.data.data?.listings || [];
      setListings(myListings);

      // Her ilan için başvuruları al
      const allApps = [];
      for (const listing of myListings) {
        try {
          const appsRes = await listingsApi.getApplications(listing.id);
          const apps = appsRes.data.data || [];
          apps.forEach(app => {
            allApps.push({ ...app, listing });
          });
        } catch {
          // Yetki yoksa skip
        }
      }
      setApplications(allApps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (listingId, applicationId) => {
    if (!confirm("Bu başvuruyu iptal etmek istediğinize emin misiniz?")) return;
    setCancellingId(applicationId);
    try {
      await listingsApi.cancelApplication(listingId, applicationId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "İptal işlemi başarısız.");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredApps = filter === "all"
    ? applications
    : applications.filter(a => a.status === filter);

  const stats = {
    all: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
    cancelled: applications.filter(a => a.status === "cancelled").length,
  };

  const tabs = [
    { key: "all", label: "Tümü", count: stats.all },
    { key: "pending", label: "Beklemede", count: stats.pending },
    { key: "approved", label: "Onaylanan", count: stats.approved },
    { key: "rejected", label: "Reddedilen", count: stats.rejected },
    { key: "cancelled", label: "İptal", count: stats.cancelled },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
            İlanlarıma Gelen Başvurular
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            İlanlarınıza yapılan başvuruları buradan yönetebilirsiniz.
          </p>
        </div>

        {loading ? (
          <div className="py-16"><LoadingSpinner text="Başvurular yükleniyor..." /></div>
        ) : (
          <>
            {/* İstatistikler */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard label="Toplam" value={stats.all} color="text-gray-900" bg="bg-gray-50" />
              <StatCard label="Beklemede" value={stats.pending} color="text-blue-600" bg="bg-blue-50" />
              <StatCard label="Onaylanan" value={stats.approved} color="text-green-600" bg="bg-green-50" />
              <StatCard label="Reddedilen" value={stats.rejected} color="text-red-500" bg="bg-red-50" />
            </div>

            {/* Filtre tabları */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border
                    ${filter === tab.key
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50"}`}>
                  {tab.label}
                  <span className={`ml-1.5 text-xs ${filter === tab.key ? "text-blue-200" : "text-gray-400"}`}>
                    ({tab.count})
                  </span>
                </button>
              ))}
            </div>

            {/* Başvurular listesi */}
            {filteredApps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">Başvuru Bulunamadı</h4>
                <p className="text-sm text-gray-400">
                  {filter === "all" ? "İlanlarınıza henüz başvuru yapılmamış." : "Bu filtreye uygun başvuru yok."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredApps.map(app => (
                  <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        {/* İlan bilgisi */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                            {app.listing?.title || "İlan"}
                          </span>
                          <ApplicationBadge status={app.status} />
                        </div>

                        {/* Başvuran bilgisi */}
                        {app.applicant && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-gray-600">
                                {app.applicant.first_name?.[0]}{app.applicant.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {app.applicant.first_name} {app.applicant.last_name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {app.applicant.bar_association} — {app.applicant.bar_number}
                              </p>
                            </div>
                          </div>
                        )}

                        {app.note && (
                          <p className="text-sm text-gray-500 italic mt-1">"{app.note}"</p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          {app.listing?.city && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {app.listing.city}
                            </span>
                          )}
                          {app.listing?.hearing_date && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                              </svg>
                              {formatDate(app.listing.hearing_date)}
                            </span>
                          )}
                          <span>Başvuru: {formatDate(app.created_at)}</span>
                        </div>
                      </div>

                      {/* Aksiyonlar */}
                      {app.status === "pending" && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleCancel(app.listing_id, app.id)}
                            disabled={cancellingId === app.id}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-all disabled:opacity-50">
                            {cancellingId === app.id ? "İptal ediliyor..." : "İptal Et"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl px-4 py-3 border border-gray-100`}>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

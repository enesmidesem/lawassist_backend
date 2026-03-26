import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import ApplicationCard from "../../components/common/ApplicationCard";
import useAuth from "../../hooks/useAuth";
import lawyersApi from "../../api/lawyersApi";
import listingsApi from "../../api/listingsApi";
import { formatDate } from "../../utils/formatDate";
import { LISTING_STATUS, TURKEY_CITIES, getCourthousesByCity } from "../../utils/constants";

export default function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [applications, setApplications] = useState({});

  const fetchListings = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await lawyersApi.getListings(user.id, filter || undefined);
      setListings(res.data.data?.listings || []);
    } catch (err) {
      setError(err.response?.data?.message || "İlanlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [user?.id, filter]);

  const fetchApplications = async (listingId) => {
    try {
      const res = await listingsApi.getApplications(listingId);
      setApplications(prev => ({ ...prev, [listingId]: res.data.data || [] }));
    } catch { /* skip */ }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!applications[id]) fetchApplications(id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu ilanı yayından kaldırmak istediğinize emin misiniz?")) return;
    try {
      await listingsApi.remove(id);
      fetchListings();
    } catch (err) {
      alert(err.response?.data?.message || "Silme başarısız.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>İlanlarım</h1>
            <p className="text-sm text-gray-400 mt-1">Tevkil ilanlarınızı yönetin</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow: "0 4px 15px rgba(37,99,235,0.25)" }}>
            {showCreate ? "Vazgeç" : "+ Yeni İlan"}
          </button>
        </div>

        {/* İlan oluşturma formu */}
        {showCreate && <CreateListingForm onCreated={() => { setShowCreate(false); fetchListings(); }} />}

        {/* Filtre tabları */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "", label: "Tümü" },
            { key: "active", label: "Aktif" },
            { key: "passive", label: "Pasif" },
            { key: "cancelled", label: "İptal" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border
                ${filter === tab.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <ErrorMessage message={error} />

        {loading ? (
          <div className="py-16"><LoadingSpinner text="İlanlar yükleniyor..." /></div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <h4 className="text-base font-semibold text-gray-900 mb-1">İlan Bulunamadı</h4>
            <p className="text-sm text-gray-400">Henüz bir ilan oluşturmadınız veya bu filtreye uygun ilan yok.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-gray-900">{listing.title}</h3>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${LISTING_STATUS[listing.status]?.color || ""}`}>
                          {LISTING_STATUS[listing.status]?.label || listing.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span>{listing.city}</span>
                        <span>{listing.courthouse}</span>
                        <span>{formatDate(listing.hearing_date)}</span>
                      </div>
                      {listing.description && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{listing.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleExpand(listing.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all">
                        {expandedId === listing.id ? "Gizle" : "Başvurular"}
                      </button>
                      {listing.status === "active" && (
                        <button onClick={() => handleDelete(listing.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-all">
                          Kaldır
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Başvurular */}
                {expandedId === listing.id && (
                  <div className="border-t border-gray-50 px-5 py-4 bg-gray-50/50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Gelen Başvurular</h4>
                    {!applications[listing.id] ? (
                      <LoadingSpinner size="sm" />
                    ) : applications[listing.id].length === 0 ? (
                      <p className="text-sm text-gray-400">Henüz başvuru yok.</p>
                    ) : (
                      <div className="grid gap-3">
                        {applications[listing.id].map(app => (
                          <ApplicationCard key={app.id} application={app}
                            onStatusChange={() => { fetchApplications(listing.id); fetchListings(); }} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function CreateListingForm({ onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", city: "", courthouse: "", hearing_date: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.city || !form.courthouse || !form.hearing_date) {
      setError("Başlık, şehir, adliye ve duruşma tarihi zorunludur."); return;
    }
    setLoading(true);
    try {
      await listingsApi.create(form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "İlan oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "'Georgia', serif" }}>Yeni İlan Oluştur</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorMessage message={error} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Başlık *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="İlan başlığı" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Açıklama</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Detaylı açıklama (opsiyonel)"
            className={`${inputClass} resize-none`} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Şehir *</label>
            <select name="city" value={form.city} onChange={(e) => { setForm({ ...form, city: e.target.value, courthouse: "" }); if (error) setError(""); }} className={`${inputClass} bg-white`}>
              <option value="">Şehir seçin</option>
              {TURKEY_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Adliye *</label>
            <select name="courthouse" value={form.courthouse} onChange={handleChange} className={`${inputClass} bg-white`} disabled={!form.city}>
              <option value="">{form.city ? "Adliye seçin" : "Önce şehir seçin"}</option>
              {getCourthousesByCity(form.city).map(ch => <option key={ch} value={ch}>{ch}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Duruşma Tarihi *</label>
            <input type="date" name="hearing_date" value={form.hearing_date} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
            {loading ? "Oluşturuluyor..." : "İlan Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
}

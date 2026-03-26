import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import TurkeyMap from "../../components/common/TurkeyMap";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import listingsApi from "../../api/listingsApi";
import { formatDate } from "../../utils/formatDate";
import { TURKEY_CITIES, getCourthousesByCity } from "../../utils/constants";

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterCourthouse, setFilterCourthouse] = useState("");
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // YENİ: Filtreler kutusuna referans oluşturuyoruz
  const filtersRef = useRef(null);

  const fetchListings = async (params = {}) => {
    setLoading(true);
    try {
      const res = await listingsApi.getAll(params);
      setListings(res.data.data || []);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setFilterCourthouse(""); // Şehir değişince adliye sıfırla
    setShowFilters(true);
    fetchListings({ city, date: filterDate || undefined });

    // YENİ: Şehir seçildiğinde filtreler kısmına yumuşakça (smooth) kaydır
    setTimeout(() => {
      filtersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100); // 100ms gecikme, menü açıldıktan sonra tam isabetle kayması için
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = {};
    if (selectedCity) params.city = selectedCity;
    if (filterDate) params.date = filterDate;
    if (filterCourthouse) params.courthouse = filterCourthouse;
    fetchListings(params);
  };

  const handleClear = () => {
    setSelectedCity("");
    setFilterDate("");
    setFilterCourthouse("");
    setListings([]);
    setSearched(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
            Tevkil İlanları
          </h1>
          <p className="text-gray-500 mt-2">
            Haritadan il seçerek veya filtreleri kullanarak size uygun tevkil ilanlarını bulun.
          </p>
        </div>

        {/* Harita Bölümü */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                Türkiye Haritası
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Bir il seçerek o şehirdeki ilanları görüntüleyin</p>
            </div>
            {selectedCity && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedCity}
                </span>
                <button onClick={handleClear}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                  Temizle
                </button>
              </div>
            )}
          </div>
          <TurkeyMap onCitySelect={handleCitySelect} selectedCity={selectedCity} />
        </div>

        {/* Filtreler */}
        {/* YENİ: ref={filtersRef} buraya eklendi. "scroll-mt-24" sınıfı Navbar'ın altında kalmaması için eklendi */}
        <div ref={filtersRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 scroll-mt-24">
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <h3 className="text-base font-semibold text-gray-900">Filtreler</h3>
              {(selectedCity || filterDate || filterCourthouse) && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  {[selectedCity, filterDate, filterCourthouse].filter(Boolean).length}
                </span>
              )}
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFilters && (
            <form onSubmit={handleSearch} className="mt-5 pt-5 border-t border-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* İl */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Şehir</label>
                  <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setFilterCourthouse(""); }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white">
                    <option value="">Tüm Şehirler</option>
                    {TURKEY_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                {/* Tarih */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Duruşma Tarihi</label>
                  <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                {/* Adliye */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Adliye</label>
                  <select value={filterCourthouse} onChange={(e) => setFilterCourthouse(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                    disabled={!selectedCity}>
                    <option value="">{selectedCity ? "Adliye seçin" : "Önce şehir seçin"}</option>
                    {getCourthousesByCity(selectedCity).map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button type="submit"
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
                  style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow: "0 4px 15px rgba(37,99,235,0.25)" }}>
                  Ara
                </button>
                <button type="button" onClick={handleClear}
                  className="px-6 py-2.5 rounded-xl text-gray-600 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-all">
                  Temizle
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sonuçlar */}
        {loading ? (
          <div className="py-16"><LoadingSpinner text="İlanlar yükleniyor..." /></div>
        ) : searched ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                {selectedCity ? `${selectedCity} İlanları` : "Tüm İlanlar"}
              </h3>
              <span className="text-sm text-gray-400">{listings.length} ilan bulundu</span>
            </div>

            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">İlan Bulunamadı</h4>
                <p className="text-sm text-gray-400">Filtreleri değiştirerek tekrar arayabilirsiniz.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "'Georgia', serif" }}>
              Haritadan Bir İl Seçin
            </h4>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Yukarıdaki haritada bir ile tıklayarak o şehirdeki aktif tevkil ilanlarını görüntüleyebilirsiniz.
              Filtreleri kullanarak sonuçları daraltabilirsiniz.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ListingCard({ listing }) {
  const [showApply, setShowApply] = useState(false);
  const [note, setNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    setApplying(true);
    setError("");
    try {
      await listingsApi.apply(listing.id, { note: note || undefined });
      setApplied(true);
      setShowApply(false);
    } catch (err) {
      setError(err.response?.data?.message || "Başvuru yapılamadı.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-gray-900 mb-2">{listing.title}</h4>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {listing.city}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
                </svg>
                {listing.courthouse}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {formatDate(listing.hearing_date)}
              </span>
            </div>
            {listing.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{listing.description}</p>
            )}
            {listing.owner && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-600">
                    {listing.owner.first_name?.[0]}{listing.owner.last_name?.[0]}
                  </span>
                </div>
                <span>
                  {listing.owner.first_name} {listing.owner.last_name}
                  {listing.owner.bar_association && ` — ${listing.owner.bar_association}`}
                </span>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            {applied ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Başvuruldu
              </span>
            ) : (
              <button onClick={() => setShowApply(!showApply)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
                Başvur
              </button>
            )}
          </div>
        </div>

        {/* Başvuru formu */}
        {showApply && !applied && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            {error && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
            )}
            <div className="flex flex-col gap-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Başvuru notunuz (opsiyonel, max 500 karakter)..."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
              <div className="flex items-center gap-2">
                <button onClick={handleApply} disabled={applying}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                  {applying ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                </button>
                <button onClick={() => { setShowApply(false); setError(""); }}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
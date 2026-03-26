import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import useAuth from "../../hooks/useAuth";
import lawyersApi from "../../api/lawyersApi";
import { formatDate } from "../../utils/formatDate";

export default function ProfilePage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await lawyersApi.getProfile(id);
        setLawyer(res.data.data.lawyer);
      } catch (err) {
        setError(err.response?.data?.message || "Profil yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    setDeleting(true);
    try {
      await lawyersApi.deleteProfile(id);
      logout();
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Silme başarısız.");
      setDeleting(false);
    }
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-0.5 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-gray-900">{value || "—"}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-16"><LoadingSpinner text="Profil yükleniyor..." /></div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : lawyer ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              
              <div className="h-12 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500"></div>
              
              <div className="px-6 sm:px-8 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
                  
                  <div className="-mt-8 w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 border-4 border-white shadow flex items-center justify-center relative z-10">
                    <span className="text-2xl font-bold text-white tracking-wider">
                      {lawyer.first_name?.[0]}{lawyer.last_name?.[0]}
                    </span>
                  </div>
                  
                  <div className="mt-2 sm:mt-0 pb-1">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                      {lawyer.first_name} {lawyer.last_name}
                    </h1>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">{lawyer.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 border-t border-gray-50 pt-6">
                  <InfoRow label="Ad" value={lawyer.first_name} />
                  <InfoRow label="Soyad" value={lawyer.last_name} />
                  <InfoRow label="Email" value={lawyer.email} />
                  <InfoRow label="Telefon" value={lawyer.phone} />
                  <InfoRow label="Baro" value={lawyer.bar_association} />
                  <InfoRow label="Sicil No" value={lawyer.bar_number} />
                  <InfoRow label="Durum" value={lawyer.status === "active" ? "Aktif" : lawyer.status} />
                  <InfoRow label="Kayıt Tarihi" value={formatDate(lawyer.created_at)} />
                </div>

                {/* Aksiyon Butonları */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end items-center gap-4">
                  {/* Hesabı Sil Butonu: İçi beyaz, dış çizgisi ve yazısı kırmızı */}
                  <button 
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full sm:w-auto px-6 py-2 border-2 border-red-600 bg-white text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all text-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? "Siliniyor..." : "Hesabı Sil"}
                  </button>
                  
                  {/* Profili Düzenle Butonu: App.jsx rotasına uygun */}
                  <Link
                    to={`/lawyers/${id}/edit`} 
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-center shadow-sm"
                  >
                    Profili Düzenle
                  </Link>
                </div>

              </div>
            </div>
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
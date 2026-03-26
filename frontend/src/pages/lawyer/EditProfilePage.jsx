import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import SubmitButton from "../../components/common/SubmitButton";
import useAuth from "../../hooks/useAuth";
import lawyersApi from "../../api/lawyersApi";

export default function EditProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", bar_association: "", bar_number: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await lawyersApi.getProfile(id);
        const l = res.data.data.lawyer;
        setForm({
          first_name: l.first_name || "", last_name: l.last_name || "",
          email: l.email || "", phone: l.phone || "",
          bar_association: l.bar_association || "", bar_number: l.bar_number || ""
        });
      } catch (err) {
        setError(err.response?.data?.message || "Profil yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await lawyersApi.updateProfile(id, form);
      const updated = res.data.data.lawyer;
      updateUser(updated);
      setSuccess("Profil başarıyla güncellendi.");
      setTimeout(() => navigate(`/lawyers/${id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Güncelleme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Profili Düzenle</h1>
          <p className="text-sm text-gray-400 mt-1">Bilgilerinizi güncelleyin</p>
        </div>

        {loading ? (
          <div className="py-16"><LoadingSpinner text="Profil yükleniyor..." /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <ErrorMessage message={error} />
              {success && (
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {success}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Ad</label>
                  <input type="text" name="first_name" value={form.first_name} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Soyad</label>
                  <input type="text" name="last_name" value={form.last_name} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Telefon</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Baro</label>
                  <input type="text" name="bar_association" value={form.bar_association} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Sicil No</label>
                  <input type="text" name="bar_number" value={form.bar_number} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <SubmitButton loading={saving} text="Kaydet" loadingText="Kaydediliyor..." />
                <button type="button" onClick={() => navigate(`/lawyers/${id}`)}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

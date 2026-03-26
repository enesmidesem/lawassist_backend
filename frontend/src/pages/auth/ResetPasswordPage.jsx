import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import authApi from "../../api/authApi";
import { ScalesIcon } from "../../components/common/ScalesLogo";
import ErrorMessage from "../../components/common/ErrorMessage";
import PasswordInput from "../../components/common/PasswordInput";
import SubmitButton from "../../components/common/SubmitButton";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password) { setError("Yeni şifre zorunludur."); return; }
    if (form.password.length < 8) { setError("Şifre en az 8 karakter olmalıdır."); return; }
    if (form.password !== form.confirmPassword) { setError("Şifreler eşleşmiyor."); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Şifre sıfırlama başarısız.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Geçersiz Bağlantı</h2>
          <p className="text-sm text-gray-500 mb-4">Şifre sıfırlama bağlantısı geçersiz veya eksik.</p>
          <Link to="/forgot-password" className="text-blue-600 font-semibold">Yeni bağlantı iste</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8"><ScalesIcon color="#1d4ed8" /></div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>LawAssist</span>
          </div>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Georgia', serif" }}>Şifre Güncellendi</h2>
            <p className="text-sm text-gray-500 mb-6">Yeni şifrenizle giriş yapabilirsiniz.</p>
            <Link to="/login" className="inline-flex px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>Giriş Yap</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2" style={{ fontFamily: "'Georgia', serif" }}>Yeni Şifre Belirle</h1>
            <p className="text-sm text-gray-400 text-center mb-6">En az 8 karakterden oluşan yeni şifrenizi girin.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <ErrorMessage message={error} />
              <PasswordInput label="Yeni Şifre" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
              <PasswordInput label="Şifre Tekrar" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
              <SubmitButton loading={loading} text="Şifreyi Güncelle" loadingText="Güncelleniyor..." />
            </form>
          </>
        )}
      </div>
    </div>
  );
}

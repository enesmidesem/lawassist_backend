import { useState } from "react";
import { Link } from "react-router-dom";
import authApi from "../../api/authApi";
import { ScalesIcon } from "../../components/common/ScalesLogo";
import ErrorMessage from "../../components/common/ErrorMessage";
import SubmitButton from "../../components/common/SubmitButton";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email adresi zorunludur."); return; }
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8"><ScalesIcon color="#1d4ed8" /></div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>LawAssist</span>
          </div>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Georgia', serif" }}>Email Gönderildi</h2>
            <p className="text-sm text-gray-500 mb-6">Kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderildi. Lütfen email kutunuzu kontrol edin.</p>
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">Giriş sayfasına dön</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2" style={{ fontFamily: "'Georgia', serif" }}>Şifremi Unuttum</h1>
            <p className="text-sm text-gray-400 text-center mb-6">Email adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <ErrorMessage message={error} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email Adresi</label>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="ornek@email.com" autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <SubmitButton loading={loading} text="Bağlantı Gönder" loadingText="Gönderiliyor..." />
            </form>
            <p className="text-sm text-center text-gray-400 mt-6">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Giriş sayfasına dön</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

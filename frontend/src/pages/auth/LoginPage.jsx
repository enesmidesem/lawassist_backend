import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import useAuth from "../../hooks/useAuth";
import { ScalesIcon } from "../../components/common/ScalesLogo";
import ErrorMessage from "../../components/common/ErrorMessage";
import PasswordInput from "../../components/common/PasswordInput";
import SubmitButton from "../../components/common/SubmitButton";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Email ve şifre zorunludur."); return; }
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { lawyer, accessToken } = res.data.data;
      login(lawyer, accessToken);
      navigate("/listings");
    } catch (err) {
      setError(err.response?.data?.message || "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sol panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 40%, #1d4ed8 70%, #2563eb 100%)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(147,197,253,0.2), transparent)" }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(191,219,254,0.15), transparent)" }} />
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.05 }} xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <div className="w-6 h-6"><ScalesIcon color="white" /></div>
          </div>
          <span className="text-white text-xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>LawAssist</span>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <h2 className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Tevkil İlan Platformu
          </h2>
          <p className="text-base text-blue-100 max-w-sm">
            Avukatların birbirine tevkil ilanı açabildiği, başvuru yapabildiği güvenilir platform.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: "📋", text: "Tevkil İlanı Oluşturun" },
              { icon: "🔍", text: "İl Bazlı Arama Yapın" },
              { icon: "✅", text: "Başvuruları Yönetin" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-left border border-white/20">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium text-blue-50">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-sm text-center text-blue-200">© 2026 LawAssist</div>
      </div>

      {/* Sağ panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8"><ScalesIcon color="#1d4ed8" /></div>
              <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>LawAssist</span>
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Giriş Yap</h1>
            <p className="text-sm text-gray-400 mt-1">Hesabınıza giriş yapın</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ErrorMessage message={error} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email Adresi</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="ornek@email.com" autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <PasswordInput label="Şifre" name="password" value={form.password} onChange={handleChange} />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Şifremi Unuttum</Link>
            </div>
            <SubmitButton loading={loading} text="Giriş Yap" loadingText="Giriş Yapılıyor..." />
          </form>
          <p className="text-sm text-center text-gray-400 mt-6">
            Hesabınız yok mu?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Kayıt Ol</Link>
          </p>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link to="/admin/login"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Yönetici Girişi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

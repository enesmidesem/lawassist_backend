import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "../../api/adminApi";
import ErrorMessage from "../../components/common/ErrorMessage";
import { ScalesIcon } from "../../components/common/ScalesLogo";

export default function AdminLoginPage() {
  const navigate = useNavigate();
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
      const res = await adminApi.login(form);
      localStorage.setItem("adminToken", res.data.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.data.admin));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 40%, #1d4ed8 70%, #2563eb 100%)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(147,197,253,0.2), transparent)" }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(191,219,254,0.15), transparent)" }} />
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.05 }} xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="agrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#agrid)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <div className="w-6 h-6"><ScalesIcon color="white" /></div>
          </div>
          <span className="text-white text-xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>LawAssist</span>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "'Georgia', serif" }}>Yönetim Paneli</h2>
            <p className="text-blue-100 max-w-sm mx-auto">Avukat hesaplarını, ilanları ve başvuruları tek merkezden yönetin.</p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: "👥", text: "Avukat Hesap Yönetimi" },
              { icon: "📋", text: "İlan Denetimi" },
              { icon: "🔒", text: "Askıya Alma ve Silme" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-left border border-white/20">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium text-blue-50">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-sm text-center text-blue-200">© 2026 LawAssist Admin Panel</div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8"><ScalesIcon color="#1d4ed8" /></div>
              <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>LawAssist</span>
            </div>
          </div>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span className="text-xs font-semibold text-blue-600">Admin Paneli</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Yönetici Girişi</h1>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ErrorMessage message={error} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email Adresi</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Admin Mailiniz" autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Şifre</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Admin Şifreniz" autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 mt-2"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow: "0 4px 15px rgba(37,99,235,0.25)" }}>
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link to="/login"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Avukat Girişi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

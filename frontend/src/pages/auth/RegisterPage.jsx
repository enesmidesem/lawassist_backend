import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import useAuth from "../../hooks/useAuth";
import { ScalesIcon } from "../../components/common/ScalesLogo";
import ErrorMessage from "../../components/common/ErrorMessage";
import PasswordInput from "../../components/common/PasswordInput";
import SubmitButton from "../../components/common/SubmitButton";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", confirmPassword: "",
    phone: "", bar_association: "", bar_number: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { first_name, last_name, email, password, confirmPassword, phone, bar_association, bar_number } = form;
    if (!first_name || !last_name || !email || !password || !phone || !bar_association || !bar_number) {
      setError("Tüm alanlar zorunludur."); return;
    }
    if (password.length < 8) { setError("Şifre en az 8 karakter olmalıdır."); return; }
    if (password !== confirmPassword) { setError("Şifreler eşleşmiyor."); return; }

    setLoading(true);
    try {
      const { confirmPassword: _, ...payload } = form;
      const res = await authApi.register(payload);
      const { lawyer, accessToken } = res.data.data;
      login(lawyer, accessToken);
      navigate("/listings");
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 40%, #1d4ed8 70%, #2563eb 100%)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(147,197,253,0.2), transparent)" }} />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <div className="w-6 h-6"><ScalesIcon color="white" /></div>
          </div>
          <span className="text-white text-xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>LawAssist</span>
        </div>
        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Georgia', serif" }}>Aramıza Katılın</h2>
          <p className="text-blue-100 max-w-sm mx-auto">Türkiye'nin en güvenilir tevkil ilan platformunda yerinizi alın.</p>
        </div>
        <div className="relative z-10 text-sm text-center text-blue-200">© 2026 LawAssist</div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="flex lg:hidden justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8"><ScalesIcon color="#1d4ed8" /></div>
              <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>LawAssist</span>
            </div>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Kayıt Ol</h1>
            <p className="text-sm text-gray-400 mt-1">Yeni hesap oluşturun</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ErrorMessage message={error} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Ad</label>
                <input type="text" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Ad"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Soyad</label>
                <input type="text" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Soyad"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="ornek@email.com" autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Telefon</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+90 5XX XXX XX XX"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Baro</label>
                <input type="text" name="bar_association" value={form.bar_association} onChange={handleChange} placeholder="Baro adı"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Baro Sicil No</label>
                <input type="text" name="bar_number" value={form.bar_number} onChange={handleChange} placeholder="Sicil numarası"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordInput label="Şifre" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
              <PasswordInput label="Şifre Tekrar" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
            </div>
            <SubmitButton loading={loading} text="Kayıt Ol" loadingText="Kayıt Yapılıyor..." />
          </form>
          <p className="text-sm text-center text-gray-400 mt-6">
            Zaten hesabınız var mı?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

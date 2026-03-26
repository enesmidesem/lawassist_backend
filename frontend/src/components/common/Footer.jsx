import { ScalesIcon } from "./ScalesLogo";

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ background: "linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Sol: Logo + açıklama */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-5"><ScalesIcon color="white" /></div>
            </div>
            <div>
              <span className="text-white text-sm font-bold" style={{ fontFamily: "'Georgia', serif" }}>
                Law<span className="font-normal">Assist</span>
              </span>
              <p className="text-blue-200/60 text-xs hidden sm:block">Avukatlar İçin Tevkil Platformu</p>
            </div>
          </div>

          {/* Orta: İletişim */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-blue-200/70">
            <span>support@lawassist.com</span>
            <span className="hidden sm:inline">•</span>
            <span>+90 528 149 273</span>
            <span className="hidden sm:inline">•</span>
            <span>Isparta, Türkiye</span>
          </div>

          {/* Sağ: Copyright */}
          <p className="text-xs text-white/30 flex-shrink-0">© 2026 LawAssist</p>
        </div>
      </div>
    </footer>
  );
}
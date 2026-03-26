export default function SubmitButton({ loading, text = "Gönder", loadingText = "İşleniyor..." }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 mt-2"
      style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow: "0 4px 15px rgba(37,99,235,0.25)" }}>
      {loading ? loadingText : text}
    </button>
  );
}

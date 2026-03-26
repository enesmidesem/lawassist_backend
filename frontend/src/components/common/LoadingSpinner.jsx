export default function LoadingSpinner({ fullScreen = false, size = "md", text = "" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg className={`animate-spin text-blue-600 ${sizes[size] || sizes.md}`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
  if (fullScreen) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white z-50">{spinner}</div>;
  }
  return spinner;
}

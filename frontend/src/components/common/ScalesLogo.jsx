export function ScalesIcon({ color = "currentColor", size = "100%" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: size, height: size }}>
      {/* Merkez direk */}
      <rect x="11" y="4.5" width="2" height="16" rx="1" fill={color} opacity="0.85" />
      {/* Taban */}
      <rect x="7" y="20" width="10" height="2" rx="1" fill={color} opacity="0.9" />
      {/* Üst yatay çubuk */}
      <rect x="3" y="3.5" width="18" height="2" rx="1" fill={color} />
      {/* Sol ip */}
      <line x1="6" y1="5.5" x2="6" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {/* Sağ ip */}
      <line x1="18" y1="5.5" x2="18" y2="9" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {/* Sol kefe */}
      <path d="M2 11 Q6 16 10 11" fill={color} opacity="0.5" />
      <ellipse cx="6" cy="11" rx="4" ry="0.8" fill={color} opacity="0.85" />
      {/* Sağ kefe */}
      <path d="M14 9 Q18 14 22 9" fill={color} opacity="0.5" />
      <ellipse cx="18" cy="9" rx="4" ry="0.8" fill={color} opacity="0.85" />
      {/* Üst daire */}
      <circle cx="12" cy="2.5" r="2" fill={color} opacity="0.9" />
    </svg>
  );
}

export default function ScalesLogo({ size = 32, color = "#1d4ed8" }) {
  return (
    <div style={{ width: size, height: size }}>
      <ScalesIcon color={color} />
    </div>
  );
}
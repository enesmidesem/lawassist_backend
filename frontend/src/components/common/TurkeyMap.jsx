import { useState, useMemo, useEffect, useRef } from 'react';
import PROVINCE_PATHS from './turkeyProvinceData';

// Türkiye illeri - bölgesel gruplar ve renkler
const REGIONS = {
  "Marmara": {
    color: "#3b82f6",
    cities: ["İstanbul", "Bursa", "Kocaeli", "Balıkesir", "Tekirdağ", "Edirne", "Kırklareli", "Çanakkale", "Sakarya", "Yalova", "Bilecik"]
  },
  "Ege": {
    color: "#8b5cf6",
    cities: ["İzmir", "Aydın", "Denizli", "Muğla", "Manisa", "Kütahya", "Afyonkarahisar", "Uşak"]
  },
  "Akdeniz": {
    color: "#f59e0b",
    cities: ["Antalya", "Mersin", "Adana", "Hatay", "Osmaniye", "Kahramanmaraş", "Isparta", "Burdur"]
  },
  "İç Anadolu": {
    color: "#ef4444",
    cities: ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas", "Yozgat", "Kırşehir", "Kırıkkale", "Aksaray", "Nevşehir", "Niğde", "Karaman", "Çankırı"]
  },
  "Karadeniz": {
    color: "#22c55e",
    cities: ["Samsun", "Trabzon", "Ordu", "Tokat", "Çorum", "Amasya", "Giresun", "Rize", "Artvin", "Gümüşhane", "Bayburt", "Sinop", "Kastamonu", "Bartın", "Karabük", "Zonguldak", "Bolu", "Düzce"]
  },
  "Doğu Anadolu": {
    color: "#06b6d4",
    cities: ["Erzurum", "Malatya", "Elazığ", "Van", "Erzincan", "Ağrı", "Kars", "Iğdır", "Ardahan", "Muş", "Bitlis", "Bingöl", "Tunceli", "Hakkari"]
  },
  "Güneydoğu Anadolu": {
    color: "#ec4899",
    cities: ["Gaziantep", "Şanlıurfa", "Diyarbakır", "Mardin", "Batman", "Siirt", "Şırnak", "Kilis", "Adıyaman"]
  }
};

// İl isim eşleştirme (SVG dosyasındaki isimler -> mevcut isimler)
const NAME_MAP = {
  "Hakkâri": "Hakkari"
};

// SVG'deki isme göre bölgesel isimleri eşleştir
const getDisplayName = (svgName) => NAME_MAP[svgName] || svgName;
const getSvgName = (displayName) => {
  for (const [svg, display] of Object.entries(NAME_MAP)) {
    if (display === displayName) return svg;
  }
  return displayName;
};

export default function TurkeyMap({ onCitySelect, selectedCity }) {
  const [hoveredCity, setHoveredCity] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
  // Merkez noktaları için yeni state ve ref
  const [pathCenters, setPathCenters] = useState({});
  const mapRef = useRef(null);

  const getCityRegion = (city) => {
    const displayName = getDisplayName(city);
    for (const [region, data] of Object.entries(REGIONS)) {
      if (data.cities.includes(displayName)) return { region, color: data.color };
    }
    return { region: "Bilinmeyen", color: "#94a3b8" };
  };

  // SVG render olduktan sonra gerçek sınır kutusunun merkezini hesapla
  useEffect(() => {
    if (!mapRef.current) return;
    
    const centers = {};
    const groups = mapRef.current.querySelectorAll('.province-group');
    
    groups.forEach(group => {
      const name = group.getAttribute('data-name');
      if (name) {
        // getBBox() o ilin ekranda kapladığı gerçek dikdörtgeni verir
        const bbox = group.getBBox();
        centers[name] = { 
          x: bbox.x + (bbox.width / 2), 
          y: bbox.y + (bbox.height / 2) 
        };
      }
    });
    
    setPathCenters(centers);
  }, []);

  return (
    <div className="w-full">
      {/* Bölge Legend */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {Object.entries(REGIONS).map(([name, data]) => (
          <button key={name}
            onMouseEnter={() => setHoveredRegion(name)}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer
              ${hoveredRegion === name ? 'shadow-md scale-105' : 'hover:shadow-sm'}`}
            style={{
              borderColor: data.color + '40',
              background: hoveredRegion === name ? data.color + '15' : 'white',
              color: data.color
            }}>
            <span className="w-2 h-2 rounded-full" style={{ background: data.color }} />
            <span className="font-medium">{name}</span>
            <span className="text-gray-400">({data.cities.length})</span>
          </button>
        ))}
      </div>

      {/* SVG Harita */}
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-gray-100 p-4 overflow-hidden">
        {/* Arka plan deseni */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e40af" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapGrid)" />
        </svg>

        <svg ref={mapRef} viewBox="0 0 1005 490" className="w-full h-auto relative z-10">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* İl sınırları */}
          {Object.entries(PROVINCE_PATHS).map(([svgName, data]) => {
            const displayName = getDisplayName(svgName);
            const { color } = getCityRegion(svgName);
            const isSelected = selectedCity === displayName;
            const isHovered = hoveredCity === displayName;
            const isRegionHovered = hoveredRegion && REGIONS[hoveredRegion]?.cities.includes(displayName);
            const isActive = isSelected || isHovered || isRegionHovered;
            const paths = data.paths || [data.path];

            return (
              <g key={svgName}
                data-name={svgName}
                className="province-group cursor-pointer"
                onClick={() => onCitySelect(displayName)}
                onMouseEnter={(e) => {
                  setHoveredCity(displayName);
                  const svgEl = e.currentTarget.closest('svg');
                  const pt = svgEl.createSVGPoint();
                  pt.x = e.clientX;
                  pt.y = e.clientY;
                  const svgPt = pt.matrixTransform(svgEl.getScreenCTM().inverse());
                  setTooltipPos({ x: svgPt.x, y: svgPt.y });
                }}
                onMouseLeave={() => setHoveredCity(null)}
                style={{ transition: 'all 0.15s ease' }}>
                {paths.map((pathD, i) => (
                  <path
                    key={i}
                    d={pathD}
                    fill={isActive ? color + (isSelected ? 'cc' : '99') : color + '40'}
                    stroke={isActive ? color : '#94a3b8'}
                    strokeWidth={isActive ? 1.5 : 0.8}
                    strokeLinejoin="round"
                    style={{
                      transition: 'all 0.15s ease',
                      filter: isSelected ? 'url(#glow)' : 'none'
                    }}
                  />
                ))}
              </g>
            );
          })}

          {/* Hover/Selected durumda il adı etiketi */}
          {(hoveredCity || selectedCity) && (() => {
            const city = hoveredCity || selectedCity;
            const svgName = getSvgName(city);
            const center = pathCenters[svgName]; // Doğrudan BBox merkezini kullanıyoruz
            const { color } = getCityRegion(svgName);
            
            if (!center) return null;

            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={center.x - city.length * 4.5 - 8}
                  y={center.y - 14}
                  width={city.length * 9 + 16}
                  height={22}
                  rx="4"
                  fill="white"
                  stroke={color}
                  strokeWidth="1"
                  filter="url(#shadow)"
                  opacity="0.95"
                />
                <text
                  x={center.x}
                  y={center.y + 1}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={color}
                  fontFamily="system-ui"
                  style={{ pointerEvents: 'none' }}
                >
                  {city}
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Tooltip */}
        {hoveredCity && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-100 z-20">
            <p className="text-xs font-semibold text-gray-900">{hoveredCity}</p>
            <p className="text-[10px] text-gray-400">{getCityRegion(getSvgName(hoveredCity)).region} Bölgesi</p>
            <p className="text-[10px] text-blue-500 mt-0.5">Tıklayarak ilanları görüntüle</p>
          </div>
        )}
      </div>
    </div>
  );
}
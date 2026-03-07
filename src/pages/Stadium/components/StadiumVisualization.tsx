
import { Card, CardContent } from "@/components/ui/card";
import { StadiumData } from "@/hooks/useStadiumData";
import { useLanguage } from "@/contexts/LanguageContext";

interface StadiumVisualizationProps {
  stadium: StadiumData;
}

const MAX_CAPACITY = 80000;
const ROWS = 12;

// Colors
const C = {
  terraces: '#3b82f6', // blue-500
  basic: '#10b981', // emerald-500
  roof: '#f59e0b', // amber-500
  vip: '#a855f7', // purple-500
  empty: '#1e293b', // slate-800
  emptyStr: '#334155', // slate-700
};

interface HStandProps {
  x: number; y: number; w: number; h: number;
  filledRows: number; color: string; fromBottom: boolean;
}
const HStand = ({ x, y, w, h, filledRows, color, fromBottom }: HStandProps) => {
  const rowH = h / ROWS;
  return (
    <>
      {Array.from({ length: ROWS }, (_, i) => {
        const filled = fromBottom ? i >= ROWS - filledRows : i < filledRows;
        return (
          <rect key={i} x={x + 1} y={y + i * rowH + 0.5}
            width={w - 2} height={Math.max(rowH - 1.5, 1)}
            fill={filled ? color : C.empty}
            stroke={filled ? 'none' : C.emptyStr}
            strokeWidth={0.5} rx={1} />
        );
      })}
    </>
  );
};

interface VStandProps {
  x: number; y: number; w: number; h: number;
  filledCols: number; color: string; fromRight: boolean;
}
const VStand = ({ x, y, w, h, filledCols, color, fromRight }: VStandProps) => {
  const colW = w / ROWS;
  return (
    <>
      {Array.from({ length: ROWS }, (_, i) => {
        const filled = fromRight ? i >= ROWS - filledCols : i < filledCols;
        return (
          <rect key={i} x={x + i * colW + 0.5} y={y + 1}
            width={Math.max(colW - 1.5, 1)} height={h - 2}
            fill={filled ? color : C.empty}
            stroke={filled ? 'none' : C.emptyStr}
            strokeWidth={0.5} rx={1} />
        );
      })}
    </>
  );
};

export const StadiumVisualization = ({ stadium }: StadiumVisualizationProps) => {
  const { t } = useLanguage();
  const cap = stadium?.stadium_capacity ?? 2500;

  // Estándar: Gradas=2000(80%), Básicos=480(19.2%), Cubiertos=20(0.8%), VIP=0
  const terraces = Math.floor(cap * 0.80);   // tribuna norte — azul
  const basicSeats = Math.floor(cap * 0.192);  // esquinas — morado
  const roofSeats = Math.floor(cap * 0.008);  // laterales E/O — ámbar
  const vipSeats = 0;                         // tribuna sur — verde (inicia vacía)

  const tRows = Math.ceil(Math.min(terraces / (MAX_CAPACITY * 0.80), 1) * ROWS);
  const bRows = Math.ceil(Math.min(basicSeats / (MAX_CAPACITY * 0.192), 1) * ROWS);
  const rCols = Math.ceil(Math.min(roofSeats / (MAX_CAPACITY * 0.008), 1) * ROWS);

  // Layout (viewBox 420×340):
  // Pitch: (80,78) 260×184
  // North stand (terraces): (80,5) 260×68
  // South stand (basic):    (80,267) 260×68
  // West stand (roof):      (5,78) 70×184
  // East stand (roof):      (345,78) 70×184
  // VIP corners: 4 × (70×68)

  return (
    <Card className="h-full">
      <CardContent className="p-3 pb-2">
        <svg viewBox="0 0 420 340" className="w-full" style={{ maxHeight: '370px' }}>
          {/* Background */}
          <rect width="420" height="340" fill="#0f172a" rx="8" />

          {/* ── STANDS ── */}
          {/* Corners – Asientos básicos (filas proporcionales) */}
          <HStand x={5} y={5} w={70} h={68} filledRows={bRows} color={C.vip} fromBottom={true} />
          <HStand x={345} y={5} w={70} h={68} filledRows={bRows} color={C.vip} fromBottom={true} />
          <HStand x={5} y={267} w={70} h={68} filledRows={bRows} color={C.vip} fromBottom={false} />
          <HStand x={345} y={267} w={70} h={68} filledRows={bRows} color={C.vip} fromBottom={false} />

          {/* North – Terraces */}
          <HStand x={80} y={5} w={260} h={68} filledRows={tRows} color={C.terraces} fromBottom={true} />
          {/* South – Palcos VIP (inicia vacío) */}
          <HStand x={80} y={267} w={260} h={68} filledRows={0} color={C.basic} fromBottom={false} />
          {/* West – Seats under roof */}
          <VStand x={5} y={78} w={70} h={184} filledCols={rCols} color={C.roof} fromRight={false} />
          {/* East – Seats under roof */}
          <VStand x={345} y={78} w={70} h={184} filledCols={rCols} color={C.roof} fromRight={true} />

          {/* ── PITCH ── */}
          {/* Grass stripes */}
          <rect x={80} y={78} width={260} height={184} fill="#166534" />
          {[0, 1, 2, 3, 4, 5].map(i => (
            <rect key={i} x={80 + i * 43.4} y={78} width={21.7} height={184} fill="#15803d" />
          ))}
          {/* Pitch outline */}
          <rect x={80} y={78} width={260} height={184} fill="none" stroke="white" strokeWidth={1.5} opacity={0.9} />
          {/* Center line */}
          <line x1={210} y1={78} x2={210} y2={262} stroke="white" strokeWidth={1} opacity={0.9} />
          {/* Center circle */}
          <circle cx={210} cy={170} r={28} fill="none" stroke="white" strokeWidth={1} opacity={0.9} />
          <circle cx={210} cy={170} r={2} fill="white" opacity={0.9} />
          {/* Left penalty area */}
          <rect x={80} y={127} width={50} height={86} fill="none" stroke="white" strokeWidth={1} opacity={0.9} />
          <rect x={80} y={148} width={20} height={44} fill="none" stroke="white" strokeWidth={1} opacity={0.9} />
          <circle cx={116} cy={170} r={1.5} fill="white" opacity={0.9} />
          {/* Right penalty area */}
          <rect x={290} y={127} width={50} height={86} fill="none" stroke="white" strokeWidth={1} opacity={0.9} />
          <rect x={320} y={148} width={20} height={44} fill="none" stroke="white" strokeWidth={1} opacity={0.9} />
          <circle cx={304} cy={170} r={1.5} fill="white" opacity={0.9} />
          {/* Corner arcs */}
          <path d="M80,86 A8,8 0 0,1 88,78" fill="none" stroke="white" strokeWidth={1} opacity={0.9} />
          <path d="M332,78 A8,8 0 0,1 340,86" fill="none" stroke="white" strokeWidth={1} opacity={0.9} />
          <path d="M88,262 A8,8 0 0,1 80,254" fill="none" stroke="white" strokeWidth={1} opacity={0.9} />
          <path d="M340,254 A8,8 0 0,1 332,262" fill="none" stroke="white" strokeWidth={1} opacity={0.9} />
          {/* Goals */}
          <rect x={68} y={158} width={12} height={24} fill="none" stroke="white" strokeWidth={1.5} opacity={0.9} />
          <rect x={340} y={158} width={12} height={24} fill="none" stroke="white" strokeWidth={1.5} opacity={0.9} />

          {/* ── CAPACITY LABELS ON STANDS ── */}
          <text x={210} y={45} textAnchor="middle" fill="white" fontSize={9} opacity={0.85} fontFamily="sans-serif">
            {terraces.toLocaleString()}
          </text>
          <text x={210} y={305} textAnchor="middle" fill="white" fontSize={9} opacity={0.85} fontFamily="sans-serif">
            {vipSeats.toLocaleString()}
          </text>
          <text x={40} y={173} textAnchor="middle" fill="white" fontSize={8} opacity={0.85} fontFamily="sans-serif"
            transform="rotate(-90,40,173)">{roofSeats.toLocaleString()}</text>
          <text x={380} y={173} textAnchor="middle" fill="white" fontSize={8} opacity={0.85} fontFamily="sans-serif"
            transform="rotate(90,380,173)">{roofSeats.toLocaleString()}</text>
        </svg>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 px-1">
          {[
            { color: C.terraces, label: t('stadium.terraces'), count: terraces },
            { color: C.vip, label: t('stadium.basicSeating'), count: basicSeats },
            { color: C.roof, label: t('stadium.seatsUnderRoof'), count: roofSeats },
            { color: C.basic, label: t('stadium.vipBoxes'), count: vipSeats },
          ].map(({ color, label, count }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
              <span className="text-xs text-muted-foreground truncate">
                {label} — {count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

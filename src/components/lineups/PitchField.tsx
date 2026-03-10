
interface PitchFieldProps {
  onPositionClick?: (zoneIndex: number, positionIndex: number) => void;
}

const PitchField = ({ onPositionClick }: PitchFieldProps) => {
  // Definir las 26 posiciones del campo (coordenadas relativas en %)
  const positions = [
    // ZONA 1 - ULTRADEFENSIVA (6 posiciones)
    { x: 5, y: 50, zone: 1, label: 'POR' },          // 0: Portero
    { x: 12, y: 50, zone: 1, label: 'LIB' },         // 1: Líbero/5º defensa
    { x: 12, y: 35, zone: 1, label: 'DFC' },         // 2: Defensa central izq
    { x: 12, y: 65, zone: 1, label: 'DFC' },         // 3: Defensa central der
    { x: 12, y: 15, zone: 1, label: 'LI' },          // 4: Lateral izquierdo
    { x: 12, y: 85, zone: 1, label: 'LD' },          // 5: Lateral derecho
    
    // ZONA 2 - DEFENSIVA (5 posiciones)
    { x: 25, y: 20, zone: 2, label: 'DEF' },         // 6
    { x: 25, y: 35, zone: 2, label: 'DEF' },         // 7
    { x: 25, y: 50, zone: 2, label: 'DEF' },         // 8
    { x: 25, y: 65, zone: 2, label: 'DEF' },         // 9
    { x: 25, y: 80, zone: 2, label: 'DEF' },         // 10
    
    // ZONA 3 - MEDIA (5 posiciones)
    { x: 45, y: 20, zone: 3, label: 'MC' },          // 11
    { x: 45, y: 35, zone: 3, label: 'MC' },          // 12
    { x: 45, y: 50, zone: 3, label: 'MC' },          // 13
    { x: 45, y: 65, zone: 3, label: 'MC' },          // 14
    { x: 45, y: 80, zone: 3, label: 'MC' },          // 15
    
    // ZONA 4 - OFENSIVA (5 posiciones)
    { x: 65, y: 20, zone: 4, label: 'MP' },          // 16
    { x: 65, y: 35, zone: 4, label: 'MP' },          // 17
    { x: 65, y: 50, zone: 4, label: 'MP' },          // 18
    { x: 65, y: 65, zone: 4, label: 'MP' },          // 19
    { x: 65, y: 80, zone: 4, label: 'MP' },          // 20
    
    // ZONA 5 - FINALIZACIÓN (5 posiciones)
    { x: 85, y: 20, zone: 5, label: 'DEL' },         // 21
    { x: 85, y: 35, zone: 5, label: 'DEL' },         // 22
    { x: 85, y: 50, zone: 5, label: 'DEL' },         // 23
    { x: 85, y: 65, zone: 5, label: 'DEL' },         // 24
    { x: 85, y: 80, zone: 5, label: 'DEL' },         // 25
  ];

  return (
    <div className="relative w-full bg-green-700" style={{ paddingBottom: '66.67%' }}>
      {/* Campo de fútbol (proporción 3:2) */}
      <div className="absolute inset-0">
        {/* Líneas del campo */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 66.67">
          {/* Césped con franjas */}
          <defs>
            <pattern id="stripes" x="0" y="0" width="20" height="100%" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="10" height="100%" fill="rgba(34, 197, 94, 0.3)" />
              <rect x="10" y="0" width="10" height="100%" fill="rgba(34, 197, 94, 0.5)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="66.67" fill="url(#stripes)" />
          
          {/* Líneas blancas del campo */}
          <g stroke="white" strokeWidth="0.3" fill="none">
            {/* Perímetro */}
            <rect x="2" y="2" width="96" height="62.67" />
            
            {/* Línea central */}
            <line x1="50" y1="2" x2="50" y2="64.67" />
            
            {/* Círculo central */}
            <circle cx="50" cy="33.33" r="8" />
            
            {/* Área grande izquierda */}
            <rect x="2" y="16.67" width="16" height="33.33" />
            
            {/* Área pequeña izquierda */}
            <rect x="2" y="24.67" width="6" height="17.33" />
            
            {/* Área grande derecha */}
            <rect x="82" y="16.67" width="16" height="33.33" />
            
            {/* Área pequeña derecha */}
            <rect x="92" y="24.67" width="6" height="17.33" />
            
            {/* Punto de penalti izquierdo */}
            <circle cx="12" cy="33.33" r="0.5" fill="white" />
            
            {/* Punto de penalti derecho */}
            <circle cx="88" cy="33.33" r="0.5" fill="white" />
          </g>
        </svg>

        {/* Posiciones (círculos interactivos) */}
        {positions.map((pos, idx) => (
          <div
            key={idx}
            onClick={() => onPositionClick?.(pos.zone, idx)}
            className="absolute bg-white/20 hover:bg-white/40 border-2 border-white rounded-full cursor-pointer flex items-center justify-center transition-all"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: '40px',
              height: '40px',
              transform: 'translate(-50%, -50%)',
            }}
            title={`${pos.label} - Zona ${pos.zone}`}
          >
            <span className="text-xs text-white font-bold">{idx + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PitchField;

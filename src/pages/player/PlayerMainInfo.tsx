
import { Badge } from "@/components/ui/badge";

interface PlayerMainInfoProps {
  player: any;
  formatMoney: (v: number) => string;
  formatAge: (age: number) => string;
}
export default function PlayerMainInfo({ player, formatMoney, formatAge }: PlayerMainInfoProps) {
  return (
    <div className="flex-1 flex flex-col gap-2 px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-blue-100 pb-2 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-3xl font-extrabold text-blue-900 drop-shadow-xs">{player.name}</span>
            <Badge className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 font-bold text-xs tracking-wide shadow-sm">{player.position}</Badge>
            <span className="text-[13px] text-blue-400 font-mono">#{player.id}</span>
          </div>
          <div className="flex gap-3 text-[14px] text-blue-500 mt-2 flex-wrap">
            <span>{player.nationality}</span>
            <span>| Age: <span className="text-blue-800">{player.age}</span></span>
            <span>| {formatAge(player.age)}</span>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-0">
          <span className="text-sm text-blue-700">
            Contract: <span className="font-semibold">{player.contract}</span>
          </span>
          <span className="text-sm text-blue-700">
            Value: <span className="font-semibold">{formatMoney(player.value)}</span>
          </span>
          <span className="text-sm text-blue-700">
            Wage: <span className="font-semibold">{formatMoney(player.wage)}/week</span>
          </span>
        </div>
      </div>
    </div>
  );
}

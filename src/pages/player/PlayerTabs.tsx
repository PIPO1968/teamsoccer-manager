
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PlayerTabsProps {
  player: any;
  skillMap: any;
  skillDescriptor: (level: number) => any;
  formatMoney: (val: number) => string;
}

export default function PlayerTabs({ player, skillMap, skillDescriptor, formatMoney }: PlayerTabsProps) {
  return (
    <Tabs defaultValue="profile" className="mt-2">
      <TabsList className="bg-gradient-to-l from-blue-100 via-blue-50 to-white border border-blue-200 rounded-t-md flex gap-3 p-0 h-10">
        <TabsTrigger className="text-blue-700 data-[state=active]:bg-white data-[state=active]:font-bold" value="profile">Profile</TabsTrigger>
        <TabsTrigger className="text-blue-700 data-[state=active]:bg-white data-[state=active]:font-bold" value="skills">Skills</TabsTrigger>
        <TabsTrigger className="text-blue-700 data-[state=active]:bg-white data-[state=active]:font-bold" value="stats">Stats</TabsTrigger>
      </TabsList>
      <div className="border border-t-0 border-blue-200 rounded-b-md bg-gradient-to-b from-white to-blue-50 p-4">
        <TabsContent value="profile">
          {/* General info */}
          <section>
            <div className="mb-2 text-blue-900 flex flex-col gap-1 text-sm">
              <span>
                <span className="font-semibold">Personality:</span>{" "}
                <span className="font-medium text-blue-700">{player.personality}</span>
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-[14px] text-blue-800 mb-2">
              <span>
                Owner <span className="font-semibold text-blue-800">Super Football</span>
                <span className="text-blue-400 font-medium"> (since 18-04-2025)</span>
              </span>
            </div>
            <div className="flex items-center text-[14px] text-blue-600 gap-3 mt-2">
              <span>
                <span className="font-medium text-blue-700">Form:</span>
                <span className="ml-1 rounded bg-blue-100 text-blue-700 font-semibold px-2 py-0.5">passable</span>
              </span>
              <span className="ml-3">
                <span className="font-medium text-blue-700">Fitness:</span>
                <span className="ml-1 rounded bg-blue-50 text-blue-800 font-semibold px-2 py-0.5">{player.fitness}%</span>
              </span>
              <span className="ml-3">
                <span className="font-medium text-blue-700">Rating:</span>
                <span className="ml-1 font-semibold">{player.rating}/100</span>
              </span>
            </div>
            <div className="flex gap-6 mt-3">
              <div className="flex flex-col items-start text-[13px] gap-1 text-blue-900">
                <span>Goals</span>
                <span className="font-medium">{player.goals}</span>
              </div>
              <div className="flex flex-col items-start text-[13px] gap-1 text-blue-900">
                <span>Assists</span>
                <span className="font-medium">{player.assists}</span>
              </div>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="skills">
          {/* Skills grid */}
          <div className="w-full max-w-md">
            <div className="flex flex-col gap-1 mt-2">
              {skillMap.map((sk: any) => {
                const value = player.skills[sk.name];
                const desc = skillDescriptor(value);
                return (
                  <div key={sk.name} className="flex items-center gap-2 px-1 py-0.5">
                    <span className="w-28 text-blue-700 text-sm">{sk.label}</span>
                    <span className={`text-[12px] font-semibold rounded px-2 ${desc.color}`}>{desc.name}</span>
                    <span className="w-6 text-right font-mono text-slate-400 text-xs">{value}</span>
                    <div className="flex-1 h-2 rounded bg-blue-100 ml-3">
                      <div
                        className={`h-2 rounded ${desc.color}`}
                        style={{ width: `${(value / 20) * 100}%`, minWidth: 12 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="stats">
          <div className="text-blue-800 text-sm space-y-1">
            <div>
              <span className="font-semibold">Career goals: </span>
              <span>{player.goals}</span>
            </div>
            <div>
              <span className="font-semibold">Career assists: </span>
              <span>{player.assists}</span>
            </div>
            <div>
              <span className="font-semibold">Market Value: </span>
              <span>{formatMoney(player.value)}</span>
            </div>
            <div>
              <span className="font-semibold">Contract: </span>
              <span>{player.contract}</span>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}

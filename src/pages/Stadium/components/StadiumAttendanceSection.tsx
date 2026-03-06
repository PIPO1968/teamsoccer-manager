import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { StadiumMatch } from "@/hooks/useStadiumMatches";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface StadiumAttendanceSectionProps {
    matches: StadiumMatch[];
    stadiumCapacity: number;
}

// Deterministic attendance based on match_id (55–93% of capacity)
const getAttendance = (matchId: number, capacity: number): number => {
    const seed = ((matchId * 7919 + 31337) ^ (matchId >> 3)) & 0xff;
    const pct = 0.55 + (seed % 38) / 100;
    return Math.floor(capacity * pct);
};

const getEarnings = (attendance: number): number => attendance * 18;

const formatDate = (dateString: string) => {
    try {
        return format(parseISO(dateString), "dd/MM/yyyy");
    } catch {
        return "—";
    }
};

export const StadiumAttendanceSection = ({
    matches,
    stadiumCapacity,
}: StadiumAttendanceSectionProps) => {
    const { t } = useLanguage();

    // Only completed matches, last 10
    const played = matches
        .filter((m) => m.status === "completed")
        .slice(0, 10);

    return (
        <Card className="w-full">
            <CardHeader className="bg-gray-50/50">
                <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                    <Users className="h-5 w-5 shrink-0" />
                    {t("stadium.playedAndAttendance")}
                    {played.length > 0 && (
                        <span className="ml-1 text-sm text-gray-500 font-normal">
                            ({played.length} {t("stadium.matches")})
                        </span>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                {played.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">{t("stadium.noPlayedMatches")}</p>
                    </div>
                ) : (
                    <>
                        {/* Header row */}
                        <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <div className="col-span-2">{/* date */}</div>
                            <div className="col-span-5 text-center">Match</div>
                            <div className="col-span-2 text-center flex items-center justify-center gap-1">
                                <Users className="h-3 w-3" />{t("stadium.spectators")}
                            </div>
                            <div className="col-span-2 text-center flex items-center justify-center gap-1">
                                <TrendingUp className="h-3 w-3" />{t("stadium.earnings")}
                            </div>
                            <div className="col-span-1" />
                        </div>

                        <div className="divide-y divide-gray-100">
                            {played.map((match, idx) => {
                                const attendance = getAttendance(match.match_id, stadiumCapacity);
                                const earnings = getEarnings(attendance);
                                const pct = Math.round((attendance / stadiumCapacity) * 100);

                                return (
                                    <div
                                        key={match.match_id}
                                        className={`flex flex-col md:grid md:grid-cols-12 gap-2 items-center px-6 py-4 hover:bg-gray-50/60 transition-colors ${idx === 0 ? "border-t-0" : ""}`}
                                    >
                                        {/* Date */}
                                        <div className="md:col-span-2 text-xs text-gray-500 font-medium w-full md:w-auto">
                                            {formatDate(match.match_date)}
                                        </div>

                                        {/* Teams + score */}
                                        <div className="md:col-span-5 w-full">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="font-semibold text-gray-900 text-right flex-1 text-sm truncate">
                                                    {match.home_team_name}
                                                </span>
                                                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg min-w-[70px] justify-center shrink-0">
                                                    <span className="font-bold text-base">
                                                        {match.home_score} – {match.away_score}
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-gray-900 text-left flex-1 text-sm truncate">
                                                    {match.away_team_name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Attendance */}
                                        <div className="md:col-span-2 flex flex-col items-center gap-0.5">
                                            <span className="font-semibold text-gray-800 text-sm">
                                                {attendance.toLocaleString()}
                                            </span>
                                            <div className="w-full max-w-[80px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-green-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400">{pct}%</span>
                                        </div>

                                        {/* Earnings */}
                                        <div className="md:col-span-2 text-center">
                                            <span className="font-semibold text-emerald-700 text-sm">
                                                £{earnings.toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Link */}
                                        <div className="md:col-span-1 flex items-center justify-end">
                                            <Link
                                                to={`/match/${match.match_id}`}
                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                                            >
                                                {t("stadium.viewMatch")}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

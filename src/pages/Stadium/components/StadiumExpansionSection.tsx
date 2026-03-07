import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { apiFetch } from "@/services/apiClient";
import { useAuth } from "@/contexts/AuthContext";

interface StadiumExpansionSectionProps {
    stadiumId: number;
    teamId: number;
    currentCapacity: number;
    cashBalance: number;
    currentStanding?: number;
    currentBasic?: number;
    currentCovered?: number;
    currentVip?: number;
    onExpanded: () => void;
}

const SEAT_TYPES = [
    {
        key: "standingSeats" as const,
        label: "Gradas",
        description: "Zonas de pie sin asiento",
        price: 80,
        incomePerSeat: 15,
        maxTotal: 50000,
        color: "bg-gray-100 border-gray-300",
        badgeColor: "bg-gray-200 text-gray-700",
        icon: "🏟️",
    },
    {
        key: "basicSeats" as const,
        label: "Asientos básicos",
        description: "Butacas descubiertas",
        price: 150,
        incomePerSeat: 30,
        maxTotal: 20000,
        color: "bg-blue-50 border-blue-200",
        badgeColor: "bg-blue-100 text-blue-700",
        icon: "💺",
    },
    {
        key: "coveredSeats" as const,
        label: "Asientos cubiertos",
        description: "Butacas bajo techo",
        price: 300,
        incomePerSeat: 55,
        maxTotal: 9500,
        color: "bg-green-50 border-green-200",
        badgeColor: "bg-green-100 text-green-700",
        icon: "🏠",
    },
    {
        key: "vipSeats" as const,
        label: "Palcos VIP",
        description: "Asientos premium con servicios",
        price: 1500,
        incomePerSeat: 150,
        maxTotal: 500,
        color: "bg-yellow-50 border-yellow-200",
        badgeColor: "bg-yellow-100 text-yellow-700",
        icon: "⭐",
    },
] as const;

type SeatKey = typeof SEAT_TYPES[number]["key"];

const MAX_CAPACITY = 80000;

export const StadiumExpansionSection = ({
    stadiumId,
    teamId,
    currentCapacity,
    cashBalance,
    currentStanding = 0,
    currentBasic = 0,
    currentCovered = 0,
    currentVip = 0,
    onExpanded,
}: StadiumExpansionSectionProps) => {
    const { manager } = useAuth();
    const [seats, setSeats] = useState<Record<SeatKey, number>>({
        standingSeats: 0,
        basicSeats: 0,
        coveredSeats: 0,
        vipSeats: 0,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

    const isOwner = manager?.team_id === teamId;

    // Asientos ya existentes por tipo
    const existingByKey: Record<SeatKey, number> = {
        standingSeats: currentStanding,
        basicSeats: currentBasic,
        coveredSeats: currentCovered,
        vipSeats: currentVip,
    };

    // Límite restante por tipo = maxTotal - ya existentes
    const remainingByKey = (key: SeatKey) => {
        const seatType = SEAT_TYPES.find(s => s.key === key)!;
        return Math.max(0, seatType.maxTotal - existingByKey[key]);
    };

    const totalNewSeats = Object.values(seats).reduce((a, b) => a + b, 0);
    const totalCost =
        seats.standingSeats * 80 +
        seats.basicSeats * 150 +
        seats.coveredSeats * 300 +
        seats.vipSeats * 1500;
    const newCapacity = currentCapacity + totalNewSeats;
    const hasEnoughMoney = cashBalance >= totalCost;
    const exceedsMax = newCapacity > MAX_CAPACITY;

    // Verificar si algún tipo supera su límite individual
    const typeOverLimit = SEAT_TYPES.find(s => seats[s.key] > remainingByKey(s.key));

    const formatMoney = (n: number) =>
        `€${n.toLocaleString("es-ES")}`;

    const handleChange = (key: SeatKey, value: string) => {
        const max = remainingByKey(key);
        const num = Math.min(max, Math.max(0, parseInt(value) || 0));
        setSeats((prev) => ({ ...prev, [key]: num }));
        setMessage(null);
    };

    const handleExpand = async () => {
        if (!manager) return;
        if (totalNewSeats <= 0) {
            setMessage({ type: "warning", text: "Añade al menos un asiento para continuar." });
            return;
        }
        if (typeOverLimit) {
            setMessage({ type: "warning", text: `Has superado el tope de ${SEAT_TYPES.find(s => s.key === typeOverLimit.key)!.maxTotal.toLocaleString()} para ${typeOverLimit.label}.` });
            return;
        }
        if (exceedsMax) {
            setMessage({ type: "warning", text: `La capacidad máxima del estadio es ${MAX_CAPACITY.toLocaleString()} asientos.` });
            return;
        }
        if (!hasEnoughMoney) {
            setMessage({
                type: "error",
                text: `Saldo insuficiente. Tienes ${formatMoney(cashBalance)} y la obra cuesta ${formatMoney(totalCost)}.`,
            });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const res = await apiFetch<{ success: boolean; newCapacity: number; totalCost: number }>(
                `/stadiums/${stadiumId}/expand`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        managerId: manager.user_id,
                        ...seats,
                    }),
                }
            );
            setMessage({
                type: "success",
                text: `¡Ampliación completada! Nueva capacidad: ${res.newCapacity.toLocaleString()} asientos. Coste: ${formatMoney(res.totalCost)}.`,
            });
            setSeats({ standingSeats: 0, basicSeats: 0, coveredSeats: 0, vipSeats: 0 });
            onExpanded();
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Error al ampliar el estadio." });
        } finally {
            setLoading(false);
        }
    };

    if (!isOwner) return null;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-orange-500" />
                    Ampliar estadio
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Resumen actual */}
                <div className="flex flex-wrap gap-4 text-sm bg-muted/50 rounded-lg p-3">
                    <div>
                        <span className="text-muted-foreground">Capacidad actual: </span>
                        <span className="font-semibold">{currentCapacity.toLocaleString()} asientos</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Máximo: </span>
                        <span className="font-semibold">{MAX_CAPACITY.toLocaleString()} asientos</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Presupuesto disponible: </span>
                        <span className="font-semibold text-green-600">{formatMoney(cashBalance)}</span>
                    </div>
                </div>

                {/* Selectores por tipo de asiento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SEAT_TYPES.map((seatType) => (
                        <div
                            key={seatType.key}
                            className={`border rounded-lg p-3 space-y-2 ${seatType.color}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-1 font-medium text-sm">
                                        <span>{seatType.icon}</span>
                                        {seatType.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{seatType.description}</div>
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${seatType.badgeColor}`}>
                                        {formatMoney(seatType.price)}/asiento
                                    </span>
                                    <span className="text-xs text-emerald-600 font-medium">
                                        +€{seatType.incomePerSeat}/partido
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={0}
                                        max={remainingByKey(seatType.key)}
                                        value={seats[seatType.key] || ""}
                                        onChange={(e) => handleChange(seatType.key, e.target.value)}
                                        placeholder="0"
                                        className="h-8 text-sm bg-white"
                                        disabled={remainingByKey(seatType.key) === 0}
                                    />
                                    {seats[seatType.key] > 0 && (
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            = {formatMoney(seats[seatType.key] * seatType.price)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {existingByKey[seatType.key].toLocaleString()} / {seatType.maxTotal.toLocaleString()} ocupados
                                    {remainingByKey(seatType.key) === 0 && <span className="text-red-500 font-medium ml-1">(tope alcanzado)</span>}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resumen del presupuesto */}
                {totalNewSeats > 0 && (
                    <div className={`rounded-lg p-3 border text-sm space-y-1 ${hasEnoughMoney && !exceedsMax ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                        <div className="flex items-center gap-2 font-medium">
                            <TrendingUp className="h-4 w-4" />
                            Resumen de la obra
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 text-muted-foreground">
                            <span>Asientos nuevos:</span>
                            <span className="font-medium text-foreground">+{totalNewSeats.toLocaleString()}</span>
                            <span>Capacidad resultante:</span>
                            <span className={`font-medium ${exceedsMax ? "text-red-600" : "text-foreground"}`}>
                                {newCapacity.toLocaleString()} {exceedsMax && "(¡supera el máximo!)"}
                            </span>
                            <span>Coste total:</span>
                            <span className={`font-medium ${!hasEnoughMoney ? "text-red-600" : "text-green-600"}`}>
                                {formatMoney(totalCost)}
                            </span>
                            <span>Saldo tras la obra:</span>
                            <span className={`font-medium ${cashBalance - totalCost < 0 ? "text-red-600" : "text-green-600"}`}>
                                {formatMoney(cashBalance - totalCost)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Mensajes de estado */}
                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"} className={message.type === "success" ? "border-green-300 bg-green-50 text-green-800" : message.type === "warning" ? "border-yellow-300 bg-yellow-50 text-yellow-800" : ""}>
                        {message.type === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                            <AlertTriangle className="h-4 w-4" />
                        )}
                        <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                )}

                {/* Botón confirmar */}
                <Button
                    onClick={handleExpand}
                    disabled={loading || totalNewSeats === 0 || exceedsMax || !hasEnoughMoney || !!typeOverLimit}
                    className="w-full"
                >
                    {loading ? "Procesando obra..." : totalCost > 0 ? `Confirmar ampliación — ${formatMoney(totalCost)}` : "Selecciona asientos para ampliar"}
                </Button>

                {!hasEnoughMoney && totalNewSeats > 0 && (
                    <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        No tienes suficiente presupuesto. Te faltan {formatMoney(totalCost - cashBalance)}.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

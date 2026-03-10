// countryTimezones.ts
// Mapa de zonas horarias IANA por país para TeamSoccer
// England es la base (Europe/London)

export const COUNTRY_TIMEZONES: Record<string, string> = {
    Spain: "Europe/Madrid",
    France: "Europe/Paris",
    Germany: "Europe/Berlin",
    Italy: "Europe/Rome",
    Portugal: "Europe/Lisbon",
    Netherlands: "Europe/Amsterdam",
    Belgium: "Europe/Brussels",
    Greece: "Europe/Athens",
    Austria: "Europe/Vienna",
    Finland: "Europe/Helsinki",
    Ireland: "Europe/Dublin",
    Luxembourg: "Europe/Luxembourg",
    Slovakia: "Europe/Bratislava",
    Slovenia: "Europe/Ljubljana",
    Croatia: "Europe/Zagreb",
    Cyprus: "Asia/Nicosia",
    Malta: "Europe/Malta",
    Estonia: "Europe/Tallinn",
    Latvia: "Europe/Riga",
    Lithuania: "Europe/Vilnius",
    Montenegro: "Europe/Podgorica",
    Kosovo: "Europe/Belgrade",
    England: "Europe/London",
    Scotland: "Europe/London",
    Wales: "Europe/London",
    "Northern Ireland": "Europe/London",
    Switzerland: "Europe/Zurich",
    Sweden: "Europe/Stockholm",
    Norway: "Europe/Oslo",
    Denmark: "Europe/Copenhagen",
    Poland: "Europe/Warsaw",
    "Czech Republic": "Europe/Prague",
    Hungary: "Europe/Budapest",
    Romania: "Europe/Bucharest",
    Bulgaria: "Europe/Sofia",
    Serbia: "Europe/Belgrade",
    Turkey: "Europe/Istanbul",
    Russia: "Europe/Moscow",
    Ukraine: "Europe/Kyiv",
    Belarus: "Europe/Minsk",
    Iceland: "Atlantic/Reykjavik",
    Albania: "Europe/Tirane",
    "North Macedonia": "Europe/Skopje",
    "Bosnia and Herzegovina": "Europe/Sarajevo",
    Georgia: "Asia/Tbilisi",
    Armenia: "Asia/Yerevan",
    Azerbaijan: "Asia/Baku",
    Moldova: "Europe/Chisinau",
    // ...agregar más países según sea necesario
};

export function getTimezoneForCountry(countryName: string | null | undefined): string {
    if (!countryName) return "Europe/London"; // Default England
    return COUNTRY_TIMEZONES[countryName] || "Europe/London";
}

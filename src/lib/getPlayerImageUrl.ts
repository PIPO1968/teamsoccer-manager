// Genera imagen única para un jugador usando DiceBear (seed = nombre completo)
// Aplica rasgos físicos según la nacionalidad del equipo.
export function getPlayerImageUrl(nationalityName: string, firstName = 'Player', lastName = 'One'): string {
    const seed = encodeURIComponent(`${firstName}${lastName}`);
    const base = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

    const country = nationalityName?.toLowerCase();

    if (country === 'spain' || country === 'españa') {
        return `${base}&skinColor=tanned,cream&hairColor=black,brown,brown2`;
    }
    if (country === 'england' || country === 'uk') {
        return `${base}&skinColor=pale,light,cream&hairColor=blonde,brown,auburn`;
    }
    if (country === 'france') {
        return `${base}&skinColor=tanned,brown,cream&hairColor=black,brown,brown2`;
    }
    if (country === 'brazil' || country === 'brasil') {
        return `${base}&skinColor=tanned,brown&hairColor=black,brown`;
    }
    if (country === 'germany' || country === 'alemania') {
        return `${base}&skinColor=pale,light,cream&hairColor=blonde,blonde2,brown`;
    }
    if (country === 'italy' || country === 'italia') {
        return `${base}&skinColor=tanned,cream&hairColor=black,brown,brown2`;
    }
    if (country === 'portugal') {
        return `${base}&skinColor=tanned,cream&hairColor=black,brown`;
    }
    // Default: sin restricciones → máxima variedad
    return base;
}

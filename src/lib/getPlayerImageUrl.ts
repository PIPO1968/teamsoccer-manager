// Utilidad para asignar imagen automáticamente a un jugador según país
import { playerImageCatalog } from "../data/playerImageCatalog";

export function getPlayerImageUrl(nationalityName: string): string {
    const entry = playerImageCatalog[nationalityName];
    if (entry && entry.imagenes.length > 0) {
        // Selecciona una imagen aleatoria del catálogo de ese país
        const idx = Math.floor(Math.random() * entry.imagenes.length);
        return entry.imagenes[idx];
    }
    // Imagen por defecto si no hay imágenes para ese país
    return "/teamsoccer-assets/players/default.png";
}

# ⚽ Soccer Manager

Juego manager de fútbol online multijugador — un juego de gestión de equipos de fútbol construido con React + TypeScript + Vite.

## Características

- **Dashboard** — Vista general de la temporada: posición en la liga, puntos, presupuesto, resultados recientes, próximos partidos y máximo goleador
- **Gestión del equipo** — Plantilla con tarjetas de jugador (valoración, velocidad, tiro, pase, defensa), venta de jugadores y visor interactivo del campo con selección de formación (4-4-2, 4-3-3, 3-5-2)
- **Liga** — Tabla de clasificación completa con zonas (Champions/descenso) y registro de resultados
- **Mercado de fichajes** — Compra y vende jugadores según tu presupuesto disponible
- **Motor de juego** — Simulación de partidos con asignación de goles/asistencias y actualización automática de la clasificación
- **Persistencia** — El estado del juego se guarda automáticamente en `localStorage`

## Tecnologías

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (Button, Card, Badge, Progress, Tabs)
- [React Router](https://reactrouter.com/)
- [lucide-react](https://lucide.dev/)

## Inicio rápido

```sh
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

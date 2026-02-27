# TeamSoccer Manager — Guía Oficial

## Descripción General

TeamSoccer Manager es un simulador de gestión de equipos de fútbol online. Como manager, tomarás decisiones estratégicas sobre alineaciones, tácticas, entrenamiento, finanzas, transferencias y competiciones. La web está disponible en varios idiomas gracias al traductor integrado en el encabezado.

---

## Guía Rápida para Nuevos Usuarios

### 1. Primeros pasos
- Obtén tu licencia de manager y crea tu equipo.
- Configura tu primera alineación y observa el próximo partido (en vivo o grabado) para entender el motor de juego y el rendimiento de tus jugadores.

### 2. Jugadores y habilidades
- Los jugadores envejecen cada 16 semanas (una temporada).
- Las habilidades físicas (velocidad y forma física) son esenciales para todos.
- Cada posición requiere habilidades específicas (ver guía detallada por posición).
- Existen habilidades especiales que afectan el rendimiento según clima y eventos.

### 3. Entrenamiento
- Dos fases: entrenamiento libre (por partidos jugados) y entrenamiento personalizado en el gimnasio del club.
- La intensidad, tipo de entrenador y edad influyen en la mejora y fatiga.

### 4. Partidos y calendario
- Diversos tipos de partidos: torneos personalizados, amistosos, copas, ligas y competiciones internacionales.
- El calendario semanal está estructurado por continente y tipo de competición.

### 5. Ligas y copas
- Estructura de divisiones y grupos, con ascensos, descensos y playoffs.
- Trofeos para los mejores clasificados.

### 6. Estadio y finanzas
- Cada club tiene su propio estadio, cuya gestión afecta ingresos y gastos.
- El club inicia con $1,000,000 y debe evitar caer en déficit prolongado.

### 7. Mercado de transferencias
- Subastas de jugadores por 72 horas, con extensión automática si hay pujas en los últimos minutos.
- El dinero se descuenta al pujar y se devuelve si otro manager supera la oferta.

### 8. Retos y amistosos
- Permiten entrenar jugadores menos habituales y probar tácticas.

### 9. Motor de partidos
- Simula duelos de habilidades entre jugadores (regate, disparo, físico).
- Acciones: despeje, conducción, pase, centro, disparo.
- Factores extra: habilidades especiales y clima.

### 10. Selecciones nacionales y competiciones de salas
- Sistema de nominaciones y elecciones para entrenadores nacionales.
- Competiciones exclusivas para salas y coleccionismo de logos.

### 11. Premium y TScredits
- Acceso a funciones avanzadas, torneos exclusivos, personalización y compra de TScredits para salas privadas y coleccionables.

---

## Documentación Técnica (Desarrolladores)

### Arquitectura

- **Frontend:** React + Vite, hooks personalizados, consumo de API Express.
- **Backend:** Express.js, Railway PostgreSQL, endpoints REST para todas las operaciones.
- **Autenticación:** Basada en endpoints propios, sin Supabase.
- **Internacionalización:** Traductor de idiomas en el header, compatible con cualquier país.

### Endpoints principales

- `/api/managers/:id` — Datos y gestión de managers
- `/api/teams/:id` — Datos de equipos
- `/api/teams/:id/trophies` — Trofeos de equipo
- `/api/transfer-listings` — Mercado de transferencias
- `/api/training/assignments` — Asignaciones de entrenamiento
- `/api/payments/create-checkout` — Pagos y premium
- `/api/forums/threads` — Foros y creación de hilos
- `/api/news` — Noticias y gestión de artículos

### Ejemplo de uso de endpoint

```ts
// Obtener datos de manager
const response = await fetch('/api/managers/123');
const data = await response.json();
console.log(data.manager);
```

### Checklist de migración

- [x] Eliminar todas las referencias a Supabase en frontend y backend.
- [x] Migrar hooks y páginas principales a API Express.
- [x] Probar todos los endpoints y flujos de usuario.
- [x] Actualizar documentación y README.
- [x] Eliminar dependencias y archivos de Supabase.

---

¿Dudas, sugerencias o problemas? Utiliza el foro de soporte o el sistema de contacto en la web.

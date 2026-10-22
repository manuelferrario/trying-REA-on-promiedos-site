# Promiedos v2

Un clon de [promiedos.com.ar](https://www.promiedos.com.ar/) en React + Vite, reconstruido con
**ingeniería inversa** usando [REA (Reverse Engineer Anything)](https://github.com/morluto/rea).

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

## Ingeniería inversa

REA se conectó por Chrome DevTools Protocol al sitio real e inspeccionó su página, sus scripts y sus datos.
El informe completo, con comandos, endpoints y formatos de datos, está en
[`docs/REA-ANALISIS.md`](docs/REA-ANALISIS.md). En resumen:

- El sitio es **Next.js (Pages Router)** con Redux Toolkit y **SWR**.
- Los datos vienen de `api.promiedos.com.ar` (`/games/{fecha}`, `/league/tables_and_fixtures/{id}`,
  `/league/games/{id}/{fecha}`, `/gamecenter/{id}`, `/menu/`).
- Los partidos en vivo se actualizan con **polling**, no con WebSocket: cada respuesta trae un `TTL` y el
  cliente vuelve a pedir los datos cuando vence.

## Cómo lo replica esta app

| Sitio real | Promiedos v2 |
| --- | --- |
| API `api.promiedos.com.ar` | `src/api/client.js`: mismos endpoints y misma forma de datos, respondidos por un simulador local |
| `useSWR(…, { refreshInterval: TTL * 1000, revalidateOnFocus })` | `src/lib/usePolling.js` |
| Rutas `/`, `/ayer`, `/man`, `/games/dd-mm-yyyy`, `/league/…`, `/game/…`, `/team/…` | Las mismas rutas, con hash (`#/league/liga-profesional/hc`) |
| Tablas: columnas PTS, J, Gol, +/-, G, E, P, Últimas (V/E/D) y colores de destino | `src/components/StandingsTable.jsx`, dibujado a partir de `columns` y `rows` |
| Menú lateral por país, TODOS / VIVO (n), bloques por liga con "Sección de …" | `Sidebar.jsx`, `GamesPage.jsx` |

## Datos

Los resultados son **simulados** (`src/data/engine.js`): fixture todos contra todos, goles con un modelo de
Poisson según la fuerza de cada equipo y una semilla fija por partido, así que se ven igual en cada visita.
Los partidos en vivo avanzan con la hora real. Los jugadores son nombres inventados.

La API de Promiedos es privada y usarla en una app pública probablemente vaya contra sus términos. Para usar
datos reales, reemplazá las funciones de `src/api/client.js` por `fetch` a una fuente con la misma forma.

## Estructura

```
docs/REA-ANALISIS.md  informe de ingeniería inversa
src/
  api/client.js       endpoints con la forma de la API real (simulados)
  data/               catálogo de ligas y simulador de temporada
  lib/                polling con TTL, router por hash, RNG con semilla
  components/         Sidebar, GameRow, StandingsTable, Crest
  pages/              GamesPage, LeaguePage, GamePage, TeamPage
```

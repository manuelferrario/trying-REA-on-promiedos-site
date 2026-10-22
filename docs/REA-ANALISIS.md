# Ingeniería inversa de promiedos.com.ar con REA

Análisis hecho el 22-10-2026 con [REA (Reverse Engineer Anything)](https://github.com/morluto/rea) v6.7.0,
conectado por Chrome DevTools Protocol a un Chromium headless que tenía abierto `https://www.promiedos.com.ar/`.

## Cómo se hizo

| Paso | Comando REA | Qué devolvió |
| --- | --- | --- |
| 1. Inspección de la página | `rea inspect-web-page http://127.0.0.1:9222 <target> --include-json-body-shapes` | DOM (1931 nodos), 12 scripts, 17 recursos, `localStorage` (`badgeDisplayData`), 2 pedidos a otro origen filtrados por política |
| 2. Captura de scripts | `rea inspect-web-page … --include-script-sources` | Código fuente de los 12 scripts |
| 3. Exportación | `rea export-web-scripts <captura.json> <dir>` | Scripts verificados en disco + manifiesto |
| 4. Análisis estático | `rea analyze-javascript-application <dir>` | Grafo de módulos, candidatos de endpoints (`fetch`, `WebSocket`) y rutas |

`rea analyze-web-bundle` se quedó sin memoria (6 GB) con estos bundles, así que se usó el camino
`export-web-scripts` + `analyze-javascript-application`, que da el mismo análisis estático.

`api.promiedos.com.ar` estaba bloqueado por la red del entorno, así que la forma de las respuestas se
tomó de `__NEXT_DATA__`: los datos iniciales que Next.js incrusta en el HTML, con el mismo formato que la API.

## Hallazgos

### Arquitectura

- **Next.js con Pages Router.** Los chunks viven en `/_next/static/chunks/pages/…`. Cada página se renderiza
  en el servidor y llega con sus datos en `__NEXT_DATA__`.
- **Redux Toolkit** para el estado (`createSlice`: `league`, `gameCenter`, `team`, `filter`, `sound`…).
- **SWR** para pedir datos desde el cliente.
- Imágenes de equipos: `https://api.promiedos.com.ar/images/team/{id}/{tamaño}`.

### API (`https://api.promiedos.com.ar`)

El cliente elige la URL según el entorno: `prod → api.promiedos.com.ar`, `dev/local → apidev.promiedos.com.ar`.
Todos los pedidos mandan la cabecera `X-VER` con la versión de la app (`1.11.7.x`).

| Endpoint | Uso |
| --- | --- |
| `GET /games/today` · `/games/{dd-mm-yyyy}` | Partidos del día agrupados por liga |
| `GET /league/tables_and_fixtures/{leagueId}` | Tablas, filtros de fecha y estadísticas de jugadores |
| `GET /league/games/{leagueId}/{filterKey}` | Partidos de una fecha (`latest` = actuales, `72_228_3_N` = Fecha N) |
| `GET /gamecenter/{gameId}` | Detalle de un partido (`{ game, TTL }`) |
| `GET /menu/` | Menú lateral (categorías por país) |
| `GET /local/config` | Configuración regional, se vuelve a pedir con `setInterval` |

### Cómo se actualizan los partidos en vivo

**Con polling, no con WebSocket.** La portada usa SWR así:

```js
useSWR(`${API}/games/${path}`, fetcher, {
  fallbackData: initialData,            // lo que vino del servidor
  revalidateOnFocus: true,              // refresca al volver a la pestaña
  refreshInterval: initialData ? initialData.TTL * 1000 : 10000,
})
```

Es decir, **el servidor decide cada cuánto se refresca** con el campo `TTL` (en segundos): en la captura valía
600 cuando no había partidos en vivo. El único `WebSocket` del bundle es el de recarga en caliente (HMR)
de Next.js en desarrollo.

### Rutas del sitio (de `_buildManifest.js`)

`/`, `/ayer`, `/man`, `/games/[dd-mm-yyyy]`, `/league/[urlName]/[id]` (+ `/equipos`, `/historial`),
`/game/[url]/[id]` (+ `/lineups`), `/team/[name]/[id]`, `/calendario`, `/tablahistorica`.

### Forma de los datos

Partido (`games[]`):

```ts
{
  id: string, url_name: string,
  teams: [{ id, name, short_name, url_name, colors: { color, text_color }, red_cards }],  // ×2
  scores?: [number, number], agg_scores?: [number, number], description: string,       // "Global 0 - 0"
  status: { enum: number, name: string, short_name: string, symbol_name: string },      // 1 = "Prog."
  start_time: "dd-mm-yyyy HH:mm",
  game_time: number,                     // -1 si no empezó
  game_time_to_display: string,
  game_time_status_to_display: string,   // "Prog.", minuto, "Final"…
  winner: number,                        // -1 sin ganador
  tv_networks: [{ id, name }],
}
```

Tabla (`tables_groups[].tables[].table`):

```ts
{
  is_live: boolean,
  destinations: [{ num, color, name }],                 // p. ej. #03A9F4 "Octavos de Final"
  columns: [{ key, title, type, is_bold? }],            // Points/PTS, GamePlayed/J, Goals/Gol ("20:10"),
                                                        // Ratio/+/-, GamesWon/G, GamesEven/E, GamesLost/P, {trend}/Últimas
  rows: [{ num, entity: { type, object: equipo }, values: [{ key, value }], destination_color? }],
}
// {trend}: [1, 2, 1, 1, 1] → 1 = victoria, 2 = empate, 3 = derrota
```

## Cómo se usó en Promiedos v2

- `src/api/client.js` expone **los mismos endpoints con la misma forma de datos** que la API real,
  respondidos por el simulador local.
- `src/lib/usePolling.js` replica el patrón de SWR: datos al montar, refresco cada `TTL` segundos y al volver a la pestaña.
- Las rutas, tablas (columnas, racha V/E/D, colores de destino) y la portada (TODOS / VIVO, Ayer / Hoy / Mañana)
  siguen la estructura del sitio real.

Los datos siguen siendo simulados: la API de Promiedos es privada y usarla en una app pública
probablemente vaya contra sus términos. Para conectar una fuente real basta con reemplazar las funciones
de `src/api/client.js` por `fetch` a un servicio con la misma forma de datos.

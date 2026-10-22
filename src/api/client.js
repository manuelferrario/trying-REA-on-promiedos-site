// Mock of the promiedos.com.ar API (see docs/REA-ANALISIS.md).
//
// Each function mirrors one real endpoint and returns data with the same
// shape the real API returns, including the `TTL` field the client uses to
// decide when to poll again. Responses are computed from the local season
// simulator instead of the network.

import { SEASON, matchState, standings, startOfDay, topScorers } from '../data/engine.js'
import { LEAGUES, LEAGUE_BY_API_ID } from '../data/leagues.js'

const DAY = 24 * 60 * 60 * 1000

// TTL in seconds: short while something is live, long otherwise (the real API sent 600 with nothing live).
const TTL_LIVE = 15
const TTL_IDLE = 300

const STATUS = {
  scheduled: { enum: 1, name: 'Prog.', short_name: 'Prog.', symbol_name: 'Prog.' },
  live: { enum: 2, name: 'En juego', short_name: 'Vivo', symbol_name: 'Vivo' },
  finished: { enum: 3, name: 'Finalizado', short_name: 'Final', symbol_name: 'Fin' },
}

const DESTINATION_COLORS = { qualify: '#03A9F4', secondary: '#FF9800', relegation: '#E53935' }

const TREND = { G: 1, E: 2, P: 3 }

const pad = (n) => String(n).padStart(2, '0')

/** 'dd-mm-yyyy', the date format used in /games/{date} and start_time. */
export function formatDateKey(ts) {
  const d = new Date(ts)
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
}

export function parseDateKey(key) {
  const [d, m, y] = key.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

function slug(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), 120 + Math.random() * 180))
}

function toTeam(team, redCards = 0) {
  return {
    id: team.id,
    name: team.name,
    short_name: team.name,
    abbr: team.short,
    url_name: slug(team.name),
    colors: { color: team.colors[0], text_color: team.colors[1] },
    red_cards: redCards,
  }
}

function toLeague(league) {
  return {
    id: league.apiId,
    name: league.fullName,
    url_name: league.urlName,
    country_name: league.country,
    flag: league.flag,
    is_international: false,
  }
}

function toGame(match, now) {
  const st = matchState(match, now)
  const reds = (side) => st.events.filter((e) => e.type === 'red' && e.side === side).length
  const d = new Date(match.kickoff)
  const start = `${formatDateKey(match.kickoff)} ${pad(d.getHours())}:${pad(d.getMinutes())}`

  let winner = -1
  if (st.status === 'finished') winner = st.score.home > st.score.away ? 1 : st.score.home < st.score.away ? 2 : 0

  return {
    id: match.id,
    url_name: `${slug(match.home.name)}-vs-${slug(match.away.name)}`,
    league_id: LEAGUES.find((l) => l.id === match.leagueId).apiId,
    round: match.round,
    teams: [toTeam(match.home, reds('home')), toTeam(match.away, reds('away'))],
    scores: st.score ? [st.score.home, st.score.away] : null,
    status: STATUS[st.status],
    start_time: start,
    game_time: st.status === 'scheduled' ? -1 : st.minute,
    game_time_to_display: st.status === 'live' ? st.clock : '',
    game_time_status_to_display:
      st.status === 'scheduled' ? 'Prog.' : st.status === 'finished' ? 'Final' : st.clock,
    winner,
  }
}

const isLive = (games) => games.some((g) => g.status.enum === STATUS.live.enum)

/** GET /games/{today | dd-mm-yyyy} */
export function getGames(dateKey) {
  const now = Date.now()
  const day = dateKey === 'today' ? startOfDay(now) : parseDateKey(dateKey)
  const leagues = LEAGUES.map((league) => ({
    ...toLeague(league),
    games: SEASON.matches.filter((m) => m.leagueId === league.id && m.day === day).map((m) => toGame(m, now)),
  })).filter((l) => l.games.length > 0)
  const all = leagues.flatMap((l) => l.games)
  return delay({ leagues, TTL: isLive(all) ? TTL_LIVE : TTL_IDLE })
}

function standingsTable(league, group) {
  const destinations = league.zones.map((z, i) => ({
    num: i + 1,
    color: DESTINATION_COLORS[z.kind],
    name: z.label,
  }))
  const destinationFor = (pos, size) => {
    const i = league.zones.findIndex((z) => pos >= z.from && pos <= Math.min(z.to, size))
    return i === -1 ? undefined : destinations[i].color
  }
  return {
    is_live: group.rows.some((r) => r.live),
    destinations,
    columns: [
      { key: 'Points', title: 'PTS', type: 1, is_bold: true },
      { key: 'GamePlayed', title: 'J', type: 1 },
      { key: 'Goals', title: 'Gol', type: 1 },
      { key: 'Ratio', title: '+/-', type: 1 },
      { key: 'GamesWon', title: 'G', type: 1 },
      { key: 'GamesEven', title: 'E', type: 1 },
      { key: 'GamesLost', title: 'P', type: 1 },
      { key: '{trend}', title: 'Últimas', type: 3 },
    ],
    rows: group.rows.map((r, i) => ({
      num: i + 1,
      entity: { type: 1, object: { ...toTeam(r.team), playing_now: r.live } },
      destination_color: destinationFor(i + 1, group.rows.length),
      values: [
        { key: 'GamePlayed', value: String(r.pj) },
        { key: 'Goals', value: `${r.gf}:${r.gc}` },
        { key: 'Ratio', value: String(r.dif) },
        { key: 'Points', value: String(r.pts) },
        { key: 'GamesWon', value: String(r.pg) },
        { key: 'GamesEven', value: String(r.pe) },
        { key: 'GamesLost', value: String(r.pp) },
        { key: '{trend}', value: r.form.map((f) => TREND[f]) },
      ],
    })),
  }
}

function cardTable(league, type, now) {
  const tally = new Map()
  for (const m of SEASON.matches) {
    if (m.leagueId !== league.id) continue
    for (const e of matchState(m, now).events) {
      if (e.type !== type) continue
      const team = e.side === 'home' ? m.home : m.away
      const key = `${team.id}|${e.player}`
      const row = tally.get(key) ?? { player: e.player, team, count: 0 }
      row.count++
      tally.set(key, row)
    }
  }
  return [...tally.values()].sort((a, b) => b.count - a.count || a.player.localeCompare(b.player)).slice(0, 15)
}

const playerRow = (num, player, team, value, key) => ({
  num,
  entity: { type: 2, object: { name: player, team_id: team.id, team: toTeam(team) } },
  values: [{ key, value: String(value) }],
})

/** GET /league/tables_and_fixtures/{leagueId} */
export function getLeague(apiId) {
  const league = LEAGUE_BY_API_ID[apiId]
  if (!league) return Promise.reject(new Error('Liga no encontrada'))
  const now = Date.now()
  const groups = standings(league, now, true)
  const tables = groups.map((g) => ({ name: g.name ?? 'Tabla', table: standingsTable(league, g) }))

  const filters = [{ name: 'Partidos actuales', key: 'latest' }]
  for (let r = 1; r <= league.rounds; r++) filters.push({ name: `Fecha ${r}`, key: `${league.apiId}_${r}` })

  const scorers = topScorers(league, now)
  return delay({
    TTL: tables.some((t) => t.table.is_live) ? TTL_LIVE : TTL_IDLE,
    league: toLeague(league),
    tables_groups: [{ name: league.season, tables }],
    games: { filters },
    players_statistics: {
      tables: [
        {
          name: 'Goles',
          columns: [{ key: 'Goals', title: 'Goles', type: 1, is_bold: true }],
          rows: scorers.map((s, i) => playerRow(i + 1, s.player, s.team, s.goals, 'Goals')),
        },
        {
          name: 'Tarjetas Amarillas',
          columns: [{ key: 'Yellow', title: 'Amarillas', type: 1, is_bold: true }],
          rows: cardTable(league, 'yellow', now).map((r, i) => playerRow(i + 1, r.player, r.team, r.count, 'Yellow')),
        },
        {
          name: 'Tarjetas Rojas',
          columns: [{ key: 'Red', title: 'Rojas', type: 1, is_bold: true }],
          rows: cardTable(league, 'red', now).map((r, i) => playerRow(i + 1, r.player, r.team, r.count, 'Red')),
        },
      ],
    },
  })
}

/** GET /league/games/{leagueId}/{filterKey} — 'latest' is the current round. */
export function getLeagueGames(apiId, key) {
  const league = LEAGUE_BY_API_ID[apiId]
  const round = key === 'latest' ? league.currentRound : Number(key.split('_').pop())
  const now = Date.now()
  const matches = SEASON.matches.filter((m) => m.leagueId === league.id && m.round === round)
  const games = matches.map((m) => ({ ...toGame(m, now), group: league.groups[m.group].name }))
  const playing = new Set(matches.flatMap((m) => [m.home.id, m.away.id]))
  const free = league.teams.filter((t) => !playing.has(t.id)).map((t) => toTeam(t))
  return delay({ round, games, free, TTL: isLive(games) ? TTL_LIVE : TTL_IDLE })
}

const EVENT_LABEL = { goal: 'Gol', penalty: 'Gol de penal', 'own-goal': 'Gol en contra', yellow: 'Amarilla', red: 'Roja' }

/** GET /gamecenter/{gameId} */
export function getGameCenter(id) {
  const match = SEASON.matches.find((m) => m.id === id)
  if (!match) return Promise.reject(new Error('Partido no encontrado'))
  const now = Date.now()
  const st = matchState(match, now)
  const league = LEAGUES.find((l) => l.id === match.leagueId)
  const game = {
    ...toGame(match, now),
    league: toLeague(league),
    stage_round_name: `Fecha ${match.round}${league.groups[match.group].name ? ` · ${league.groups[match.group].name}` : ''}`,
    events: st.events.map((e) => ({
      type: e.type,
      name: EVENT_LABEL[e.type],
      time: e.minute,
      team: e.side === 'home' ? 1 : 2,
      player: e.player,
    })),
    statistics: st.stats.map((s) => ({ name: s.label, values: [s.home, s.away], unit: s.unit ?? '' })),
    players: { home: match.home.squad, away: match.away.squad },
  }
  return delay({ game, TTL: st.status === 'live' ? TTL_LIVE : TTL_IDLE })
}

/** GET /team/{id} (simplified version of the real team page data). */
export function getTeam(teamId) {
  const league = LEAGUES.find((l) => l.teams.some((t) => t.id === teamId))
  if (!league) return Promise.reject(new Error('Equipo no encontrado'))
  const team = league.teams.find((t) => t.id === teamId)
  const now = Date.now()
  const matches = SEASON.matches.filter((m) => m.home.id === teamId || m.away.id === teamId)
  const games = matches.map((m) => toGame(m, now))
  const group = standings(league, now, true)[team.group]
  return delay({
    TTL: isLive(games) ? TTL_LIVE : TTL_IDLE,
    competitor: toTeam(team),
    league: toLeague(league),
    table: { name: group.name ?? 'Tabla', table: standingsTable(league, group) },
    last: games.filter((g) => g.status.enum !== STATUS.scheduled.enum).slice(-8).reverse(),
    next: games.filter((g) => g.status.enum === STATUS.scheduled.enum).slice(0, 5),
    squad: team.squad,
  })
}

/** GET /menu/ */
export function getMenu() {
  return {
    categories: [
      {
        name: 'Destacado',
        is_open: true,
        items: LEAGUES.map((l) => ({ name: l.name, link: `/league/${l.urlName}/${l.apiId}` })),
      },
      ...LEAGUES.map((l) => ({
        name: l.country,
        flag: l.flag,
        is_open: false,
        items: [{ name: l.fullName, link: `/league/${l.urlName}/${l.apiId}` }],
      })),
    ],
  }
}

export const DATE_RANGE_DAYS = 7
export { DAY }

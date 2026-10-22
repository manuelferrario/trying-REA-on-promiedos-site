// Simulated season engine.
//
// Promiedos has no public API, so the season is generated deterministically:
// fixtures come from a round-robin schedule, results from a seeded Poisson
// model weighted by team strength. Matches are anchored to "today", so the
// home page always has finished, live and upcoming games, and live scores
// advance with the real clock.

import { LEAGUES } from './leagues.js'
import { createRng, pick, poisson } from '../lib/rng.js'

const DAY = 24 * 60 * 60 * 1000
const MINUTE = 60 * 1000
const KICKOFF_SLOTS = ['13:30', '15:45', '18:00', '20:15', '22:30']

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function roundRobin(teams) {
  const list = teams.length % 2 ? [...teams, null] : [...teams]
  const n = list.length
  const rounds = []
  for (let r = 0; r < n - 1; r++) {
    const pairs = []
    for (let i = 0; i < n / 2; i++) {
      const a = list[i]
      const b = list[n - 1 - i]
      if (a && b) pairs.push(r % 2 === 0 ? [a, b] : [b, a])
    }
    rounds.push(pairs)
    // Rotate every team except the first one.
    list.splice(1, 0, list.pop())
  }
  return rounds
}

function buildSquad(team, surnames) {
  const rng = createRng(`squad-${team.id}`)
  const pool = [...surnames]
  const squad = []
  for (let i = 0; i < 11; i++) {
    const surname = pool.splice(Math.floor(rng() * pool.length), 1)[0]
    const initial = String.fromCharCode(65 + Math.floor(rng() * 26))
    squad.push(`${initial}. ${surname}`)
  }
  return squad
}

// Strikers score more often than defenders; the goalkeeper (index 0) never does.
const SCORER_WEIGHTS = [0, 1, 1, 1, 1, 2, 2, 3, 3, 5, 5]

function pickScorer(rng, squad) {
  const total = SCORER_WEIGHTS.reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (let i = 0; i < squad.length; i++) {
    roll -= SCORER_WEIGHTS[i]
    if (roll < 0) return squad[i]
  }
  return squad[squad.length - 1]
}

function simulate(match) {
  const rng = createRng(match.id)
  const { home, away } = match
  const diff = home.strength - away.strength
  const homeGoals = poisson(rng, Math.max(0.25, 1.4 + 0.22 * diff))
  const awayGoals = poisson(rng, Math.max(0.2, 1.05 - 0.22 * diff))

  const events = []
  const addGoals = (count, side, team) => {
    for (let i = 0; i < count; i++) {
      const roll = rng()
      events.push({
        type: roll < 0.08 ? 'penalty' : roll < 0.11 ? 'own-goal' : 'goal',
        side,
        minute: 1 + Math.floor(rng() * 90),
        player: pickScorer(rng, team.squad),
      })
    }
  }
  addGoals(homeGoals, 'home', home)
  addGoals(awayGoals, 'away', away)

  // Own goals are credited to the opposing team's player.
  for (const e of events) {
    if (e.type === 'own-goal') e.player = pick(rng, (e.side === 'home' ? away : home).squad.slice(1, 6))
  }

  const cards = Math.floor(rng() * 6)
  for (let i = 0; i < cards; i++) {
    const side = rng() < 0.5 ? 'home' : 'away'
    events.push({
      type: rng() < 0.07 ? 'red' : 'yellow',
      side,
      minute: 1 + Math.floor(rng() * 90),
      player: pick(rng, (side === 'home' ? home : away).squad),
    })
  }
  events.sort((a, b) => a.minute - b.minute)

  const possession = Math.round(Math.min(70, Math.max(30, 50 + 4 * diff + (rng() - 0.5) * 14)))
  const shotsHome = homeGoals * 2 + 4 + Math.floor(rng() * 8) + Math.max(0, diff)
  const shotsAway = awayGoals * 2 + 3 + Math.floor(rng() * 8) + Math.max(0, -diff)
  const stats = [
    { label: 'Posesión', home: possession, away: 100 - possession, unit: '%', scales: false },
    { label: 'Remates', home: shotsHome, away: shotsAway, scales: true },
    {
      label: 'Remates al arco',
      home: Math.min(shotsHome, homeGoals + Math.floor(rng() * 5)),
      away: Math.min(shotsAway, awayGoals + Math.floor(rng() * 5)),
      scales: true,
    },
    { label: 'Córners', home: Math.floor(rng() * 9) + 1, away: Math.floor(rng() * 8), scales: true },
    { label: 'Faltas', home: 8 + Math.floor(rng() * 10), away: 8 + Math.floor(rng() * 10), scales: true },
  ]

  return { events, stats }
}

function buildSeason(now) {
  const anchor = startOfDay(now)
  const matches = []
  const todayMatches = []

  for (const league of LEAGUES) {
    league.teams = []
    league.rounds = 0
    league.groups.forEach((group, gi) => {
      for (const team of group.teams) {
        team.id = `${league.id}-${team.short}`
        team.leagueId = league.id
        team.group = gi
        team.squad = buildSquad(team, league.surnames)
        league.teams.push(team)
      }
      let rounds = roundRobin(group.teams)
      if (league.doubleRound) {
        rounds = [...rounds, ...rounds.map((r) => r.map(([a, b]) => [b, a]))]
      }
      league.rounds = Math.max(league.rounds, rounds.length)

      rounds.forEach((pairs, ri) => {
        const round = ri + 1
        pairs.forEach(([home, away], mi) => {
          const dayOffset = league.dayOffsets[mi % league.dayOffsets.length]
          const day = anchor + ((round - league.currentRound) * 7 + dayOffset) * DAY
          const match = {
            id: `${league.id}-${round}-${home.short}-${away.short}`,
            leagueId: league.id,
            group: gi,
            round,
            home,
            away,
            day,
            order: mi,
          }
          if (day === anchor) {
            todayMatches.push(match)
          } else {
            const [h, m] = KICKOFF_SLOTS[(mi + gi) % KICKOFF_SLOTS.length].split(':').map(Number)
            match.kickoff = day + (h * 60 + m) * MINUTE
          }
          Object.assign(match, simulate(match))
          matches.push(match)
        })
      })
    })
  }

  // Spread today's games around the current time so some are over, some live and some upcoming.
  todayMatches.sort((a, b) => a.order - b.order || a.leagueId.localeCompare(b.leagueId) || a.group - b.group)
  const base = Math.floor(now / (15 * MINUTE)) * 15 * MINUTE - 150 * MINUTE
  todayMatches.forEach((m, i) => {
    m.kickoff = base + i * 55 * MINUTE
  })

  matches.sort((a, b) => a.kickoff - b.kickoff)
  return { matches, anchor }
}

export const SEASON = buildSeason(Date.now())

/** Live state of a match at time `now`: status, clock label, visible events and score. */
export function matchState(match, now) {
  const elapsed = (now - match.kickoff) / MINUTE
  let status
  let minute
  let clock
  if (elapsed < 0) {
    status = 'scheduled'
    minute = 0
  } else if (elapsed >= 112) {
    status = 'finished'
    minute = 90
    clock = 'Final'
  } else if (elapsed < 47) {
    status = 'live'
    minute = Math.max(1, Math.ceil(elapsed))
    clock = minute > 45 ? "45+'" : `${minute}'`
  } else if (elapsed < 62) {
    status = 'live'
    minute = 45
    clock = 'ET'
  } else {
    status = 'live'
    minute = Math.ceil(elapsed - 17)
    clock = minute > 90 ? "90+'" : `${minute}'`
  }

  const events = status === 'scheduled' ? [] : match.events.filter((e) => e.minute <= minute)
  const goals = events.filter((e) => e.type !== 'yellow' && e.type !== 'red')
  const score =
    status === 'scheduled'
      ? null
      : {
          home: goals.filter((e) => e.side === 'home').length,
          away: goals.filter((e) => e.side === 'away').length,
        }
  const progress = Math.min(1, minute / 90)
  const stats =
    status === 'scheduled'
      ? []
      : match.stats.map((s) =>
          s.scales
            ? { ...s, home: Math.round(s.home * progress), away: Math.round(s.away * progress) }
            : s,
        )

  return { status, minute, clock, events, score, stats }
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function matchesOnDay(day) {
  return SEASON.matches.filter((m) => m.day === day)
}

export function matchesOfRound(leagueId, round) {
  return SEASON.matches.filter((m) => m.leagueId === leagueId && m.round === round)
}

export function teamMatches(teamId) {
  return SEASON.matches.filter((m) => m.home.id === teamId || m.away.id === teamId)
}

/**
 * Standings per group. With `includeLive`, games in progress count with their
 * current score (Promiedos' "tabla en vivo").
 */
export function standings(league, now, includeLive = false) {
  return league.groups.map((group, gi) => {
    const rows = new Map(
      group.teams.map((team) => [
        team.id,
        { team, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0, form: [], live: false },
      ]),
    )
    for (const m of SEASON.matches) {
      if (m.leagueId !== league.id || m.group !== gi) continue
      const st = matchState(m, now)
      if (st.status === 'scheduled' || (st.status === 'live' && !includeLive)) continue
      const h = rows.get(m.home.id)
      const a = rows.get(m.away.id)
      const { home: hg, away: ag } = st.score
      for (const [row, gf, gc] of [
        [h, hg, ag],
        [a, ag, hg],
      ]) {
        row.pj++
        row.gf += gf
        row.gc += gc
        const result = gf > gc ? 'G' : gf === gc ? 'E' : 'P'
        if (result === 'G') {
          row.pg++
          row.pts += 3
        } else if (result === 'E') {
          row.pe++
          row.pts += 1
        } else {
          row.pp++
        }
        row.form.push(result)
        if (st.status === 'live') row.live = true
      }
    }
    const sorted = [...rows.values()]
      .map((r) => ({ ...r, dif: r.gf - r.gc, form: r.form.slice(-5) }))
      .sort((x, y) => y.pts - x.pts || y.dif - x.dif || y.gf - x.gf || x.team.name.localeCompare(y.team.name))
    return { name: group.name, rows: sorted }
  })
}

export function topScorers(league, now, limit = 15) {
  const tally = new Map()
  for (const m of SEASON.matches) {
    if (m.leagueId !== league.id) continue
    const st = matchState(m, now)
    for (const e of st.events) {
      if (e.type !== 'goal' && e.type !== 'penalty') continue
      const team = e.side === 'home' ? m.home : m.away
      const key = `${team.id}|${e.player}`
      const row = tally.get(key) ?? { player: e.player, team, goals: 0, penalties: 0 }
      row.goals++
      if (e.type === 'penalty') row.penalties++
      tally.set(key, row)
    }
  }
  return [...tally.values()]
    .sort((a, b) => b.goals - a.goals || a.penalties - b.penalties || a.player.localeCompare(b.player))
    .slice(0, limit)
}

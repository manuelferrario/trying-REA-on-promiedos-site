// Static catalogue: competitions, teams (name, abbreviation, colours, strength 1-5).
// apiId / urlName mirror the identifiers promiedos.com.ar uses in /league/{urlName}/{apiId}.

const t = (name, short, c1, c2, strength) => ({ name, short, colors: [c1, c2], strength })

const LPF_ZONE_A = [
  t('Boca Juniors', 'BOC', '#0b3d91', '#f2c200', 5),
  t('Estudiantes', 'EST', '#d71920', '#ffffff', 4),
  t('Argentinos Juniors', 'ARG', '#d71920', '#ffffff', 4),
  t('Unión', 'UNI', '#d71920', '#ffffff', 3),
  t('Talleres', 'TAL', '#0b2a5b', '#ffffff', 4),
  t('Vélez Sarsfield', 'VEL', '#ffffff', '#1b3f8b', 4),
  t('Deportivo Riestra', 'RIE', '#111111', '#ffffff', 2),
  t('Lanús', 'LAN', '#7a1f2b', '#ffffff', 4),
  t("Newell's Old Boys", 'NOB', '#d71920', '#111111', 3),
  t('Instituto', 'INS', '#d71920', '#ffffff', 2),
  t('Independiente', 'IND', '#d71920', '#ffffff', 4),
  t('San Lorenzo', 'SLO', '#1b3f8b', '#d71920', 3),
  t('Platense', 'PLA', '#5c3b1e', '#ffffff', 3),
  t('Gimnasia (LP)', 'GLP', '#ffffff', '#0b2a5b', 3),
  t('Defensa y Justicia', 'DYJ', '#f2c200', '#1f7a34', 3),
]

const LPF_ZONE_B = [
  t('River Plate', 'RIV', '#ffffff', '#d71920', 5),
  t('Racing Club', 'RAC', '#6cb4e4', '#ffffff', 4),
  t('Rosario Central', 'CEN', '#0b3d91', '#f2c200', 4),
  t('Huracán', 'HUR', '#ffffff', '#d71920', 3),
  t('Belgrano', 'BEL', '#6cb4e4', '#ffffff', 3),
  t('Tigre', 'TIG', '#0b2a5b', '#d71920', 3),
  t('Independiente Rivadavia', 'IRV', '#0b2a5b', '#ffffff', 3),
  t('Barracas Central', 'BAR', '#d71920', '#ffffff', 2),
  t('Banfield', 'BAN', '#1f7a34', '#ffffff', 3),
  t('Sarmiento', 'SAR', '#1f7a34', '#ffffff', 2),
  t('Central Córdoba', 'CCO', '#111111', '#ffffff', 2),
  t('Atlético Tucumán', 'ATU', '#6cb4e4', '#ffffff', 2),
  t('Aldosivi', 'ALD', '#f2c200', '#1f7a34', 2),
  t('Estudiantes (RC)', 'ERC', '#6cb4e4', '#ffffff', 2),
  t('Gimnasia (M)', 'GMZ', '#111111', '#ffffff', 2),
]

const PREMIER = [
  t('Arsenal', 'ARS', '#ef0107', '#ffffff', 5),
  t('Aston Villa', 'AVL', '#670e36', '#95bfe5', 4),
  t('Bournemouth', 'BOU', '#da291c', '#111111', 3),
  t('Brentford', 'BRE', '#e30613', '#ffffff', 3),
  t('Brighton', 'BHA', '#0057b8', '#ffffff', 3),
  t('Burnley', 'BUR', '#6c1d45', '#99d6ea', 2),
  t('Chelsea', 'CHE', '#034694', '#ffffff', 4),
  t('Crystal Palace', 'CRY', '#1b458f', '#c4122e', 3),
  t('Everton', 'EVE', '#003399', '#ffffff', 3),
  t('Fulham', 'FUL', '#ffffff', '#111111', 3),
  t('Leeds United', 'LEE', '#ffffff', '#1d428a', 2),
  t('Liverpool', 'LIV', '#c8102e', '#ffffff', 5),
  t('Manchester City', 'MCI', '#6cabdd', '#ffffff', 5),
  t('Manchester United', 'MUN', '#da291c', '#111111', 4),
  t('Newcastle', 'NEW', '#111111', '#ffffff', 4),
  t('Nottingham Forest', 'NFO', '#dd0000', '#ffffff', 3),
  t('Sunderland', 'SUN', '#eb172b', '#ffffff', 2),
  t('Tottenham', 'TOT', '#ffffff', '#132257', 4),
  t('West Ham', 'WHU', '#7a263a', '#1bb1e7', 3),
  t('Wolves', 'WOL', '#fdb913', '#231f20', 2),
]

const LALIGA = [
  t('Alavés', 'ALA', '#0761af', '#ffffff', 2),
  t('Athletic Club', 'ATH', '#ee2523', '#ffffff', 4),
  t('Atlético de Madrid', 'ATM', '#cb3524', '#ffffff', 5),
  t('Barcelona', 'BAR', '#a50044', '#004d98', 5),
  t('Celta', 'CEL', '#8ac3ee', '#ffffff', 3),
  t('Elche', 'ELC', '#ffffff', '#05642c', 2),
  t('Espanyol', 'ESP', '#007fc8', '#ffffff', 2),
  t('Getafe', 'GET', '#005999', '#ffffff', 3),
  t('Girona', 'GIR', '#cd2534', '#ffffff', 3),
  t('Levante', 'LEV', '#b4053f', '#004d98', 2),
  t('Mallorca', 'MLL', '#e20613', '#111111', 3),
  t('Osasuna', 'OSA', '#d91a21', '#0a346f', 3),
  t('Real Oviedo', 'OVI', '#0055a4', '#ffffff', 2),
  t('Rayo Vallecano', 'RAY', '#ffffff', '#e53027', 3),
  t('Real Betis', 'BET', '#00954c', '#ffffff', 4),
  t('Real Madrid', 'RMA', '#ffffff', '#febe10', 5),
  t('Real Sociedad', 'RSO', '#0067b1', '#ffffff', 3),
  t('Sevilla', 'SEV', '#ffffff', '#d4001f', 3),
  t('Valencia', 'VAL', '#ffffff', '#ee3524', 3),
  t('Villarreal', 'VIL', '#ffe667', '#005187', 4),
]

const SURNAMES_ES = [
  'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Sosa', 'Romero', 'Benítez',
  'Acosta', 'Medina', 'Herrera', 'Suárez', 'Aguirre', 'Giménez', 'Molina', 'Ojeda',
  'Castro', 'Pereyra', 'Rojas', 'Vera', 'Cabrera', 'Ruiz', 'Ortiz', 'Domínguez',
  'Ledesma', 'Paredes', 'Villalba', 'Maidana', 'Correa', 'Godoy', 'Navarro', 'Ríos',
]

const SURNAMES_EN = [
  'Smith', 'Johnson', 'Walker', 'Wright', 'Robinson', 'Thompson', 'White', 'Hughes',
  'Edwards', 'Green', 'Hall', 'Wood', 'Harris', 'Clarke', 'Jackson', 'Turner',
  'Hill', 'Moore', 'Cooper', 'Ward', 'Morris', 'King', 'Watson', 'Baker',
]

export const LEAGUES = [
  {
    id: 'lpf',
    apiId: 'hc',
    urlName: 'liga-profesional',
    name: 'Liga Profesional',
    fullName: 'Liga Profesional Argentina',
    country: 'Argentina',
    flag: '🇦🇷',
    season: 'Clausura 2026',
    currentRound: 11,
    doubleRound: false,
    surnames: SURNAMES_ES,
    groups: [
      { name: 'Zona A', teams: LPF_ZONE_A },
      { name: 'Zona B', teams: LPF_ZONE_B },
    ],
    zones: [
      { from: 1, to: 8, kind: 'qualify', label: 'Octavos de Final' },
    ],
    dayOffsets: [-1, -1, 0, 0, 0, 1, 1],
  },
  {
    id: 'premier',
    apiId: 'h',
    urlName: 'premier-league',
    name: 'Premier League',
    fullName: 'Premier League',
    country: 'Inglaterra',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    season: '2026/27',
    currentRound: 9,
    doubleRound: true,
    surnames: SURNAMES_EN,
    groups: [{ name: null, teams: PREMIER }],
    zones: [
      { from: 1, to: 4, kind: 'qualify', label: 'Champions League' },
      { from: 5, to: 5, kind: 'secondary', label: 'Europa League' },
      { from: 18, to: 20, kind: 'relegation', label: 'Descenso' },
    ],
    dayOffsets: [-1, -1, -1, 0, 0, 0, 0, 1, 1, 1],
  },
  {
    id: 'laliga',
    apiId: 'bb',
    urlName: 'laliga',
    name: 'LaLiga',
    fullName: 'LaLiga',
    country: 'España',
    flag: '🇪🇸',
    season: '2026/27',
    currentRound: 10,
    doubleRound: true,
    surnames: SURNAMES_ES,
    groups: [{ name: null, teams: LALIGA }],
    zones: [
      { from: 1, to: 4, kind: 'qualify', label: 'Champions League' },
      { from: 5, to: 6, kind: 'secondary', label: 'Europa League' },
      { from: 18, to: 20, kind: 'relegation', label: 'Descenso' },
    ],
    dayOffsets: [-1, -1, -1, 0, 0, 0, 1, 1, 1, 1],
  },
]

export const LEAGUE_BY_ID = Object.fromEntries(LEAGUES.map((l) => [l.id, l]))
export const LEAGUE_BY_API_ID = Object.fromEntries(LEAGUES.map((l) => [l.apiId, l]))

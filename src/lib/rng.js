// Deterministic helpers so every visitor sees the same simulated season.

export function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32
export function createRng(seed) {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function poisson(rng, lambda) {
  const l = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng()
  } while (p > l)
  return k - 1
}

export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)]
}

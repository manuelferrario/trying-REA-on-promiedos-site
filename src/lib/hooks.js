import { useEffect, useState } from 'react'

/** Current timestamp, refreshed every `interval` ms so live matches tick. */
export function useNow(interval = 15000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

function readHash() {
  return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}

/** Minimal hash router: returns the path segments, e.g. ['liga', 'lpf']. */
export function useHashRoute() {
  const [route, setRoute] = useState(readHash)
  useEffect(() => {
    const onChange = () => {
      setRoute(readHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Small version of the SWR setup promiedos.com.ar uses (see docs/REA-ANALISIS.md):
 * fetch on mount and whenever `key` changes, poll again after the `TTL` seconds
 * the response asks for, and revalidate when the tab regains focus.
 */
export function usePolling(key, fetcher) {
  const [state, setState] = useState({ key: null, data: null, error: null })
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const [tick, setTick] = useState(0)
  const revalidate = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    let timer
    fetcherRef
      .current()
      .then((data) => {
        if (cancelled) return
        setState({ key, data, error: null })
        timer = setTimeout(revalidate, (data?.TTL ?? 10) * 1000)
      })
      .catch((error) => {
        if (cancelled) return
        setState((s) => ({ ...s, key, error }))
        timer = setTimeout(revalidate, 10000)
      })
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [key, tick, revalidate])

  useEffect(() => {
    const onFocus = () => document.visibilityState === 'visible' && revalidate()
    document.addEventListener('visibilitychange', onFocus)
    return () => document.removeEventListener('visibilitychange', onFocus)
  }, [revalidate])

  // Data from a previous key is not shown for the new one.
  const fresh = state.key === key
  return { data: fresh ? state.data : null, error: fresh ? state.error : null, loading: !fresh }
}

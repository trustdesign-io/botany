'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { type RecordFilters, filtersToHash, hashToFilters } from '@/lib/filter'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/**
 * Keeps the index filters in the URL hash, so a filtered view can be shared
 * and the page still renders every record without JavaScript.
 */
export function useHashFilters(): [RecordFilters, (next: RecordFilters) => void] {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  )
  const filters = useMemo(() => hashToFilters(hash), [hash])

  const setFilters = useCallback((next: RecordFilters) => {
    const url = `${window.location.pathname}${window.location.search}${filtersToHash(next)}`
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }, [])

  return [filters, setFilters]
}

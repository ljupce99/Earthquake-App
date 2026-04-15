import { useState, useEffect, useCallback } from 'react'
import { earthquakeService } from '../services/earthquakeService'

const unwrapData = (response) => response?.data ?? []

export function useEarthquakes() {
  const [all, setAll] = useState([])
  const [display, setDisplay] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [toast, setToast] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const notify = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await earthquakeService.getAll()
      const data = unwrapData(res)
      setAll(data)
      setDisplay(data)
      setLastUpdated(new Date())
    } catch {
      notify('Failed to load earthquake data', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const fetchLatest = async () => {
    setFetching(true)
    try {
      const res = await earthquakeService.fetchAndRefresh()
      const data = unwrapData(res)
      setAll(data)
      setDisplay(data)
      setLastUpdated(new Date())
      notify(`${data.length} events ingested from USGS`)
    } catch {
      notify('USGS API unavailable', 'error')
    } finally {
      setFetching(false)
    }
  }

  const applyFilter = async ({ minMag, after }) => {
    setLoading(true)
    try {
      let res
      if (minMag !== null && after) {
        res = await earthquakeService.filterCombined(minMag, new Date(after).toISOString())
      } else if (minMag !== null) {
        res = await earthquakeService.filterByMagnitude(minMag)
      } else if (after) {
        res = await earthquakeService.filterAfter(new Date(after).toISOString())
      } else {
        setDisplay(all)
        return
      }

      const data = unwrapData(res)
      setDisplay(data)
      notify(`${data.length} results`)
    } catch {
      notify('Filter failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const clearFilter = () => setDisplay(all)

  const deleteOne = async (id) => {
    try {
      await earthquakeService.deleteById(id)
      const updated = all.filter(e => e.id !== id)
      setAll(updated)
      setDisplay(prev => prev.filter(e => e.id !== id))
      notify('Record deleted')
    } catch {
      notify('Delete failed', 'error')
    }
  }

  return { display, loading, fetching, toast, lastUpdated, fetchLatest, applyFilter, clearFilter, deleteOne }
}

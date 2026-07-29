import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'

const TABLE_MAP = {
  customDrinks: 'custom_drinks',
  breathingTechniques: 'breathing_techniques'
}

function mapTable(table) {
  return TABLE_MAP[table] || table
}

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, c => '_' + c.toLowerCase())
}

function mapRowToCamel(row) {
  if (!row || typeof row !== 'object') return row
  const result = {}
  for (const [key, value] of Object.entries(row)) {
    result[snakeToCamel(key)] = value
  }
  return result
}

function mapRowToSnake(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value
  }
  return result
}

function toSupabaseItem(item) {
  const { id, ...rest } = item
  const withoutGeneratedId = (id && (id.startsWith('h') || id.startsWith('d') || id.startsWith('t') || id.startsWith('bc')))
    ? rest
    : { id, ...rest }
  return mapRowToSnake(withoutGeneratedId)
}

const subCache = new Map()

export function useCollection(table, options = {}) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setData([]); setLoading(false); return }
    let mounted = true
    const t = mapTable(table)

    async function fetchData() {
      let query = supabase.from(t).select('*').eq('user_id', user.id)
      if (options.orderBy) {
        query = query.order(camelToSnake(options.orderBy.field), { ascending: options.orderBy.direction === 'asc' })
      }
      const { data: result, error } = await query
      if (mounted && !error) setData((result || []).map(mapRowToCamel))
      if (mounted) setLoading(false)
    }

    fetchData()

    const channelKey = `public:${t}:uid=${user.id}`
    const existing = subCache.get(channelKey)
    if (existing) {
      existing.refCount++
    } else {
      const subscription = supabase
        .channel(channelKey)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: t, filter: `user_id=eq.${user.id}` },
          fetchData
        )
        .subscribe()
      subCache.set(channelKey, { refCount: 1, subscription })
    }

    return () => {
      mounted = false
      const entry = subCache.get(channelKey)
      if (entry) {
        entry.refCount--
        if (entry.refCount <= 0) {
          supabase.removeChannel(entry.subscription)
          subCache.delete(channelKey)
        }
      }
    }
  }, [user?.id, table])

  const add = useCallback(async (item) => {
    if (!user) return null
    const t = mapTable(table)
    const clean = toSupabaseItem(item)
    const { data: result, error } = await supabase.from(t).insert({ ...clean, user_id: user.id }).select().single()
    if (error) throw error
    return result?.id
  }, [user?.id, table])

  const update = useCallback(async (id, fields) => {
    if (!user) return
    const t = mapTable(table)
    const { error } = await supabase.from(t).update(mapRowToSnake(fields)).eq('id', id)
    if (error) throw error
  }, [user?.id, table])

  const remove = useCallback(async (id) => {
    if (!user) return
    const t = mapTable(table)
    const { error } = await supabase.from(t).delete().eq('id', id)
    if (error) throw error
  }, [user?.id, table])

  return { data, loading, add, update, remove }
}

export function useDateCollection(table, date) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !date) { setData([]); setLoading(false); return }
    let mounted = true
    const t = mapTable(table)

    async function fetchData() {
      const { data: result, error } = await supabase
        .from(t)
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
      if (mounted && !error) setData((result || []).map(mapRowToCamel))
      if (mounted) setLoading(false)
    }

    fetchData()

    const channelKey = `public:${t}:uid=${user.id}`
    const existing = subCache.get(channelKey)
    if (existing) {
      existing.refCount++
    } else {
      const subscription = supabase
        .channel(channelKey)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: t, filter: `user_id=eq.${user.id}` },
          fetchData
        )
        .subscribe()
      subCache.set(channelKey, { refCount: 1, subscription })
    }

    return () => {
      mounted = false
      const entry = subCache.get(channelKey)
      if (entry) {
        entry.refCount--
        if (entry.refCount <= 0) {
          supabase.removeChannel(entry.subscription)
          subCache.delete(channelKey)
        }
      }
    }
  }, [user?.id, table, date])

  return { data, loading }
}

export function useTodayCollection(table) {
  const today = new Date()
  const dateStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0')
  return useDateCollection(table, dateStr)
}

import { useState, useEffect, useCallback } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, setDoc, getDocs, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

export function useCollection(path, options = {}) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setData([]); setLoading(false); return }
    const ref = collection(db, 'users', user.uid, path)
    const q = options.orderBy
      ? query(ref, orderBy(options.orderBy.field, options.orderBy.direction || 'desc'))
      : query(ref)
    const unsub = onSnapshot(q, (snap) => {
      const arr = []
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
      setData(arr)
      setLoading(false)
    })
    return unsub
  }, [user, path])

  const add = useCallback(async (item) => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, path)
    const docRef = doc(ref)
    await setDoc(docRef, { id: docRef.id, ...item })
    return docRef.id
  }, [user, path])

  const update = useCallback(async (id, fields) => {
    if (!user) return
    const ref = doc(db, 'users', user.uid, path, id)
    await setDoc(ref, fields, { merge: true })
  }, [user, path])

  const remove = useCallback(async (id) => {
    if (!user) return
    const ref = doc(db, 'users', user.uid, path, id)
    await deleteDoc(ref)
  }, [user, path])

  return { data, loading, add, update, remove }
}

export function useDateCollection(path, date) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !date) { setData([]); setLoading(false); return }
    const ref = collection(db, 'users', user.uid, path)
    const q = query(ref, where('date', '==', date))
    const unsub = onSnapshot(q, (snap) => {
      const arr = []
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
      setData(arr)
      setLoading(false)
    })
    return unsub
  }, [user, path, date])

  return { data, loading }
}

export function useTodayCollection(path) {
  const today = new Date()
  const dateStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0')
  return useDateCollection(path, dateStr)
}

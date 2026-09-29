import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useData() {
  const [data, setData] = useState({ customers: [], bookings: [], notifs: [], payments: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    const res = await Promise.all([
      supabase.from('customers').select('*, pets(*)').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*, customers(name, phone), pets(name, species, note)').order('booking_date').order('booking_time'),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('payments').select('*, bookings(pets(name))').order('paid_at', { ascending: false }).limit(50),
    ])
    const failed = res.find((r) => r.error)
    if (failed) setError(failed.error.message)
    else {
      setError('')
      setData({ customers: res[0].data, bookings: res[1].data, notifs: res[2].data, payments: res[3].data })
    }
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])
  return { ...data, loading, error, reload }
}

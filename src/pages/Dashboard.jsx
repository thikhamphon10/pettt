import { SPECIES, baht, today, statusOf, svcNames } from '../lib/constants'

export default function Dashboard({ bookings, notifs, payments }) {
  const t = today()
  const count = (k) => bookings.filter((b) => b.status === k).length
  const revenue = payments.filter((p) => new Date(p.paid_at).toLocaleDateString('sv') === t).reduce((a, p) => a + Number(p.total), 0)
  const open = bookings.filter((b) => b.status !== 'closed')
  const stats = [
    ['คิววันนี้', bookings.filter((b) => b.booking_date === t).length, true],
    ['กำลังกรูมมิ่ง', count('grooming')],
    ['รอชำระเงิน / รับกลับ', count('done')],
    ['รายได้วันนี้', baht(revenue)],
  ]
  return (
    <>
      <h1 className="text-2xl font-semibold">แดชบอร์ด</h1>
      <p className="mb-5 text-mute">ภาพรวมของร้านวันนี้</p>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([label, v, hot]) => (
          <div key={label} className={`card ${hot ? '!border-pri !bg-pri text-white' : ''}`}>
            <div className="text-3xl font-semibold">{v}</div>
            <div className={hot ? 'opacity-85' : 'text-mute'}>{label}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="card">
          <h2 className="mb-2 font-semibold">คิวที่ยังไม่เสร็จ</h2>
          {open.length === 0 && <p className="py-6 text-center text-mute">ยังไม่มีคิว ไปที่ "จองคิว" ได้เลย</p>}
          {open.map((b) => (
            <div key={b.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-soft text-xl">{SPECIES[b.pets?.species] || '🐾'}</div>
              <div className="flex-1">
                <b>{b.pets?.name}</b> <span className="text-sm text-mute">· {b.customers?.name}</span>
                <div className="text-sm text-mute">{b.booking_date === t ? 'วันนี้' : b.booking_date} {b.booking_time} น. · {svcNames(b.services)}</div>
              </div>
              <span className={`tag ${statusOf(b.status).color}`}>{statusOf(b.status).label}</span>
            </div>
          ))}
        </section>
        <section className="card">
          <h2 className="mb-2 font-semibold">การแจ้งเตือนล่าสุด</h2>
          {notifs.length === 0 && <p className="py-6 text-center text-mute">เมื่อกรูมมิ่งเสร็จ การแจ้งเตือนจะขึ้นที่นี่</p>}
          {notifs.map((n) => (
            <div key={n.id} className="border-b border-line py-2.5 text-sm last:border-0">
              🔔 {n.message}
              <div className="text-xs text-mute">{new Date(n.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</div>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import { STATUS, SPECIES, baht, statusOf, svcNames } from '../lib/constants'

export default function Queue({ bookings, reload, toast, go }) {
  const [open, setOpen] = useState(null)

  const advance = async (b) => {
    const next = b.status === 'booked' ? 'grooming' : 'done'
    const { error } = await supabase.from('bookings').update({ status: next }).eq('id', b.id)
    if (error) return toast('เปลี่ยนสถานะไม่สำเร็จ: ' + error.message)
    if (next === 'done') {
      const message = `${b.pets.name} ตัดขนเสร็จแล้ว พร้อมรับกลับ · แจ้ง ${b.customers.name} ${b.customers.phone || ''}`
      await supabase.from('notifications').insert({ booking_id: b.id, message })
      toast(`🔔 ${message}`)
    }
    reload()
  }

  const Card = ({ b }) => (
    <div className="mb-2 cursor-pointer rounded-xl border border-line bg-white p-3" tabIndex={0} onClick={() => setOpen(b)} onKeyDown={(e) => e.key === 'Enter' && setOpen(b)}>
      <b>{SPECIES[b.pets?.species]} {b.pets?.name}</b>
      <div className="text-sm text-mute">{b.customers?.name} · {b.booking_time} น.</div>
      <div className="text-sm text-mute">{svcNames(b.services)}</div>
      <span className="tag mt-1">{b.style}</span>{b.photo_url && ' 📷'}{b.brief && ' 📝'}
      {b.status === 'booked' && <div className="mt-2"><button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); advance(b) }}>เริ่มกรูมมิ่ง</button></div>}
      {b.status === 'grooming' && <div className="mt-2"><button className="btn btn-sun btn-sm" onClick={(e) => { e.stopPropagation(); advance(b) }}>เสร็จแล้ว · แจ้งลูกค้า</button></div>}
      {b.status === 'done' && <div className="mt-2"><button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); go('pos') }}>ไปชำระเงิน</button></div>}
    </div>
  )

  return (
    <>
      <h1 className="text-2xl font-semibold">คิวช่าง</h1>
      <p className="mb-5 text-mute">กดปุ่มในการ์ดเพื่อเลื่อนสถานะ · กดที่การ์ดเพื่อดูบรีฟและรูป</p>
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4">
        {STATUS.map((s) => {
          const list = bookings.filter((b) => b.status === s.key)
          return (
            <section key={s.key} className="min-h-40 w-[78%] shrink-0 rounded-2xl bg-soft p-2.5 md:w-auto">
              <h2 className="mb-2 flex justify-between px-1 font-semibold">{s.label}<span className="tag bg-white">{list.length}</span></h2>
              {list.map((b) => <Card key={b.id} b={b} />)}
              {list.length === 0 && <p className="py-4 text-center text-mute">—</p>}
            </section>
          )
        })}
      </div>
      {open && (
        <Modal onClose={() => setOpen(null)}>
          <h2 className="text-lg font-semibold">{SPECIES[open.pets?.species]} {open.pets?.name} <span className={`tag ${statusOf(open.status).color}`}>{statusOf(open.status).label}</span></h2>
          <p className="mt-2 text-sm">{open.customers?.name} · {open.booking_date} {open.booking_time} น.<br />{svcNames(open.services)} · <b>{baht(open.total)}</b></p>
          <p className="mt-2 text-sm"><b>ทรง:</b> {open.style}</p>
          {open.pets?.note && <p className="mt-2 text-sm">⚠️ {open.pets.note}</p>}
          <p className="mt-2 text-sm"><b>บรีฟถึงช่าง:</b><br />{open.brief || <span className="text-mute">ไม่มี</span>}</p>
          {open.photo_url && <img src={open.photo_url} alt="รูป Reference" className="mt-3 max-h-56 w-full rounded-xl object-cover" />}
        </Modal>
      )}
    </>
  )
}

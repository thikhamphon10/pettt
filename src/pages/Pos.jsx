import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { PAY_METHODS, SPECIES, baht, svcNames } from '../lib/constants'

export default function Pos({ bookings, payments, reload, toast }) {
  const waiting = bookings.filter((b) => b.status === 'done')
  const [sel, setSel] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [method, setMethod] = useState(PAY_METHODS[0])
  const b = waiting.find((x) => x.id === sel) || waiting[0]
  const net = b ? Math.max(0, Number(b.total) - (Number(discount) || 0)) : 0

  const pay = async () => {
    const { error } = await supabase.from('payments').insert({ booking_id: b.id, discount: Number(discount) || 0, total: net, method })
    if (error) return toast('บันทึกการชำระไม่สำเร็จ: ' + error.message)
    await supabase.from('bookings').update({ status: 'closed' }).eq('id', b.id)
    toast(`✅ รับชำระ ${baht(net)} · ส่งมอบ ${b.pets.name} แล้ว`)
    setDiscount(0)
    reload()
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">ชำระเงิน (POS)</h1>
      <p className="mb-5 text-mute">เลือกน้องที่ตัดขนเสร็จ คิดเงิน แล้วส่งมอบกลับ</p>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="card">
          <h2 className="mb-2 font-semibold">รอชำระเงิน</h2>
          {waiting.length === 0 && <p className="py-6 text-center text-mute">ยังไม่มีน้องที่รอชำระเงิน</p>}
          {waiting.map((w) => (
            <button key={w.id} onClick={() => setSel(w.id)} className={`flex w-full items-center gap-3 rounded-xl p-2 text-left ${w.id === b?.id ? 'bg-soft' : ''}`}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-soft text-xl">{SPECIES[w.pets?.species]}</span>
              <span className="flex-1"><b>{w.pets?.name}</b><span className="block text-sm text-mute">{svcNames(w.services)}</span></span>
              <b>{baht(w.total)}</b>
            </button>
          ))}
          <h2 className="mb-2 mt-6 font-semibold">ประวัติการชำระ</h2>
          <table className="w-full text-sm"><tbody>
            {payments.slice(0, 8).map((p) => (
              <tr key={p.id} className="border-b border-line"><td className="py-1.5">{p.bookings?.pets?.name}</td><td>{p.method}</td><td className="text-right">{baht(p.total)}</td></tr>
            ))}
            {payments.length === 0 && <tr><td className="py-3 text-center text-mute">ยังไม่มีรายการ</td></tr>}
          </tbody></table>
        </section>
        <section className="card">
          {!b ? <p className="py-6 text-center text-mute">เมื่อช่างกด "เสร็จแล้ว" น้องจะขึ้นที่นี่</p> : (
            <>
              <h2 className="font-semibold">บิลของ {SPECIES[b.pets?.species]} {b.pets?.name}</h2>
              <p className="mb-2 text-sm text-mute">{b.customers?.name}</p>
              <div className="text-sm">{svcNames(b.services)}</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div><label className="lbl" htmlFor="dc">ส่วนลด (บาท)</label><input id="dc" type="number" min="0" className="input" value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
                <div><label className="lbl" htmlFor="pm">ช่องทางชำระ</label>
                  <select id="pm" className="input" value={method} onChange={(e) => setMethod(e.target.value)}>{PAY_METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
              </div>
              <div className="mt-4 flex items-center justify-between"><span>ยอดสุทธิ</span><span className="text-3xl font-semibold text-pri">{baht(net)}</span></div>
              <button className="btn mt-3 w-full" onClick={pay}>รับชำระเงิน และส่งมอบน้อง</button>
            </>
          )}
        </section>
      </div>
    </>
  )
}

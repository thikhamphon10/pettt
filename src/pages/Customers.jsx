import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { SPECIES } from '../lib/constants'

function PetForm({ customerId, reload, toast }) {
  const [f, setF] = useState({ name: '', species: 'dog', breed: '', note: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const add = async () => {
    if (!f.name.trim()) return toast('กรอกชื่อสัตว์เลี้ยงก่อน')
    const { error } = await supabase.from('pets').insert({ ...f, name: f.name.trim(), customer_id: customerId })
    if (error) return toast('บันทึกไม่สำเร็จ: ' + error.message)
    setF({ name: '', species: 'dog', breed: '', note: '' })
    reload()
  }
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <input className="input" placeholder="ชื่อน้อง" value={f.name} onChange={set('name')} aria-label="ชื่อสัตว์เลี้ยง" />
      <select className="input" value={f.species} onChange={set('species')} aria-label="ชนิดสัตว์">
        <option value="dog">สุนัข</option><option value="cat">แมว</option><option value="other">อื่นๆ</option>
      </select>
      <input className="input" placeholder="สายพันธุ์" value={f.breed} onChange={set('breed')} aria-label="สายพันธุ์" />
      <input className="input" placeholder="หมายเหตุ (แพ้/ขี้กลัว)" value={f.note} onChange={set('note')} aria-label="หมายเหตุ" />
      <button className="btn btn-alt btn-sm col-span-2" onClick={add}>+ เพิ่มสัตว์เลี้ยง</button>
    </div>
  )
}

export default function Customers({ customers, reload, toast }) {
  const [f, setF] = useState({ name: '', phone: '' })
  const add = async () => {
    if (!f.name.trim()) return toast('กรอกชื่อลูกค้าก่อน')
    const { error } = await supabase.from('customers').insert({ name: f.name.trim(), phone: f.phone.trim() })
    if (error) return toast('บันทึกไม่สำเร็จ: ' + error.message)
    setF({ name: '', phone: '' })
    reload()
  }
  return (
    <>
      <h1 className="text-2xl font-semibold">ลูกค้าและสัตว์เลี้ยง</h1>
      <p className="mb-5 text-mute">เพิ่มลูกค้าใหม่ แล้วเพิ่มสัตว์เลี้ยงของลูกค้าได้ทันที</p>
      <div className="card mb-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div><label className="lbl" htmlFor="cn">ชื่อลูกค้า</label><input id="cn" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="lbl" htmlFor="cp">เบอร์โทร</label><input id="cp" className="input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <button className="btn" onClick={add}>เพิ่มลูกค้า</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <div key={c.id} className="card">
            <h2 className="font-semibold">{c.name}</h2>
            <div className="text-sm text-mute">{c.phone}</div>
            <div className="mt-2">
              {c.pets.length === 0 && <p className="py-3 text-center text-sm text-mute">ยังไม่มีสัตว์เลี้ยง</p>}
              {c.pets.map((p) => (
                <div key={p.id} className="flex items-center gap-3 border-b border-line py-2 last:border-0">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-soft text-xl">{SPECIES[p.species]}</div>
                  <div className="text-sm"><b>{p.name}</b> <span className="text-mute">{p.breed}</span>{p.note && <div>⚠️ {p.note}</div>}</div>
                </div>
              ))}
            </div>
            <PetForm customerId={c.id} reload={reload} toast={toast} />
          </div>
        ))}
      </div>
    </>
  )
}

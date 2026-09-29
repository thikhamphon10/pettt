import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { SERVICES, STYLES, SPECIES, baht, today, svcTotal } from '../lib/constants'

const chip = (on) => `block cursor-pointer rounded-full border px-3.5 py-1.5 text-sm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-sun ${on ? 'border-pri bg-pri text-white' : 'border-line bg-bg'}`

export default function Booking({ customers, reload, toast, go }) {
  const [f, setF] = useState({ cid: '', pid: '', date: today(), time: '10:00', services: ['bath'], style: STYLES[0], brief: '' })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const cid = f.cid || customers[0]?.id || ''
  const pets = customers.find((c) => c.id === cid)?.pets || []
  const pid = pets.find((p) => p.id === f.pid) ? f.pid : pets[0]?.id || ''
  const toggle = (id) => setF({ ...f, services: f.services.includes(id) ? f.services.filter((x) => x !== id) : [...f.services, id] })

  const save = async () => {
    if (!pid) return toast('เพิ่มลูกค้าและสัตว์เลี้ยงก่อนที่หน้า "ลูกค้า"')
    if (!f.services.length) return toast('เลือกบริการอย่างน้อย 1 อย่าง')
    setBusy(true)
    let photo_url = null
    if (file) {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
      const { error } = await supabase.storage.from('references').upload(path, file)
      if (error) { setBusy(false); return toast('อัปโหลดรูปไม่สำเร็จ: ' + error.message) }
      photo_url = supabase.storage.from('references').getPublicUrl(path).data.publicUrl
    }
    const { error } = await supabase.from('bookings').insert({
      customer_id: cid, pet_id: pid, booking_date: f.date, booking_time: f.time,
      services: f.services, style: f.style, brief: f.brief.trim() || null, photo_url, total: svcTotal(f.services),
    })
    setBusy(false)
    if (error) return toast('จองไม่สำเร็จ: ' + error.message)
    await reload()
    toast('✅ จองคิวเรียบร้อย')
    go('queue')
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">จองคิวใหม่</h1>
      <p className="mb-5 text-mute">กรอกข้อมูลตามลำดับ ใช้เวลาไม่ถึงนาที</p>
      <div className="card grid gap-4 sm:grid-cols-2">
        <div><label className="lbl" htmlFor="bc">ลูกค้า</label>
          <select id="bc" className="input" value={cid} onChange={(e) => setF({ ...f, cid: e.target.value, pid: '' })}>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
        <div><label className="lbl" htmlFor="bp">สัตว์เลี้ยง</label>
          <select id="bp" className="input" value={pid} onChange={(e) => setF({ ...f, pid: e.target.value })}>
            {pets.length === 0 && <option value="">ยังไม่มีสัตว์เลี้ยง</option>}
            {pets.map((p) => <option key={p.id} value={p.id}>{SPECIES[p.species]} {p.name}</option>)}
          </select></div>
        <div><label className="lbl" htmlFor="bd">วันที่</label><input id="bd" type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
        <div><label className="lbl" htmlFor="bt">เวลา</label><input id="bt" type="time" className="input" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>

        <fieldset className="sm:col-span-2"><legend className="lbl">บริการ</legend>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <label key={s.id} className="relative"><input type="checkbox" className="peer sr-only" checked={f.services.includes(s.id)} onChange={() => toggle(s.id)} />
                <span className={chip(f.services.includes(s.id))}>{s.name} {baht(s.price)}</span></label>
            ))}
          </div></fieldset>

        <fieldset className="sm:col-span-2"><legend className="lbl">ทรงตัดขน</legend>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <label key={s} className="relative"><input type="radio" name="style" className="peer sr-only" checked={f.style === s} onChange={() => setF({ ...f, style: s })} />
                <span className={chip(f.style === s)}>{s}</span></label>
            ))}
          </div></fieldset>

        <div className="sm:col-span-2"><label className="lbl" htmlFor="br">บรีฟถึงช่าง</label>
          <textarea id="br" className="input min-h-24" placeholder="เช่น ความยาวขน จุดที่ต้องระวัง ความชอบของน้อง" value={f.brief} onChange={(e) => setF({ ...f, brief: e.target.value })} /></div>

        <div className="sm:col-span-2"><label className="lbl" htmlFor="ph">รูป Reference ทรงที่ต้องการ</label>
          <input id="ph" type="file" accept="image/*" className="input" onChange={(e) => setFile(e.target.files[0] || null)} />
          {file && <img alt="ตัวอย่างรูป Reference" src={URL.createObjectURL(file)} className="mt-2 h-24 w-24 rounded-xl object-cover" />}</div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
          <div>รวมโดยประมาณ <span className="text-2xl font-semibold text-pri">{baht(svcTotal(f.services))}</span></div>
          <button className="btn" disabled={busy} onClick={save}>{busy ? 'กำลังบันทึก…' : 'บันทึกการจอง'}</button>
        </div>
      </div>
    </>
  )
}

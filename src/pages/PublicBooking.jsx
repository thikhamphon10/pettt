import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { SERVICES, STYLES, SPECIES, baht, today, svcTotal } from '../lib/constants'

const chip = (on) => `block cursor-pointer rounded-full border px-3.5 py-1.5 text-sm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-sun ${on ? 'border-pri bg-pri text-white' : 'border-line bg-bg'}`
const STEPS = ['ข้อมูลของคุณ', 'สัตว์เลี้ยง', 'วันเวลาและบริการ', 'ทรงตัดขนและรายละเอียด']

export default function PublicBooking() {
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [err, setErr] = useState('')

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [found, setFound] = useState(null) // existing customer row, or null
  const [checked, setChecked] = useState(false)

  const [pets, setPets] = useState([]) // existing pets of found customer
  const [petId, setPetId] = useState('')
  const [newPet, setNewPet] = useState({ name: '', species: 'dog', breed: '', note: '' })

  const [date, setDate] = useState(today())
  const [time, setTime] = useState('10:00')
  const [services, setServices] = useState(['bath'])
  const [style, setStyle] = useState(STYLES[0])
  const [brief, setBrief] = useState('')
  const [file, setFile] = useState(null)

  const toggle = (id) => setServices((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const checkPhone = async () => {
    if (!phone.trim()) return setErr('กรอกเบอร์โทรก่อนค่ะ')
    setErr(''); setBusy(true)
    const { data, error } = await supabase.from('customers').select('*, pets(*)').eq('phone', phone.trim()).maybeSingle()
    setBusy(false)
    if (error) return setErr(error.message)
    setFound(data || null)
    setPets(data?.pets || [])
    setPetId(data?.pets?.[0]?.id || '')
    if (data) setName(data.name)
    setChecked(true)
  }

  const next = () => {
    setErr('')
    if (step === 0) {
      if (!checked) return setErr('กดตรวจสอบเบอร์โทรก่อนค่ะ')
      if (!found && !name.trim()) return setErr('กรอกชื่อของคุณก่อนค่ะ')
    }
    if (step === 1 && !petId && !newPet.name.trim()) return setErr('เลือกสัตว์เลี้ยง หรือกรอกชื่อสัตว์เลี้ยงใหม่ก่อนค่ะ')
    if (step === 2 && !services.length) return setErr('เลือกบริการอย่างน้อย 1 อย่างค่ะ')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => { setErr(''); setStep((s) => Math.max(s - 1, 0)) }

  const submit = async () => {
    setBusy(true); setErr('')
    try {
      let customerId = found?.id
      if (!customerId) {
        const { data, error } = await supabase.from('customers').insert({ name: name.trim(), phone: phone.trim() }).select().single()
        if (error) throw error
        customerId = data.id
      }
      let finalPetId = petId
      if (!finalPetId) {
        const { data, error } = await supabase.from('pets').insert({ ...newPet, name: newPet.name.trim(), customer_id: customerId }).select().single()
        if (error) throw error
        finalPetId = data.id
      }
      let photo_url = null
      if (file) {
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
        const up = await supabase.storage.from('references').upload(path, file)
        if (up.error) throw up.error
        photo_url = supabase.storage.from('references').getPublicUrl(path).data.publicUrl
      }
      const { error } = await supabase.from('bookings').insert({
        customer_id: customerId, pet_id: finalPetId, booking_date: date, booking_time: time,
        services, style, brief: brief.trim() || null, photo_url, total: svcTotal(services),
      })
      if (error) throw error
      setDone({ pet: newPet.name.trim() || pets.find((p) => p.id === petId)?.name, date, time })
    } catch (e) {
      setErr(e.message || 'จองไม่สำเร็จ ลองใหม่อีกครั้งค่ะ')
    }
    setBusy(false)
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md p-5 pt-10">
        <div className="card text-center">
          <div className="mb-2 text-4xl">🎉</div>
          <h1 className="text-xl font-semibold">จองคิวสำเร็จแล้ว!</h1>
          <p className="mt-2 text-mute">{done.pet} · วันที่ {done.date} เวลา {done.time} น.</p>
          <p className="mt-1 text-sm text-mute">ทางร้านจะติดต่อยืนยันคิวอีกครั้งทางเบอร์โทรที่ให้ไว้</p>
          <button className="btn mt-4" onClick={() => window.location.reload()}>จองคิวเพิ่ม</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md p-5 pb-16 pt-8">
      <div className="mb-5 text-center">
        <div className="text-2xl font-semibold text-pri">🫧 Bubble Paws</div>
        <p className="text-mute">จองคิวอาบน้ำตัดขนสัตว์เลี้ยงออนไลน์</p>
      </div>
      <div className="mb-4 flex justify-between text-xs text-mute">
        {STEPS.map((s, i) => <span key={s} className={i === step ? 'font-semibold text-pri' : ''}>{i + 1}. {s}</span>)}
      </div>
      <div className="card">
        {step === 0 && (
          <div className="grid gap-3">
            <div>
              <label className="lbl" htmlFor="ph">เบอร์โทรศัพท์</label>
              <div className="flex gap-2">
                <input id="ph" className="input" inputMode="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setChecked(false) }} placeholder="081-234-5678" />
                <button className="btn btn-alt shrink-0" disabled={busy} onClick={checkPhone}>ตรวจสอบ</button>
              </div>
            </div>
            {checked && found && <p className="text-sm text-pri">ยินดีต้อนรับกลับค่ะ คุณ{found.name} 🐾</p>}
            {checked && !found && (
              <div>
                <label className="lbl" htmlFor="nm">ชื่อของคุณ (ลูกค้าใหม่)</label>
                <input id="nm" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ-นามสกุล" />
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3">
            {pets.length > 0 && (
              <div>
                <label className="lbl" htmlFor="pp">เลือกสัตว์เลี้ยงของคุณ</label>
                <select id="pp" className="input" value={petId} onChange={(e) => setPetId(e.target.value)}>
                  {pets.map((p) => <option key={p.id} value={p.id}>{SPECIES[p.species]} {p.name}</option>)}
                  <option value="">+ เพิ่มสัตว์เลี้ยงตัวใหม่</option>
                </select>
              </div>
            )}
            {!petId && (
              <div className="grid grid-cols-2 gap-2">
                <input className="input col-span-2" placeholder="ชื่อสัตว์เลี้ยง" value={newPet.name} onChange={(e) => setNewPet({ ...newPet, name: e.target.value })} />
                <select className="input" value={newPet.species} onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}>
                  <option value="dog">สุนัข</option><option value="cat">แมว</option><option value="other">อื่นๆ</option>
                </select>
                <input className="input" placeholder="สายพันธุ์" value={newPet.breed} onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })} />
                <input className="input col-span-2" placeholder="หมายเหตุ (แพ้/ขี้กลัว) ถ้ามี" value={newPet.note} onChange={(e) => setNewPet({ ...newPet, note: e.target.value })} />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="lbl" htmlFor="bd">วันที่</label><input id="bd" type="date" min={today()} className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div><label className="lbl" htmlFor="bt">เวลา</label><input id="bt" type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} /></div>
            </div>
            <fieldset><legend className="lbl">บริการ</legend>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <label key={s.id} className="relative"><input type="checkbox" className="peer sr-only" checked={services.includes(s.id)} onChange={() => toggle(s.id)} />
                    <span className={chip(services.includes(s.id))}>{s.name} {baht(s.price)}</span></label>
                ))}
              </div>
            </fieldset>
            <div className="text-right">รวมโดยประมาณ <span className="text-xl font-semibold text-pri">{baht(svcTotal(services))}</span></div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3">
            <fieldset><legend className="lbl">ทรงตัดขน</legend>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <label key={s} className="relative"><input type="radio" name="style" className="peer sr-only" checked={style === s} onChange={() => setStyle(s)} />
                    <span className={chip(style === s)}>{s}</span></label>
                ))}
              </div>
            </fieldset>
            <div><label className="lbl" htmlFor="br">รายละเอียดเพิ่มเติมถึงช่าง (ถ้ามี)</label>
              <textarea id="br" className="input min-h-24" placeholder="เช่น ความยาวขนที่ต้องการ จุดที่ต้องระวัง" value={brief} onChange={(e) => setBrief(e.target.value)} /></div>
            <div><label className="lbl" htmlFor="ph2">แนบรูป Reference ทรงที่ต้องการ (ถ้ามี)</label>
              <input id="ph2" type="file" accept="image/*" className="input" onChange={(e) => setFile(e.target.files[0] || null)} />
              {file && <img alt="ตัวอย่างรูป Reference" src={URL.createObjectURL(file)} className="mt-2 h-24 w-24 rounded-xl object-cover" />}</div>
          </div>
        )}

        {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}

        <div className="mt-5 flex justify-between">
          <button className="btn btn-alt" onClick={back} disabled={step === 0 || busy}>ย้อนกลับ</button>
          {step < STEPS.length - 1
            ? <button className="btn" onClick={next} disabled={busy}>ถัดไป</button>
            : <button className="btn" onClick={submit} disabled={busy}>{busy ? 'กำลังจอง…' : 'ยืนยันการจอง'}</button>}
        </div>
      </div>
    </div>
  )
}

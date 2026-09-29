import { useState } from 'react'
import { useData } from './hooks/useData'
import Dashboard from './pages/Dashboard'
import Queue from './pages/Queue'
import Booking from './pages/Booking'
import Customers from './pages/Customers'
import Pos from './pages/Pos'
import Modal from './components/Modal'

const NAV = [
  ['dash', '📊', 'แดชบอร์ด'],
  ['queue', '✂️', 'คิวช่าง'],
  ['book', '📅', 'จองคิว'],
  ['cust', '🐾', 'ลูกค้า'],
  ['pos', '💳', 'ชำระเงิน'],
]

export default function App() {
  const [tab, setTab] = useState('dash')
  const [msg, setMsg] = useState('')
  const [showQr, setShowQr] = useState(false)
  const data = useData()
  const bookingUrl = `${window.location.origin}/booking`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(bookingUrl)}`

  const toast = (t) => { setMsg(t); setTimeout(() => setMsg(''), 3500) }
  const waiting = data.bookings.filter((b) => b.status === 'done').length
  const P = { ...data, toast, go: setTab }
  const Page = { dash: Dashboard, queue: Queue, book: Booking, cust: Customers, pos: Pos }[tab]

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-line bg-white p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] md:sticky md:inset-x-auto md:bottom-auto md:top-0 md:h-screen md:flex-col md:justify-start md:gap-1 md:border-r md:border-t-0 md:p-4">
        <div className="hidden px-2 pb-4 md:block">
          <div className="text-xl font-semibold text-pri">🫧 Bubble Paws</div>
          <a href="/booking" target="_blank" rel="noreferrer" className="text-xs text-mute underline">หน้าจองคิวสำหรับลูกค้า ↗</a>
          <button onClick={() => setShowQr(true)} className="mt-1 block text-xs text-mute underline">แสดง QR code ให้ลูกค้าสแกน</button>
        </div>
        {NAV.map(([k, icon, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs md:flex-row md:gap-3 md:text-sm ${tab === k ? 'bg-pri text-white' : 'text-mute hover:bg-soft'}`}>
            <span className="text-lg">{icon}</span>{label}
            {k === 'pos' && waiting > 0 && <span className="absolute right-1 top-0 rounded-full bg-sun px-1.5 text-xs text-amber-950 md:static md:ml-auto">{waiting}</span>}
          </button>
        ))}
      </nav>
      <main className="w-full max-w-5xl p-4 pb-28 md:p-6">
        {data.error && <div className="mb-4 rounded-xl bg-red-100 p-3 text-sm text-red-800">เชื่อมต่อ Supabase ไม่ได้: {data.error}<br />ตรวจสอบไฟล์ .env และรัน supabase/schema.sql แล้วหรือยัง</div>}
        {data.loading ? <p className="text-mute">กำลังโหลด…</p> : <Page {...P} />}
      </main>
      {msg && <div role="status" className="fixed bottom-24 left-1/2 z-40 max-w-[90%] -translate-x-1/2 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lg md:bottom-8">{msg}</div>}
      {showQr && (
        <Modal onClose={() => setShowQr(false)}>
          <h2 className="text-lg font-semibold">QR code จองคิว</h2>
          <p className="mt-1 text-sm text-mute">ให้ลูกค้าสแกนด้วยมือถือ เพื่อจองคิวได้เอง</p>
          <img src={qrSrc} alt="QR code ไปยังหน้าจองคิวลูกค้า" className="mx-auto mt-3 h-56 w-56 rounded-xl border border-line" />
          <p className="mt-3 break-all text-center text-sm text-pri">{bookingUrl}</p>
        </Modal>
      )}
    </div>
  )
}

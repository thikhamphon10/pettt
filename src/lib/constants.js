export const SERVICES = [
  { id: 'bath', name: 'อาบน้ำ', price: 300 },
  { id: 'cut', name: 'ตัดขน', price: 500 },
  { id: 'nail', name: 'ตัดเล็บ', price: 80 },
  { id: 'ear', name: 'ทำความสะอาดหู', price: 80 },
  { id: 'spa', name: 'สปาบำรุงขน', price: 250 },
]
export const STYLES = ['ตัดเล็มเล็กน้อย', 'ทรงเทดดี้แบร์', 'ทรงซัมเมอร์คัท', 'ทรงสิงโต', 'ทรงพุดเดิ้ล', 'ทรงเกาหลี', 'ตามรูป Reference']
export const STATUS = [
  { key: 'booked', label: 'จองแล้ว', color: 'bg-blue-100 text-blue-800' },
  { key: 'grooming', label: 'กำลังทำ', color: 'bg-amber-100 text-amber-800' },
  { key: 'done', label: 'เสร็จแล้ว รอรับ', color: 'bg-emerald-100 text-emerald-800' },
  { key: 'closed', label: 'รับกลับแล้ว', color: 'bg-gray-200 text-gray-700' },
]
export const SPECIES = { dog: '🐶', cat: '🐱', other: '🐰' }
export const PAY_METHODS = ['เงินสด', 'โอน / PromptPay', 'บัตรเครดิต']

export const baht = (n) => '฿' + Number(n || 0).toLocaleString('th-TH')
export const today = () => new Date().toLocaleDateString('sv')
export const statusOf = (k) => STATUS.find((s) => s.key === k)
export const svcTotal = (ids) => ids.reduce((a, id) => a + (SERVICES.find((s) => s.id === id)?.price || 0), 0)
export const svcNames = (ids) => ids.map((id) => SERVICES.find((s) => s.id === id)?.name).join(' + ')

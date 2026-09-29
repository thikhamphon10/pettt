export default function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {children}
        <div className="mt-4 text-right"><button className="btn btn-alt" onClick={onClose}>ปิด</button></div>
      </div>
    </div>
  )
}

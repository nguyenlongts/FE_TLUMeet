import { X } from "lucide-react"

const ModalShell=({ title, icon, onClose, children, wide })=> {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
      <div
        className={`w-full rounded-2xl border border-[#2a2245] overflow-hidden flex flex-col`}
        style={{ background: '#150f2a', maxWidth: wide ? 560 : 420, maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2245] shrink-0"
          style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">{icon}</div>
          <span className="text-white text-sm font-semibold">{title}</span>
          <button onClick={onClose}
            className="ml-auto w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors">
            <X size={13} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
export default ModalShell
import { useState, useEffect } from 'react'
// removed unused

interface Props { newLevel: number; onClose: () => void }

export default function LevelUpModal({ newLevel, onClose }: Props) {
  const [show, setShow] = useState(false)
  useEffect(() => { setTimeout(() => setShow(true), 50) }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(7,17,31,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="card text-center max-w-sm w-full mx-4 transition-all duration-500"
        style={{ transform: show ? 'scale(1)' : 'scale(0.8)', opacity: show ? 1 : 0 }}
      >
        <div className="text-6xl mb-4">🎉</div>
        <div
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-display font-black mb-4"
          style={{ background: 'linear-gradient(135deg, #6270f5, #a78bfa)', color: 'white' }}
        >
          {newLevel}
        </div>
        <h2 className="text-2xl font-display font-bold text-white">Nível {newLevel}!</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Parabéns! Subiste de nível. Continua a estudar para desbloquear mais conquistas.
        </p>
        <button onClick={onClose} className="btn-primary w-full mt-6">Continuar 🚀</button>
      </div>
    </div>
  )
}

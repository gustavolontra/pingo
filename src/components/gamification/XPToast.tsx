import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

interface Props { xp: number; onDone: () => void }

export default function XPToast({ xp, onDone }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300) }, 2500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold force-white shadow-2xl transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #6270f5, #4f4de8)',
        boxShadow: '0 8px 32px rgba(98,112,245,0.4)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
        opacity: visible ? 1 : 0,
      }}
    >
      <Zap size={20} className="text-yellow-300" />
      <span>+{xp} XP ganhos!</span>
    </div>
  )
}

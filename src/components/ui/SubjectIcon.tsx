import {
  Landmark, Globe, Ruler, BookOpen, Microscope, FlaskConical,
  Palette, Wrench, Dumbbell, Monitor, Music, Cross, Handshake,
  Languages, type LucideIcon,
} from 'lucide-react'

// Mapa: emoji stored in data → Lucide icon
const ICON_MAP: Record<string, LucideIcon> = {
  '🏛️': Landmark,
  '🌍': Globe,
  '📐': Ruler,
  '📖': BookOpen,
  '🔬': Microscope,
  '⚗️': FlaskConical,
  '🎨': Palette,
  '🔧': Wrench,
  '🏃': Dumbbell,
  '💻': Monitor,
  '🎵': Music,
  '✝️': Cross,
  '🤝': Handshake,
  '🇬🇧': Languages,
  '🇫🇷': Languages,
  '🇪🇸': Languages,
  '🇩🇪': Languages,
  '📚': BookOpen,
}

interface Props {
  icon: string
  size?: number
  color?: string
  className?: string
}

export default function SubjectIcon({ icon, size = 18, color, className }: Props) {
  const Icon = ICON_MAP[icon] ?? BookOpen
  return <Icon size={size} color={color} className={className} />
}

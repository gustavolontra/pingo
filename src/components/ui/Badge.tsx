import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  color?: string
  className?: string
}

export default function BadgeChip({ children, color = '#6270f5', className }: Props) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', className)}
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {children}
    </span>
  )
}

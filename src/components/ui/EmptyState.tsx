interface Props { emoji?: string; title: string; description?: string; action?: React.ReactNode }

export default function EmptyState({ emoji = '📭', title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="font-display font-semibold text-white text-lg">{title}</h3>
      {description && <p className="mt-2 text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

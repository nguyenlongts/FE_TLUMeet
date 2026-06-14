import React from 'react'

const StatCard=({
  icon,
  label,
  value,
  subtext,
  color,
}) =>{
  return (
    <div className="flex flex-1 min-w-[220px] items-center gap-4 p-6 border bg-[var(--surface)] border-[var(--line)] rounded-xl">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <p className="text-3xl font-bold text-[var(--content)]">{value}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{subtext}</p>
      </div>
    </div>
  )
}

export default StatCard
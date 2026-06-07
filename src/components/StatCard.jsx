import React from 'react'

const StatCard=({
  icon,
  label,
  value,
  subtext,
  color,
}) =>{
  return (
    <div className="flex flex-1 min-w-[220px] items-center gap-4 p-6 border bg-slate-800/50 backdrop-blur border-slate-700/50 rounded-xl">
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-3xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{subtext}</p>
      </div>
    </div>
  )
}

export default StatCard
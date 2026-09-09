'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, Users, Save, CheckCircle2, Sliders } from 'lucide-react'

interface SlotConfig {
  session: 'morning' | 'afternoon' | 'evening'
  name: string
  time: string
  quota: number
  price: number
  active: boolean
}

export default function SlotManager() {
  const [saved, setSaved] = useState(false)
  const [slots, setSlots] = useState<SlotConfig[]>([
    { session: 'morning', name: 'Morning Session', time: '07:00 – 10:00', quota: 20, price: 75000, active: true },
    { session: 'afternoon', name: 'Afternoon Session', time: '11:00 – 14:00', quota: 20, price: 75000, active: true },
    { session: 'evening', name: 'Evening Prime', time: '15:00 – 20:00', quota: 30, price: 85000, active: true },
  ])

  const handleUpdate = (index: number, field: keyof SlotConfig, value: any) => {
    const updated = [...slots]
    updated[index] = { ...updated[index], [field]: value }
    setSlots(updated)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-chalk font-bold text-base flex items-center gap-2">
            <Sliders size={18} className="text-lime" /> Slot & Price Manager
          </h3>
          <p className="text-slate-ash text-xs font-light">Manage daily quotas & session rates</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-lime text-granite px-4 py-2 rounded-xl text-xs font-bold tracking-wide shadow-lime-glow-sm touch-ripple hover:bg-lime-dim transition-colors"
        >
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-3">
        {slots.map((slot, index) => (
          <motion.div
            key={slot.session}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`bg-crag border rounded-2xl p-4 transition-all ${
              slot.active ? 'border-white/10' : 'border-white/5 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-chalk font-bold text-sm block">{slot.name}</span>
                <span className="text-slate-ash text-xs font-light">{slot.time}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={slot.active}
                  onChange={e => handleUpdate(index, 'active', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-granite peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-chalk after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Daily Quota */}
              <div className="bg-granite rounded-xl p-2.5 border border-white/5">
                <div className="flex items-center gap-1 text-slate-ash text-[10px] uppercase tracking-wider mb-1 font-light">
                  <Users size={11} className="text-cyan-climb" /> Max Quota
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={slot.quota}
                    onChange={e => handleUpdate(index, 'quota', parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-chalk font-bold text-lg focus:outline-none"
                  />
                  <span className="text-slate-ash text-xs font-light">slots</span>
                </div>
              </div>

              {/* Session Price */}
              <div className="bg-granite rounded-xl p-2.5 border border-white/5">
                <div className="flex items-center gap-1 text-slate-ash text-[10px] uppercase tracking-wider mb-1 font-light">
                  <DollarSign size={11} className="text-lime" /> Rate (IDR)
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-ash text-xs font-light">Rp</span>
                  <input
                    type="number"
                    step="5000"
                    value={slot.price}
                    onChange={e => handleUpdate(index, 'price', parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-chalk font-bold text-base focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

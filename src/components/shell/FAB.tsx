'use client'

import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface FABProps {
  onPress?: () => void
  label?: string
}

export default function FAB({ onPress, label = 'Log Ascent' }: FABProps) {
  const [pressed, setPressed] = useState(false)

  return (
    <motion.button
      className="md:hidden fixed right-4 z-50 flex items-center gap-2 bg-lime text-granite rounded-2xl shadow-lime-glow font-light tracking-wide text-sm px-4 h-14 min-w-[56px] touch-ripple"
      style={{ bottom: 'calc(4.5rem + 12px + env(safe-area-inset-bottom))' }}
      onClick={onPress}
      onTapStart={() => setPressed(true)}
      onTap={() => setPressed(false)}
      onTapCancel={() => setPressed(false)}
      animate={{
        scale: pressed ? 0.94 : 1,
        boxShadow: pressed
          ? '0 0 8px rgba(204,255,0,0.2)'
          : '0 0 20px rgba(204,255,0,0.4)',
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Plus size={18} strokeWidth={2} />
      <AnimatePresence>
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          className="font-light tracking-wide whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

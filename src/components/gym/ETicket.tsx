'use client'

import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle, Download, Share2, Calendar, Clock, Users, MapPin } from 'lucide-react'
import { BookingData } from './SlotPicker'

interface ETicketProps {
  booking: BookingData
  bookingCode: string
  onClose: () => void
}

export default function ETicket({ booking, bookingCode, onClose }: ETicketProps) {
  const qrData = JSON.stringify({
    code: bookingCode,
    gym: booking.gymId,
    session: booking.session,
    date: booking.date,
    qty: booking.quantity,
  })

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-sm bg-crag rounded-t-3xl overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      >
        {/* Success header */}
        <div className="bg-lime/10 px-5 py-6 text-center border-b border-lime/10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
          >
            <CheckCircle size={40} className="text-lime mx-auto mb-2" />
          </motion.div>
          <h2 className="text-chalk font-bold text-lg">Booking Confirmed!</h2>
          <p className="text-slate-ash text-sm font-light">{booking.gymName}</p>
        </div>

        {/* Ticket body */}
        <div className="p-5">
          {/* Serrated edge simulation */}
          <div className="flex items-center gap-1 mb-4 -mx-5 px-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full bg-granite" />
            ))}
          </div>

          {/* Booking details */}
          <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
            {[
              { icon: Calendar, label: 'Tanggal', value: booking.date.split(',')[0] || booking.date },
              { icon: Clock, label: 'Sesi', value: `${booking.sessionLabel} · ${booking.sessionTime}` },
              { icon: Users, label: 'Tiket', value: `${booking.quantity} orang` },
              { icon: MapPin, label: 'Venue', value: booking.gymName.split(' ').slice(0, 2).join(' ') },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-granite rounded-xl p-2.5">
                <div className="flex items-center gap-1 mb-1">
                  <Icon size={11} className="text-slate-ash" />
                  <span className="text-slate-ash text-[10px] uppercase tracking-wider font-light">{label}</span>
                </div>
                <span className="text-chalk text-xs font-normal">{value}</span>
              </div>
            ))}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center bg-white rounded-2xl p-4 mb-4">
            <QRCodeSVG
              value={qrData}
              size={160}
              bgColor="#ffffff"
              fgColor="#12161A"
              level="H"
            />
            <div className="mt-3 text-center">
              <p className="text-granite text-xs font-light text-slate-ash/70">Booking Code</p>
              <p className="text-granite font-bold text-xl tracking-widest font-mono">{bookingCode}</p>
              <p className="text-granite/40 text-[10px] font-light">Tunjukkan ke kasir saat check-in</p>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mb-5 bg-lime/5 border border-lime/10 rounded-xl p-3">
            <span className="text-slate-ash text-sm font-light">Total Dibayar</span>
            <span className="text-lime font-bold text-lg">
              Rp {booking.totalPrice.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 h-11 bg-crag-light rounded-xl flex items-center justify-center gap-2 text-slate-ash text-sm font-light tracking-wide touch-ripple hover:text-chalk transition-colors">
              <Download size={16} /> Simpan
            </button>
            <button className="flex-1 h-11 bg-crag-light rounded-xl flex items-center justify-center gap-2 text-slate-ash text-sm font-light tracking-wide touch-ripple hover:text-chalk transition-colors">
              <Share2 size={16} /> Share
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-11 bg-lime rounded-xl text-granite text-sm font-light tracking-wide touch-ripple hover:bg-lime-dim transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

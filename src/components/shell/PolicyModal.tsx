'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  HelpCircle,
  Shield,
  BookOpen,
  Clock,
  RefreshCw,
  Phone,
  Info,
  Mail,
  Instagram,
  MessageCircle,
  LucideIcon,
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export type PolicyKey = 'faq' | 'privacy' | 'guideline' | 'cancellation' | 'refund' | 'contact' | 'about'

interface PolicyModalProps {
  isOpen: boolean
  activeKey: PolicyKey | null
  onClose: () => void
}

const POLICY_DETAILS: Record<
  PolicyKey,
  {
    title: string
    subtitle: string
    icon: LucideIcon
    content: React.ReactNode
  }
> = {
  faq: {
    title: 'Frequently Asked Questions (F.A.Q)',
    subtitle: 'Pertanyaan seputar pencatatan rute, share card, dan fitur Jalur',
    icon: HelpCircle,
    content: (
      <div className="space-y-4 text-xs leading-relaxed">
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1.5">
          <h4 className="font-bold text-sm">Bagaimana cara mencatat (log) verified ascent?</h4>
          <p className="opacity-80">
            Buka menu <b>Boulders & Topo</b>, pilih jalur boulder yang telah Anda selesaikan, lalu klik tombol <b>Log Ascent</b>. Anda dapat mengunggah foto atau cuplikan video sebagai bukti pendakian, menentukan gaya pemanjatan (Flash, Redpoint, Onsight), dan otomatis mendapatkan <b>Ascent Share Card</b> untuk disimpan ke galeri ponsel.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1.5">
          <h4 className="font-bold text-sm">Apakah saya bisa menambahkan rute baru di tebing alam?</h4>
          <p className="opacity-80">
            Demi akurasi topo dan keselamatan bersama, jalur tebing alam (outdoor crags) saat ini dikurasi secara resmi oleh tim kurator. Anda dapat mengajukan jalur boulder baru melalui tombol <b>+ Submit Boulder Problem</b> di menu aksi.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1.5">
          <h4 className="font-bold text-sm">Bagaimana cara menyimpan share card ke galeri foto iPhone?</h4>
          <p className="opacity-80">
            Pada perangkat iOS Safari, klik tombol <b>Simpan ke Foto / Bagikan</b> lalu pilih menu <b>"Save Image"</b> pada share sheet bawaan iPhone. Anda juga bisa menekan dan menahan (long-press) foto preview kartu lalu memilih <b>"Simpan ke Foto"</b>.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1.5">
          <h4 className="font-bold text-sm">Bagaimana cara memesan tiket sesi di Boulder Gym?</h4>
          <p className="opacity-80">
            Kunjungi menu <b>Gym Directory</b>, pilih gym mitra, tentukan tanggal serta jam sesi, dan selesaikan pemesanan. E-Ticket dengan kode QR unik akan otomatis terbit untuk di-scan oleh kasir saat tiba di gym.
          </p>
        </div>
      </div>
    ),
  },

  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Kebijakan perlindungan data pribadi dan privasi pengguna Jalur',
    icon: Shield,
    content: (
      <div className="space-y-4 text-xs leading-relaxed">
        <p className="opacity-85">
          Di <b>Jalur (ClimbingHub)</b>, kami memprioritaskan keamanan dan privasi data para pemanjat tebing di seluruh Indonesia.
        </p>

        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <h5 className="font-bold mb-1">1. Informasi yang Kami Kumpulkan</h5>
            <p className="opacity-80">
              Data profil (nama pemanjat, kontak, avatar), log pendakian (ascent history, grade catatan, video/foto beta), serta data transaksi pemesanan tiket bouldering gym.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <h5 className="font-bold mb-1">2. Penggunaan Media & Video Beta</h5>
            <p className="opacity-80">
              Media foto dan video yang diunggah saat mencatat ascent hanya digunakan untuk verifikasi pencapaian rute dan pembuatan share card. Hak cipta media sepenuhnya tetap milik pemanjat.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <h5 className="font-bold mb-1">3. Keamanan Data & Pihak Ketiga</h5>
            <p className="opacity-80">
              Kami tidak pernah menjual data pribadi Anda kepada pihak ketiga mana pun. Data transaksi diproses secara terenkripsi dengan protokol keamanan mutakhir.
            </p>
          </div>
        </div>
      </div>
    ),
  },

  guideline: {
    title: 'Community Guideline',
    subtitle: 'Etika pemanjatan, keselamatan, dan konservasi alam',
    icon: BookOpen,
    content: (
      <div className="space-y-3.5 text-xs leading-relaxed">
        <p className="opacity-85">
          Komunitas pemanjat tebing dibangun di atas rasa saling menghargai, menjaga alam, dan saling mendukung keselamatan:
        </p>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">🌿 Prinsip Leave No Trace (LNT)</h5>
          <p className="opacity-80">
            Bawa pulang seluruh sampah Anda tanpa terkecuali, termasuk puntung rokok dan kulit buah. Jangan mengubah struktur alami tebing atau merusak vegetasi di sekitar area bouldering.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">🧹 Bersihkan Chalk & Tick Marks</h5>
          <p className="opacity-80">
            Selalu sikat sisa chalk tebal dan tanda garis tick mark di tebing setelah sesi selesai dengan sikat berbulu halus (nylon/boar hair) agar batu tidak licin dan tetap estetik bagi pemanjat berikutnya.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">🤝 Etika di Gym & Tebing</h5>
          <p className="opacity-80">
            Beri ruang bagi pemanjat yang sedang berada di dinding, jangan melintas di bawah fall zone orang lain, dan berikan dorongan positif (psyche) kepada sesama climber.
          </p>
        </div>
      </div>
    ),
  },

  cancellation: {
    title: 'Cancellation Policy',
    subtitle: 'Ketentuan pembatalan dan perubahan jadwal tiket sesi gym',
    icon: Clock,
    content: (
      <div className="space-y-3.5 text-xs leading-relaxed">
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">⏱ Batas Waktu Pembatalan (H-1)</h5>
          <p className="opacity-80">
            Pembatalan atau permintaan pergantian jadwal (reschedule) dapat diajukan selambat-lambatnya 24 jam sebelum slot waktu sesi pemanjatan Anda dimulai.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">🔄 Fasilitas Reschedule</h5>
          <p className="opacity-80">
            Setiap tiket gym memiliki hak 1 kali bebas reschedule ke jadwal lain yang masih tersedia dalam kurun waktu 30 hari sejak tanggal pembelian.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">⚠️ Ketidakhadiran (No-Show)</h5>
          <p className="opacity-80">
            Jika pemesan tidak hadir tanpa pemberitahuan sebelumnya hingga sesi berakhir, tiket dinyatakan hangus dan tidak dapat dipindahtangankan atau di-refund.
          </p>
        </div>
      </div>
    ),
  },

  refund: {
    title: 'Refund Policy',
    subtitle: 'Kebijakan pengembalian dana transaksi pemesanan gym',
    icon: RefreshCw,
    content: (
      <div className="space-y-3.5 text-xs leading-relaxed">
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">💯 Pengembalian Dana Penuh (100%)</h5>
          <p className="opacity-80">
            Refund penuh diberikan jika penutupan fasilitas terjadi karena keputusan sepihak dari pengelola gym (seperti perbaikan darurat dinding, maintenance keselamatan, atau agenda kompetisi tertutup).
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">⚡ Prosedur & Waktu Proses</h5>
          <p className="opacity-80">
            Dana yang disetujui untuk di-refund akan dikembalikan ke metode pembayaran asal (Transfer Bank, E-Wallet, atau QRIS) dalam waktu 3 hingga 5 hari kerja.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">🎟 Pilihan Voucher Kredit</h5>
          <p className="opacity-80">
            Sebagai alternatif cepat, Anda dapat memilih penukaran dalam bentuk kredit saldo atau voucher sesi climbing instan tanpa masa kedaluwarsa.
          </p>
        </div>
      </div>
    ),
  },

  contact: {
    title: 'Contact Us',
    subtitle: 'Layanan bantuan, kemitraan gym, dan kolaborasi komunitas',
    icon: Phone,
    content: (
      <div className="space-y-4 text-xs leading-relaxed">
        <p className="opacity-85">
          Punya pertanyaan seputar panduan jalur, kemitraan climbing gym, atau kendala teknis? Tim Jalur siap membantu Anda:
        </p>

        <div className="space-y-2.5">
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-lime/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} />
            </div>
            <div>
              <div className="font-bold text-sm">WhatsApp Admin</div>
              <div className="opacity-70 text-[11px]">+62 812-3456-7890 (Chat Support)</div>
            </div>
          </a>

          <a
            href="https://instagram.com/jalur.climb"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-pink-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center flex-shrink-0">
              <Instagram size={18} />
            </div>
            <div>
              <div className="font-bold text-sm">Instagram Resmi</div>
              <div className="opacity-70 text-[11px]">@jalur.climb</div>
            </div>
          </a>

          <a
            href="mailto:support@jalurclimbing.id"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-lime/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center flex-shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <div className="font-bold text-sm">Email Support</div>
              <div className="opacity-70 text-[11px]">support@jalurclimbing.id</div>
            </div>
          </a>
        </div>
      </div>
    ),
  },

  about: {
    title: 'About Jalur',
    subtitle: 'Ekosistem digital panjat tebing terintegrasi di Indonesia',
    icon: Info,
    content: (
      <div className="space-y-4 text-xs leading-relaxed">
        <div className="text-center py-2">
          <img
            src="/jalur-logo.png"
            alt="Jalur Logo"
            className="h-10 mx-auto object-contain mb-2 mix-blend-multiply dark:mix-blend-screen dark:invert"
          />
          <p className="font-bold text-sm">JALUR · Indonesian Climbing & Bouldering Hub</p>
        </div>

        <p className="opacity-85">
          <b>Jalur</b> lahir dari semangat komunitas pemanjat tebing untuk mendokumentasikan keindahan alam batu nusantara, menyediakan topo jalur boulder yang akurat, serta mempermudah akses ke arena boulder gym modern di seluruh Indonesia.
        </p>

        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <h5 className="font-bold mb-1">🎯 Visi Kami</h5>
            <p className="opacity-80">
              Menjadi wadah digital terdepan yang mempertemukan climber, route setter, gym partner, dan komunitas pecinta tebing alam dalam satu ekosistem yang inklusif dan berkelanjutan.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <h5 className="font-bold mb-1">🏔 Fitur Unggulan</h5>
            <p className="opacity-80">
              Peta interaktif crags outdoor, topo garis jalur boulder, Personal Beta Book dengan rekam video send, reward kartu Strava-style otomatis, direktori gym dengan sistem booking slot kasir real-time.
            </p>
          </div>
        </div>
      </div>
    ),
  },
}

export default function PolicyModal({ isOpen, activeKey, onClose }: PolicyModalProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'

  if (!isOpen || !activeKey) return null

  const details = POLICY_DETAILS[activeKey]
  if (!details) return null

  const Icon = details.icon

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative z-10 w-full max-w-lg rounded-3xl border p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col ${
            isSandstone
              ? 'bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815]'
              : 'bg-[#1a1815] border-white/15 text-chalk'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${
                  isSandstone
                    ? 'border-[#1a1815]/20 bg-[#1a1815]/10 text-[#1a1815]'
                    : 'border-lime/30 bg-lime/10 text-lime'
                }`}
              >
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">{details.title}</h3>
                <p className="text-[11px] opacity-70 font-light">{details.subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isSandstone ? 'hover:bg-[#1a1815]/10 text-[#1a1815]' : 'hover:bg-white/10 text-chalk'
              }`}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto py-4 pr-1 space-y-4 no-scrollbar flex-1">
            {details.content}
          </div>

          {/* Footer Close Button */}
          <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSandstone
                  ? 'border-[#1a1815] bg-[#1a1815] text-[#ded3be] hover:opacity-90'
                  : 'border-lime bg-lime text-granite hover:bg-lime-dim'
              }`}
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

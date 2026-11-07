'use client'

export type OrderType = 'gym' | 'rent' | 'trip' | 'event'
export type OrderStatus = 'draft' | 'active' | 'history'

export interface OrderWalletItem {
  id: string
  type: OrderType
  status: OrderStatus
  title: string
  categoryLabel: string
  venueOrLocation: string
  bookingCode: string
  qrData?: string
  date: string
  time?: string
  totalPrice: number
  quantity?: number
  details?: Record<string, any>
  createdAt: string
  expiryDate?: string
}

const DEFAULT_ORDERS: OrderWalletItem[] = [
  // 1. DRAFT PURCHASING ACTIVITIES (Unfinished / Pending Checkout)
  {
    id: 'ord-draft-1',
    type: 'gym',
    status: 'draft',
    title: 'Peak to Peak Bouldering — Single Entry Pass',
    categoryLabel: 'Gym Booking',
    venueOrLocation: 'Tangerang Selatan, Banten',
    bookingCode: 'DFT-PP2091',
    date: 'Saturday, 2 May 2026',
    time: '14:00 – 18:00 (Afternoon Slot)',
    totalPrice: 135000,
    quantity: 1,
    details: {
      step: 'Awaiting Payment Confirmation',
      items: ['Day Pass (1x)', 'Rental Climbing Shoes (1x)'],
      expiresIn: '23h 40m',
    },
    createdAt: '2026-04-14',
  },
  {
    id: 'ord-draft-2',
    type: 'rent',
    status: 'draft',
    title: 'Citatah Outdoor Bouldering Crash Pad Rental',
    categoryLabel: 'Rent Gear',
    venueOrLocation: 'Basecamp Padalarang, Bandung Barat',
    bookingCode: 'DFT-RG8812',
    date: 'Sunday, 3 May 2026',
    totalPrice: 95000,
    details: {
      step: 'Items in Cart · Unfinished Checkout',
      items: ['Mad Rock Crashpad (1x)', 'Boar Hair Brush (1x)'],
      pickupPoint: 'Basecamp Citatah 125',
    },
    createdAt: '2026-04-14',
  },
  {
    id: 'ord-draft-3',
    type: 'trip',
    status: 'draft',
    title: 'Harau Valley 3D2N Open Trip — Slot Booking',
    categoryLabel: 'Trip Plan',
    venueOrLocation: 'Lembah Harau, Sumatera Barat',
    bookingCode: 'DFT-TR4019',
    date: '25 – 27 May 2026',
    totalPrice: 650000,
    details: {
      step: 'Draft Registration · Incomplete Roster',
      coordinator: 'Local Guides & Jalur Crew',
      slots: '1 Climber',
    },
    createdAt: '2026-04-12',
  },

  // 2. ACTIVE ORDERS (Confirmed Passes & Bookings)
  {
    id: 'ord-gym-1',
    type: 'gym',
    status: 'active',
    title: 'IndoClimb FX Sudirman — Day Pass',
    categoryLabel: 'Gym Booking',
    venueOrLocation: 'Jakarta Pusat, DKI Jakarta',
    bookingCode: 'CH-FX8842',
    date: 'Saturday, 18 April 2026',
    time: '11:00 – 14:00 (Afternoon)',
    totalPrice: 165000,
    quantity: 1,
    details: {
      addons: ['Climbing Shoes (1x)', 'Private Trainer (1x)'],
    },
    createdAt: '2026-04-10',
    expiryDate: '2026-04-18',
  },
  {
    id: 'ord-rent-1',
    type: 'rent',
    status: 'active',
    title: 'Outdoor Gear Rental — Citatah Bouldering',
    categoryLabel: 'Rent Gear',
    venueOrLocation: 'Bandung (Basecamp Padalarang)',
    bookingCode: 'RG-CT9021',
    date: 'Sunday, 19 April 2026',
    totalPrice: 125000,
    details: {
      items: ['Crashpad Mad Rock (2x)', 'Chalk Bucket & Brush (1x)'],
      pickupPoint: 'Basecamp Citatah 125, Padalarang',
      renterPhone: '+62 812-3456-7890',
    },
    createdAt: '2026-04-11',
    expiryDate: '2026-04-19',
  },
  {
    id: 'ord-trip-1',
    type: 'trip',
    status: 'active',
    title: 'Open Trip — Harau Valley Granite Tour',
    categoryLabel: 'Trip Plan',
    venueOrLocation: 'Harau Valley, Sumatera Barat',
    bookingCode: 'TP-HV4412',
    date: '25 – 27 April 2026',
    totalPrice: 450000,
    details: {
      meetingPoint: 'Bandara Minangkabau (BIM) Padang',
      coordinator: 'Rizki & Local Guides',
      slots: '1 Climber',
    },
    createdAt: '2026-04-05',
    expiryDate: '2026-04-27',
  },

  // 3. HISTORY PURCHASING ACTIVITIES (Past Completed Transactions)
  {
    id: 'ord-hist-1',
    type: 'gym',
    status: 'history',
    title: 'Bremgra Indoor Climbing — Morning Slot',
    categoryLabel: 'Gym Booking',
    venueOrLocation: 'Tangerang Selatan, Banten',
    bookingCode: 'CH-BM1102',
    date: '12 March 2026',
    time: '08:00 – 11:00',
    totalPrice: 90000,
    quantity: 1,
    createdAt: '2026-03-10',
    expiryDate: '2026-03-12',
  },
  {
    id: 'ord-hist-2',
    type: 'rent',
    status: 'history',
    title: 'Dynamic Rope 60m & Quickdraw Set',
    categoryLabel: 'Rent Gear',
    venueOrLocation: 'Tebing Siung, Yogyakarta',
    bookingCode: 'RG-SG5531',
    date: '20 February 2026',
    totalPrice: 180000,
    createdAt: '2026-02-18',
    expiryDate: '2026-02-21',
  },
]

const STORAGE_KEY = 'jalur_wallet_orders_v2'

export function getWalletOrders(): OrderWalletItem[] {
  if (typeof window === 'undefined') return DEFAULT_ORDERS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS))
      return DEFAULT_ORDERS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_ORDERS
  }
}

export function addWalletOrder(order: OrderWalletItem): void {
  if (typeof window === 'undefined') return
  const current = getWalletOrders()
  const next = [order, ...current]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('wallet-updated', { detail: next }))
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  if (typeof window === 'undefined') return
  const current = getWalletOrders()
  const next = current.map((ord) => (ord.id === id ? { ...ord, status } : ord))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('wallet-updated', { detail: next }))
}

export function deleteWalletOrder(id: string): void {
  if (typeof window === 'undefined') return
  const current = getWalletOrders()
  const next = current.filter((ord) => ord.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('wallet-updated', { detail: next }))
}

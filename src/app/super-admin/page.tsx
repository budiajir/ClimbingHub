'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  ShieldAlert,
  Users,
  Mountain,
  Store,
  Compass,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  X,
  ExternalLink,
  Crown,
  Activity,
  Layers,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import {
  getSuperAdminStatsAction,
  getSuperAdminUsersAction,
  updateUserRoleAction,
  getSuperAdminCragsAction,
  createCragAction,
  getSuperAdminRoutesAction,
  createRouteAction,
  deleteRouteAction,
  getSuperAdminGymsAction,
  type SuperAdminStats,
  type SuperAdminUserItem,
  type SuperAdminCragItem,
  type SuperAdminRouteItem,
  type SuperAdminGymItem,
} from '@/lib/actions/super-admin'
import type { UserRole } from '@/lib/permissions'

type DashboardTab = 'overview' | 'users' | 'crags' | 'gyms'

export default function SuperAdminPage() {
  const { role, user, isAuthenticated, isSessionPending } = useAuth()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  // Data states
  const [stats, setStats] = useState<SuperAdminStats | null>(null)
  const [users, setUsers] = useState<SuperAdminUserItem[]>([])
  const [crags, setCrags] = useState<SuperAdminCragItem[]>([])
  const [routesList, setRoutesList] = useState<SuperAdminRouteItem[]>([])
  const [gymsList, setGymsList] = useState<SuperAdminGymItem[]>([])

  // Search & filter
  const [userSearch, setUserSearch] = useState('')
  const [routeSearch, setRouteSearch] = useState('')

  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingCrags, setIsLoadingCrags] = useState(false)
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false)
  const [isLoadingGyms, setIsLoadingGyms] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Toast / feedback message
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modals
  const [showAddCragModal, setShowAddCragModal] = useState(false)
  const [showAddRouteModal, setShowAddRouteModal] = useState(false)

  // Forms
  const [newCrag, setNewCrag] = useState({
    name: '',
    province: 'Jawa Barat',
    city: '',
    description: '',
    accessInfo: '',
    lat: -6.83,
    lng: 107.45,
    imageUrl: '',
  })

  const [newRoute, setNewRoute] = useState({
    cragId: '',
    name: '',
    grade: '5.10a',
    discipline: 'sport' as 'sport' | 'multipitch' | 'bouldering',
    description: '',
    setter: 'Super Admin',
    pitchLength: '20m',
    boltCount: 8,
    anchorType: 'Double Ring Anchor',
    imageUrl: '',
  })

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type })
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Load initial stats
  useEffect(() => {
    if (role === 'super_admin') {
      setIsLoadingStats(true)
      getSuperAdminStatsAction()
        .then((data) => setStats(data))
        .finally(() => setIsLoadingStats(false))
    }
  }, [role])

  // Load tab-specific data
  useEffect(() => {
    if (role !== 'super_admin') return

    if (activeTab === 'users') {
      setIsLoadingUsers(true)
      getSuperAdminUsersAction(userSearch)
        .then((data) => setUsers(data))
        .finally(() => setIsLoadingUsers(false))
    } else if (activeTab === 'crags') {
      setIsLoadingCrags(true)
      setIsLoadingRoutes(true)
      Promise.all([
        getSuperAdminCragsAction().then((c) => {
          setCrags(c)
          if (c.length > 0 && !newRoute.cragId) {
            setNewRoute((prev) => ({ ...prev, cragId: c[0].id }))
          }
        }),
        getSuperAdminRoutesAction(routeSearch).then((r) => setRoutesList(r)),
      ]).finally(() => {
        setIsLoadingCrags(false)
        setIsLoadingRoutes(false)
      })
    } else if (activeTab === 'gyms') {
      setIsLoadingGyms(true)
      getSuperAdminGymsAction()
        .then((data) => setGymsList(data))
        .finally(() => setIsLoadingGyms(false))
    }
  }, [activeTab, role])

  // Handle user role update
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, newRole)
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        )
        showToast(`Role pengguna berhasil diubah menjadi ${newRole}.`)
      } else {
        showToast(res.error || 'Gagal mengubah role.', 'error')
      }
    })
  }

  // Handle create crag
  const handleCreateCrag = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await createCragAction(newCrag)
      if (res.ok) {
        showToast(`Tebing "${newCrag.name}" berhasil dibuat!`)
        setShowAddCragModal(false)
        setNewCrag({
          name: '',
          province: 'Jawa Barat',
          city: '',
          description: '',
          accessInfo: '',
          lat: -6.83,
          lng: 107.45,
          imageUrl: '',
        })
        const updatedCrags = await getSuperAdminCragsAction()
        setCrags(updatedCrags)
      } else {
        showToast(res.error || 'Gagal membuat tebing.', 'error')
      }
    })
  }

  // Handle create route
  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoute.cragId) {
      showToast('Pilih tebing terlebih dahulu.', 'error')
      return
    }
    startTransition(async () => {
      const res = await createRouteAction(newRoute)
      if (res.ok) {
        showToast(`Jalur "${newRoute.name}" (${newRoute.grade}) berhasil ditambahkan!`)
        setShowAddRouteModal(false)
        setNewRoute({
          cragId: crags[0]?.id || '',
          name: '',
          grade: '5.10a',
          discipline: 'sport',
          description: '',
          setter: user?.name || 'Super Admin',
          pitchLength: '20m',
          boltCount: 8,
          anchorType: 'Double Ring Anchor',
          imageUrl: '',
        })
        const updatedRoutes = await getSuperAdminRoutesAction(routeSearch)
        setRoutesList(updatedRoutes)
      } else {
        showToast(res.error || 'Gagal membuat jalur.', 'error')
      }
    })
  }

  // Handle delete route
  const handleDeleteRoute = async (routeId: string, routeName: string) => {
    if (!confirm(`Hapus jalur "${routeName}" secara permanen?`)) return
    startTransition(async () => {
      const res = await deleteRouteAction(routeId)
      if (res.ok) {
        setRoutesList((prev) => prev.filter((r) => r.id !== routeId))
        showToast(`Jalur "${routeName}" telah dihapus.`)
      } else {
        showToast(res.error || 'Gagal menghapus jalur.', 'error')
      }
    })
  }

  // Gate check: If session pending
  if (isSessionPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-lime" size={32} />
      </div>
    )
  }

  // Gate check: If not super admin
  if (role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white">403: Akses Terbatas</h1>
        <p className="text-xs text-white/70 leading-relaxed font-light">
          Halaman ini dikhususkan bagi <b>Super Admin (Pengelola Utama Web Jalur)</b>. Akun Anda saat ini memiliki status <b>{role}</b>.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime text-granite font-bold text-xs shadow-lime-glow hover:bg-lime-dim transition-all"
          >
            <ChevronLeft size={16} />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-24 ${isSandstone ? 'bg-[#e8decb] text-[#1a1815]' : 'bg-[#101317] text-chalk'}`}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] animate-fadeIn">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 ${
              toastMsg.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/95 border-red-500/40 text-red-300'
            }`}
          >
            {toastMsg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-white/10 sticky top-0 z-30 bg-[#101317]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 transition-colors"
              title="Ke Halaman Utama"
            >
              <ChevronLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-amber-400" />
                <h1 className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                  Jalur Platform Control
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-[10px] text-white/50">
                Pusat Kendali Pengelola: {user?.name || 'Budiaji Ramadan'} ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/beta"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-all"
            >
              <span>Explore Topo &rarr;</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-white/10">
          {[
            { key: 'overview', label: 'Ringkasan Platform', icon: Activity },
            { key: 'users', label: 'Manajemen Pengguna', icon: Users },
            { key: 'crags', label: 'Kelola Tebing & Jalur', icon: Mountain },
            { key: 'gyms', label: 'Mitra Gym', icon: Store },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as DashboardTab)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-lime text-granite shadow-lime-glow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: OVERVIEW METRICS */}
        {/* ==================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top 4 Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="p-4 md:p-5 rounded-3xl bg-[#161a1f] border border-white/10 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-lime/10 text-lime border border-lime/20 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[11px] text-white/60 font-medium">Total Akun Terdaftar</p>
                  <p className="text-2xl md:text-3xl font-extrabold text-white">
                    {stats?.totalUsers ?? '...'}
                  </p>
                </div>
              </div>

              <div className="p-4 md:p-5 rounded-3xl bg-[#161a1f] border border-white/10 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                  <Mountain size={20} />
                </div>
                <div>
                  <p className="text-[11px] text-white/60 font-medium">Tebing & Jalur Alami</p>
                  <p className="text-2xl md:text-3xl font-extrabold text-white">
                    {stats ? `${stats.totalCrags} / ${stats.totalRoutes}` : '...'}
                  </p>
                </div>
              </div>

              <div className="p-4 md:p-5 rounded-3xl bg-[#161a1f] border border-white/10 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                  <Store size={20} />
                </div>
                <div>
                  <p className="text-[11px] text-white/60 font-medium">Mitra Climbing Gym</p>
                  <p className="text-2xl md:text-3xl font-extrabold text-white">
                    {stats?.totalGyms ?? '...'}
                  </p>
                </div>
              </div>

              <div className="p-4 md:p-5 rounded-3xl bg-[#161a1f] border border-white/10 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-[11px] text-white/60 font-medium">Total Log Pendakian</p>
                  <p className="text-2xl md:text-3xl font-extrabold text-white">
                    {stats?.totalAscents ?? '...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Role Breakdown Distribution */}
            <div className="p-6 rounded-3xl bg-[#161a1f] border border-white/10 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Crown size={16} className="text-amber-400" />
                <span>Distribusi 5 Role Akun Pengguna</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                    🧗 Climber
                  </div>
                  <div className="text-xl font-bold text-lime">
                    {stats?.climbersCount ?? 0}
                  </div>
                  <div className="text-[10px] text-white/40">Pemanjat Umum</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                    🔨 Route Setter
                  </div>
                  <div className="text-xl font-bold text-orange-400">
                    {stats?.settersCount ?? 0}
                  </div>
                  <div className="text-[10px] text-white/40">Bikin Jalur & Topo</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                    🧭 Trip Guide
                  </div>
                  <div className="text-xl font-bold text-emerald-400">
                    {stats?.guidesCount ?? 0}
                  </div>
                  <div className="text-[10px] text-white/40">Pemandu Open Trip</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                    🏪 Admin Gym
                  </div>
                  <div className="text-xl font-bold text-cyan-400">
                    {stats?.gymAdminsCount ?? 0}
                  </div>
                  <div className="text-[10px] text-white/40">Pengelola Fasilitas</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                    👑 Super Admin
                  </div>
                  <div className="text-xl font-bold text-amber-400">
                    {stats?.superAdminsCount ?? 0}
                  </div>
                  <div className="text-[10px] text-white/40">Pemilik / Pengelola</div>
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161a1f] to-[#1d2228] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Mountain size={16} className="text-orange-400" />
                    <span>Tambah Data Baru</span>
                  </div>
                  <span className="text-[10px] text-white/40">Akses Cepat</span>
                </div>
                <p className="text-xs text-white/70 font-light leading-relaxed">
                  Super Admin memiliki wewenang untuk menambahkan tebing baru di wilayah Indonesia atau menambahkan rute/topo langsung ke database.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('crags')
                      setShowAddCragModal(true)
                    }}
                    className="px-4 py-2 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold text-xs hover:bg-orange-500/25 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>+ Tebing Baru</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('crags')
                      setShowAddRouteModal(true)
                    }}
                    className="px-4 py-2 rounded-xl bg-lime/15 text-lime border border-lime/30 font-bold text-xs hover:bg-lime/25 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>+ Jalur Baru</span>
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161a1f] to-[#1d2228] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Users size={16} className="text-lime" />
                    <span>Kelola Pengguna & Mitra</span>
                  </div>
                  <span className="text-[10px] text-white/40">Verifikasi</span>
                </div>
                <p className="text-xs text-white/70 font-light leading-relaxed">
                  Verifikasi climber yang mendaftar sebagai Route Setter atau Trip Guide dengan menaikkan role akun mereka secara langsung.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className="px-4 py-2 rounded-xl bg-lime text-granite font-bold text-xs shadow-lime-glow hover:bg-lime-dim transition-all flex items-center gap-1.5"
                  >
                    <Users size={14} />
                    <span>Buka Daftar Pengguna &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: USER MANAGEMENT */}
        {/* ==================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search Box */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-3 text-white/40" />
                <input
                  type="text"
                  placeholder="Cari user berdasarkan nama atau email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsLoadingUsers(true)
                      getSuperAdminUsersAction(userSearch)
                        .then((d) => setUsers(d))
                        .finally(() => setIsLoadingUsers(false))
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#161a1f] border border-white/10 text-xs text-white placeholder:text-white/40 outline-none focus:border-lime/40"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLoadingUsers(true)
                  getSuperAdminUsersAction(userSearch)
                    .then((d) => setUsers(d))
                    .finally(() => setIsLoadingUsers(false))
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5"
              >
                <span>Cari</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl bg-[#161a1f] border border-white/10 overflow-hidden shadow-2xl">
              {isLoadingUsers ? (
                <div className="py-16 text-center">
                  <Loader2 className="animate-spin text-lime mx-auto" size={24} />
                  <p className="text-xs text-white/50 mt-2">Memuat daftar pengguna...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Users className="mx-auto text-white/30" size={32} />
                  <p className="text-xs text-white/60">Tidak ada pengguna ditemukan.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-white/80">
                    <thead className="border-b border-white/10 bg-black/30 text-[10px] uppercase font-bold tracking-wider text-white/50">
                      <tr>
                        <th className="px-4 py-3.5">Nama & Profil</th>
                        <th className="px-4 py-3.5">Email</th>
                        <th className="px-4 py-3.5">Role Saat Ini</th>
                        <th className="px-4 py-3.5 text-center">Ascents</th>
                        <th className="px-4 py-3.5">Terdaftar</th>
                        <th className="px-4 py-3.5 text-right">Ubah Role Akun</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-[10px] text-white/40">{u.handle || '@climber'}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-white/70">
                            {u.email}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'super_admin'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : u.role === 'gym_admin'
                                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                  : u.role === 'route_setter'
                                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                  : u.role === 'trip_guide'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-lime/15 text-lime border border-lime/30'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-white">
                            {u.ascentsCount}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-white/50">
                            {new Date(u.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <select
                              value={u.role}
                              disabled={isPending || u.id === user?.id}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              className="px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white outline-none focus:border-lime/50 disabled:opacity-50 cursor-pointer"
                            >
                              <option value="climber">Climber</option>
                              <option value="route_setter">Route Setter</option>
                              <option value="trip_guide">Trip Guide</option>
                              <option value="gym_admin">Gym Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: CRAGS & ROUTES MODERATION */}
        {/* ==================================================================== */}
        {activeTab === 'crags' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-bold text-base text-white">Direktori Tebing & Jalur Alam</h2>
                <p className="text-xs text-white/50">
                  Tambah tebing baru, sektor, dan moderasi jalur panjat resmi
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCragModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold text-xs hover:bg-orange-500/25 transition-all flex items-center gap-1.5 shadow-lg"
                >
                  <Plus size={15} />
                  <span>+ Tambah Tebing Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-lime text-granite font-bold text-xs shadow-lime-glow hover:bg-lime-dim transition-all flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>+ Tambah Jalur Baru</span>
                </button>
              </div>
            </div>

            {/* Crags Grid */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-white/80 uppercase tracking-wider">
                Daftar Tebing (Crags) Terdaftar ({crags.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {crags.map((crag) => (
                  <div
                    key={crag.id}
                    className="p-4 rounded-3xl bg-[#161a1f] border border-white/10 space-y-3 hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {crag.imageUrl && (
                        <div
                          className="w-full h-32 rounded-2xl bg-cover bg-center border border-white/10"
                          style={{ backgroundImage: `url(${crag.imageUrl})` }}
                        />
                      )}
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{crag.name}</h4>
                        <p className="text-xs text-orange-400 font-medium">
                          {crag.city || crag.province}, {crag.province}
                        </p>
                      </div>
                      {crag.description && (
                        <p className="text-[11px] text-white/60 font-light line-clamp-2">
                          {crag.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-white/50">
                        {crag.routesCount} Jalur · {crag.sectorsCount} Sektor
                      </span>
                      <Link
                        href={`/crags/${crag.id}`}
                        className="text-[11px] text-lime hover:underline font-bold inline-flex items-center gap-1"
                      >
                        <span>Buka Tebing</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Routes Moderation List */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="font-bold text-xs text-white/80 uppercase tracking-wider">
                  Moderasi Jalur Panjat ({routesList.length})
                </h3>

                <div className="relative w-64">
                  <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Filter jalur atau tebing..."
                    value={routeSearch}
                    onChange={(e) => setRouteSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsLoadingRoutes(true)
                        getSuperAdminRoutesAction(routeSearch)
                          .then((r) => setRoutesList(r))
                          .finally(() => setIsLoadingRoutes(false))
                      }
                    }}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-[#161a1f] border border-white/10 overflow-hidden shadow-2xl">
                {isLoadingRoutes ? (
                  <div className="py-12 text-center">
                    <Loader2 className="animate-spin text-lime mx-auto" size={20} />
                  </div>
                ) : routesList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-white/50">
                    Tidak ada jalur ditemukan.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-white/80">
                      <thead className="border-b border-white/10 bg-black/30 text-[10px] uppercase font-bold tracking-wider text-white/50">
                        <tr>
                          <th className="px-4 py-3">Nama Jalur</th>
                          <th className="px-4 py-3">Grade</th>
                          <th className="px-4 py-3">Disiplin</th>
                          <th className="px-4 py-3">Tebing & Sektor</th>
                          <th className="px-4 py-3">Setter</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {routesList.map((r) => (
                          <tr key={r.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-white">
                              {r.name}
                            </td>
                            <td className="px-4 py-2.5 font-bold text-orange-400">
                              {r.grade}
                            </td>
                            <td className="px-4 py-2.5 capitalize text-[11px] text-white/60">
                              {r.discipline}
                            </td>
                            <td className="px-4 py-2.5 text-[11px]">
                              <span className="text-white font-medium">{r.cragName}</span>
                              <span className="text-white/40 block text-[10px]">{r.sectorName}</span>
                            </td>
                            <td className="px-4 py-2.5 text-[11px] text-white/60">
                              {r.setter || 'Community'}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteRoute(r.id, r.name)}
                                className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors ml-auto"
                                title="Hapus Jalur"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: GYM PARTNERS */}
        {/* ==================================================================== */}
        {activeTab === 'gyms' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className="font-bold text-base text-white">Mitra Climbing Gym Terdaftar</h2>
              <p className="text-xs text-white/50">
                Fasilitas gym yang terhubung ke platform kasir &amp; reservasi sesi Jalur
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingGyms ? (
                <div className="col-span-full py-16 text-center">
                  <Loader2 className="animate-spin text-lime mx-auto" size={24} />
                </div>
              ) : gymsList.length === 0 ? (
                <div className="col-span-full py-16 text-center text-xs text-white/50">
                  Belum ada gym mitra terdaftar.
                </div>
              ) : (
                gymsList.map((g) => (
                  <div
                    key={g.id}
                    className="p-5 rounded-3xl bg-[#161a1f] border border-white/10 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-base">{g.name}</h4>
                          <p className="text-xs text-cyan-400 font-medium">
                            {g.city}, {g.province}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          Active Partner
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 font-light">{g.address}</p>
                      <div className="pt-2 text-xs space-y-1 text-white/70">
                        <div>
                          <span className="text-white/40">PIC / Owner: </span>
                          <span className="font-medium text-white">{g.picName || 'Owner'}</span>
                        </div>
                        <div>
                          <span className="text-white/40">Kontak: </span>
                          <span className="font-mono text-white">{g.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-white/40">
                        {g.dailyVisitors} pengunjung harian
                      </span>
                      <Link
                        href={`/gyms/${g.id}`}
                        className="text-[11px] text-cyan-400 hover:underline font-bold inline-flex items-center gap-1"
                      >
                        <span>Lihat Gym</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* MODAL: TAMBAH TEBING BARU */}
      {/* ==================================================================== */}
      {showAddCragModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#161a1f] border border-orange-500/40 rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setShowAddCragModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/20">
                <Mountain size={13} /> Tambah Tebing Baru
              </div>
              <h3 className="text-lg font-bold text-white">Input Lokasi Tebing Alam</h3>
            </div>

            <form onSubmit={handleCreateCrag} className="space-y-3.5 text-xs">
              <div>
                <label className="text-white/70 block mb-1 font-medium">Nama Tebing *</label>
                <input
                  required
                  placeholder="e.g. Tebing Parang Purwakarta"
                  value={newCrag.name}
                  onChange={(e) => setNewCrag({ ...newCrag, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Provinsi *</label>
                  <input
                    required
                    placeholder="e.g. Jawa Barat"
                    value={newCrag.province}
                    onChange={(e) => setNewCrag({ ...newCrag, province: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Kota / Kabupaten</label>
                  <input
                    placeholder="e.g. Purwakarta"
                    value={newCrag.city}
                    onChange={(e) => setNewCrag({ ...newCrag, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Latitude GPS *</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={newCrag.lat}
                    onChange={(e) => setNewCrag({ ...newCrag, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Longitude GPS *</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={newCrag.lng}
                    onChange={(e) => setNewCrag({ ...newCrag, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-medium">Foto Hero / Tebing URL</label>
                <input
                  placeholder="https://images.unsplash.com/..."
                  value={newCrag.imageUrl}
                  onChange={(e) => setNewCrag({ ...newCrag, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-medium">Deskripsi Tebing</label>
                <textarea
                  rows={2}
                  placeholder="Informasi batuan andesit/limestone, ketinggian, dan etika panjat lokal..."
                  value={newCrag.description}
                  onChange={(e) => setNewCrag({ ...newCrag, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                <span>Simpan Tebing Baru</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: TAMBAH JALUR BARU */}
      {/* ==================================================================== */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#161a1f] border border-lime/40 rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setShowAddRouteModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/10 text-lime text-xs font-bold border border-lime/20">
                <Plus size={13} /> Tambah Jalur Baru
              </div>
              <h3 className="text-lg font-bold text-white">Input Data Jalur &amp; Topo</h3>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-3.5 text-xs">
              <div>
                <label className="text-white/70 block mb-1 font-medium">Pilih Tebing *</label>
                <select
                  required
                  value={newRoute.cragId}
                  onChange={(e) => setNewRoute({ ...newRoute, cragId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-lime"
                >
                  <option value="">-- Pilih Tebing --</option>
                  {crags.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.province})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Nama Jalur *</label>
                  <input
                    required
                    placeholder="e.g. Naga Merah"
                    value={newRoute.name}
                    onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Grade Kesulitan *</label>
                  <input
                    required
                    placeholder="e.g. 5.11a atau V6"
                    value={newRoute.grade}
                    onChange={(e) => setNewRoute({ ...newRoute, grade: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Disiplin *</label>
                  <select
                    value={newRoute.discipline}
                    onChange={(e) =>
                      setNewRoute({
                        ...newRoute,
                        discipline: e.target.value as 'sport' | 'multipitch' | 'bouldering',
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-lime"
                  >
                    <option value="sport">Sport Climbing</option>
                    <option value="bouldering">Bouldering</option>
                    <option value="multipitch">Multi-Pitch</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Pembuat (Setter / FA)</label>
                  <input
                    placeholder="e.g. FPTI / Super Admin"
                    value={newRoute.setter}
                    onChange={(e) => setNewRoute({ ...newRoute, setter: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Panjang Jalur</label>
                  <input
                    placeholder="e.g. 25m"
                    value={newRoute.pitchLength}
                    onChange={(e) => setNewRoute({ ...newRoute, pitchLength: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Jumlah Baut</label>
                  <input
                    type="number"
                    value={newRoute.boltCount}
                    onChange={(e) =>
                      setNewRoute({ ...newRoute, boltCount: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1 font-medium">Anchor Type</label>
                  <input
                    placeholder="e.g. Double Ring"
                    value={newRoute.anchorType}
                    onChange={(e) => setNewRoute({ ...newRoute, anchorType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-lime"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-medium">Foto Jalur / Topo URL</label>
                <input
                  placeholder="https://images.unsplash.com/..."
                  value={newRoute.imageUrl}
                  onChange={(e) => setNewRoute({ ...newRoute, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-lime"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-medium">Deskripsi &amp; Beta Jalur</label>
                <textarea
                  rows={2}
                  placeholder="Crux berada di baut ke-3, pegangan crimp tajam menuju mantle..."
                  value={newRoute.description}
                  onChange={(e) => setNewRoute({ ...newRoute, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white outline-none focus:border-lime"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-lime text-granite font-bold rounded-xl shadow-lime-glow hover:bg-lime-dim transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                <span>Simpan Jalur Baru</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

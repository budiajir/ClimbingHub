'use client'

import React, { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, ZoomIn, ZoomOut, RotateCcw, Layers, Compass, Mountain, X, ExternalLink } from 'lucide-react'
import { CragRegion } from '@/lib/mock-data'
import Link from 'next/link'

interface InteractiveIndonesiaMapProps {
  crags?: CragRegion[]
  selectedProvince?: string
  onSelectProvince?: (province: string) => void
  onSelectCrag?: (crag: CragRegion) => void
  className?: string
  mode?: 'crags' | 'gyms' | 'problems'
}

interface CragLocation {
  id: string
  name: string
  province: string
  lat: number
  lng: number
  cragCount?: number
  problemCount?: number
  image?: string
  description?: string
  cragRef?: CragRegion
}

// Known coordinates for Indonesian climbing destinations
const DEFAULT_CRAG_LOCATIONS: CragLocation[] = [
  {
    id: 'citatah-region',
    name: 'West Java',
    province: 'West Java',
    lat: -6.8375,
    lng: 107.4589,
    cragCount: 7,
    problemCount: 147,
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    description: 'Citatah 90, 125, Pawon Cave, Stone Garden, Pabeasan, Hanyawong.',
  },
  {
    id: 'harau',
    name: 'Harau Valley',
    province: 'West Sumatra',
    lat: -0.1011,
    lng: 100.6700,
    cragCount: 1,
    problemCount: 84,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    description: 'Yosemite-style vertical granite monoliths rising up to 300m in Payakumbuh.',
  },
  {
    id: 'siung',
    name: 'Yogyakarta · Siung',
    province: 'DI Yogyakarta',
    lat: -8.1819,
    lng: 110.6811,
    cragCount: 1,
    problemCount: 48,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    description: 'Dramatic coastal limestone ocean cliffs with 50+ bolted sport routes right over the Indian Ocean waves.',
  },
  {
    id: 'maros',
    name: 'Maros Karst',
    province: 'South Sulawesi',
    lat: -4.9800,
    lng: 119.6500,
    cragCount: 1,
    problemCount: 32,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    description: 'Second largest karst tower landscape in the world with ancient limestone caves and tufa bouldering.',
  },
  {
    id: 'bali',
    name: 'Bali (Uluwatu & Songan)',
    province: 'Bali',
    lat: -8.8150,
    lng: 115.0880,
    cragCount: 2,
    problemCount: 26,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
    description: 'Sea cliff sport climbing and deep water solo exploration along the southern peninsula.',
  },
  {
    id: 'parang',
    name: 'Gunung Parang',
    province: 'West Java',
    lat: -6.6025,
    lng: 107.3486,
    cragCount: 1,
    problemCount: 18,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
    description: 'Towering andesite monolith in Purwakarta featuring massive big wall multi-pitch lines.',
  },
]

const DEFAULT_GYM_LOCATIONS: CragLocation[] = [
  {
    id: 'gym-jakarta',
    name: 'Jakarta (FX & Kemang)',
    province: 'South Jakarta',
    lat: -6.2255,
    lng: 106.8000,
    cragCount: 4,
    problemCount: 120,
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Venga_Climbing_Gym.JPG',
    description: 'IndoClimb FX Sudirman & Vertigo Boulder Gym Kemang.',
  },
  {
    id: 'gym-tangerang',
    name: 'Tangerang (Bremgra)',
    province: 'Tangerang',
    lat: -6.2900,
    lng: 106.6350,
    cragCount: 2,
    problemCount: 85,
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Venga_Climbing_Gym.JPG',
    description: 'Bremgra Indoor Climbing Wall & High Ropes Course Gading Serpong.',
  },
  {
    id: 'gym-bandung',
    name: 'Bandung Bouldering Hub',
    province: 'Bandung',
    lat: -6.9175,
    lng: 107.6191,
    cragCount: 3,
    problemCount: 95,
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    description: 'Bandung Climbing Gym community & modern training facilities.',
  },
  {
    id: 'gym-yogyakarta',
    name: 'SummitBloc Jogja',
    province: 'Yogyakarta',
    lat: -7.7956,
    lng: 110.3695,
    cragCount: 1,
    problemCount: 60,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    description: 'SummitBloc Bouldering Hub Malioboro Area, Yogyakarta.',
  },
  {
    id: 'gym-surabaya',
    name: 'Grip Factory Surabaya',
    province: 'Surabaya',
    lat: -7.2575,
    lng: 112.7521,
    cragCount: 1,
    problemCount: 75,
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Venga_Climbing_Gym.JPG',
    description: 'Largest bouldering hall in East Java with 250+ boulder problems.',
  },
  {
    id: 'gym-bali',
    name: 'Bali Climbing Canggu',
    province: 'Bali',
    lat: -8.6500,
    lng: 115.1300,
    cragCount: 2,
    problemCount: 50,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
    description: 'Open-air bouldering center and social hub in Canggu, Bali.',
  },
]

export default function InteractiveIndonesiaMap({
  crags = [],
  selectedProvince = 'all',
  onSelectProvince,
  onSelectCrag,
  className = '',
  mode = 'crags',
}: InteractiveIndonesiaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)

  const [activePopupData, setActivePopupData] = useState<CragLocation | null>(null)
  const [mapStyle, setMapStyle] = useState<'terrain' | 'street'>('terrain')
  const [currentZoom, setCurrentZoom] = useState<number>(5)

  // Map initialization
  useEffect(() => {
    let isMounted = true

    if (typeof window === 'undefined' || !mapContainerRef.current) return

    // Clean up existing instance if already present
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return

      // Default center: Indonesia Archipelago
      // Desktop: [-2.5, 118.0] zoom 5
      // Mobile: [-3.0, 117.0] zoom 4.2
      const isMobile = window.innerWidth < 768
      const initialCenter: [number, number] = isMobile ? [-2.8, 117.5] : [-2.5, 118.0]
      const initialZoom = isMobile ? 4.5 : 5

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 4,
        maxZoom: 16,
        zoomControl: false, // Custom buttons below
        attributionControl: false,
        maxBounds: [
          [-14.0, 92.0],
          [9.0, 143.0],
        ],
        maxBoundsViscosity: 0.8,
      })

      mapInstanceRef.current = map

      // Base Tile Layer:
      // Terrain: ESRI World Topo Map (crisp mountain contours, elevation shading & natural terrain without API keys or watermarks)
      // Street: OpenStreetMap (clean road & city infrastructure)
      const tileUrl =
        mapStyle === 'terrain'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
          : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

      const tiles = L.tileLayer(tileUrl, {
        maxZoom: 18,
      }).addTo(map)

      // Layer group for pins
      const markersLayer = L.layerGroup().addTo(map)
      markersLayerRef.current = markersLayer

      map.on('zoomend', () => {
        if (isMounted) setCurrentZoom(map.getZoom())
      })

      // Build location list based on mode
      const locationsToRender: CragLocation[] =
        mode === 'gyms' ? [...DEFAULT_GYM_LOCATIONS] : [...DEFAULT_CRAG_LOCATIONS]

      // Associate with mock crags if available
      crags.forEach((crag) => {
        const existing = locationsToRender.find(
          (l) => l.province.toLowerCase() === crag.province.toLowerCase() || l.id === crag.id
        )
        if (existing) {
          existing.cragRef = crag
          if (crag.image) existing.image = crag.image
          if (crag.coordinates) {
            existing.lat = crag.coordinates.lat
            existing.lng = crag.coordinates.lng
          }
        } else if (crag.coordinates) {
          locationsToRender.push({
            id: crag.id,
            name: crag.name,
            province: crag.province,
            lat: crag.coordinates.lat,
            lng: crag.coordinates.lng,
            problemCount: crag.problemCount,
            image: crag.image,
            description: crag.description,
            cragRef: crag,
          })
        }
      })

      // Add pins to map
      locationsToRender.forEach((loc) => {
        const isSelected = selectedProvince !== 'all' && loc.province.toLowerCase() === selectedProvince.toLowerCase()

        // Custom HTML pin with Safety Orange theme & pulse ring
        const pinHtml = `
          <div class="relative group cursor-pointer flex flex-col items-center">
            <div class="relative flex items-center justify-center">
              <span class="absolute -inset-2 rounded-full ${isSelected ? 'bg-[#FF6B00]/60 scale-125' : 'bg-[#FF6B00]/30'} animate-ping opacity-75"></span>
              <div class="relative w-5 h-5 rounded-full ${isSelected ? 'bg-[#FF6B00] ring-4 ring-white shadow-[0_0_15px_#FF6B00]' : 'bg-[#FF6B00] ring-2 ring-black shadow-md'} flex items-center justify-center transition-transform hover:scale-125">
                <span class="w-2 h-2 rounded-full bg-white"></span>
              </div>
            </div>
            <div class="mt-1.5 px-2.5 py-1 rounded-full bg-black/90 text-white font-bold text-[10px] tracking-wide whitespace-nowrap shadow-xl border border-white/20 flex items-center gap-1.5 hover:bg-black transition-all">
              <span class="truncate max-w-[120px]">${loc.name}</span>
              ${loc.cragCount ? `<span class="px-1.5 py-0.2 rounded-full bg-[#FF6B00] text-white text-[9px] font-extrabold">${loc.cragCount}</span>` : ''}
            </div>
          </div>
        `

        const customIcon = L.divIcon({
          html: pinHtml,
          className: 'custom-crag-pin',
          iconSize: [120, 48],
          iconAnchor: [60, 10],
        })

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(markersLayer)

        marker.on('click', () => {
          setActivePopupData(loc)
          map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 8), {
            duration: 1.0,
            easeLinearity: 0.25,
          })

          if (onSelectProvince) {
            onSelectProvince(loc.province)
          }
          if (loc.cragRef && onSelectCrag) {
            onSelectCrag(loc.cragRef)
          }
        })
      })

      // Invalidate size after layout settles to ensure crisp tiles without clipping
      setTimeout(() => {
        if (isMounted && map) {
          map.invalidateSize()
        }
      }, 200)

      const handleWindowResize = () => {
        if (map) map.invalidateSize()
      }
      window.addEventListener('resize', handleWindowResize)
    })

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [crags, mapStyle, mode])

  // Center on selected province or city if changed from outside
  useEffect(() => {
    if (!mapInstanceRef.current || selectedProvince === 'all') return

    const locationList = mode === 'gyms' ? DEFAULT_GYM_LOCATIONS : DEFAULT_CRAG_LOCATIONS
    const matched = locationList.find(
      (l) =>
        l.province.toLowerCase() === selectedProvince.toLowerCase() ||
        l.name.toLowerCase().includes(selectedProvince.toLowerCase())
    )
    if (matched) {
      mapInstanceRef.current.flyTo([matched.lat, matched.lng], 8, { duration: 1.0 })
      setActivePopupData(matched)
    }
  }, [selectedProvince, mode])

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn()
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut()
  }

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      const isMobile = window.innerWidth < 768
      const center: [number, number] = isMobile ? [-2.8, 117.5] : [-2.5, 118.0]
      const zoom = isMobile ? 4.5 : 5
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.0 })
      setActivePopupData(null)
      if (onSelectProvince) onSelectProvince('all')
    }
  }

  const headerTitle =
    mode === 'gyms'
      ? 'Indonesian Climbing Gym Network'
      : mode === 'problems'
      ? 'Indonesian Boulder & Topo Network'
      : 'Indonesia Outdoor Climbing Map'

  const filterPrefix = mode === 'gyms' ? 'Kota' : 'Wilayah'

  const hintText =
    mode === 'gyms'
      ? 'Ketuk titik pin untuk memfilter gym di kota tersebut'
      : mode === 'problems'
      ? 'Ketuk titik pin untuk memfilter jalur / topo di wilayah tersebut'
      : 'Ketuk titik pin untuk memfilter tebing di wilayah tersebut'

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#14181c] ${className}`}
    >
      {/* Map Canvas: Portrait on Mobile, Landscape on Tablet / Desktop */}
      <div
        ref={mapContainerRef}
        className="w-full h-[460px] sm:h-[480px] md:h-[380px] lg:h-[440px] z-0 focus:outline-none select-none"
        style={{ background: '#d4dadc' }}
      />

      {/* Top Floating Bar: Region Filter indicator & Layer pill */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-[10] flex items-center justify-between pointer-events-none gap-2">
        {/* Active Filter Pill */}
        <div className="pointer-events-auto flex items-center gap-2">
          {selectedProvince !== 'all' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/90 backdrop-blur-md text-white text-xs font-semibold border border-[#FF6B00]/40 shadow-lg animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
              <span>{filterPrefix}: <strong>{selectedProvince}</strong></span>
              <button
                type="button"
                onClick={handleResetView}
                className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white ml-1"
                title="Reset Filter"
              >
                <X size={10} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-medium border border-white/15 shadow-lg">
              <Compass size={13} className="text-[#FF6B00]" />
              <span>{headerTitle}</span>
            </div>
          )}
        </div>

        {/* Map Type Toggle */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 shadow-lg">
          <button
            type="button"
            onClick={() => setMapStyle('terrain')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              mapStyle === 'terrain'
                ? 'bg-[#FF6B00] text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Terrain
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('street')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              mapStyle === 'street'
                ? 'bg-[#FF6B00] text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Street
          </button>
        </div>
      </div>

      {/* Bottom Right Floating Controls (+ / - / Reset) */}
      <div className="absolute bottom-4 right-4 z-[10] flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl bg-black/85 hover:bg-black text-white border border-white/20 shadow-xl flex items-center justify-center transition-all active:scale-95 hover:border-[#FF6B00]/50"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl bg-black/85 hover:bg-black text-white border border-white/20 shadow-xl flex items-center justify-center transition-all active:scale-95 hover:border-[#FF6B00]/50"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="w-9 h-9 rounded-xl bg-black/85 hover:bg-black text-white border border-white/20 shadow-xl flex items-center justify-center transition-all active:scale-95 hover:text-[#FF6B00]"
          title="Reset View Seluruh Indonesia"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Bottom Left Floating Legend / Hint */}
      <div className="absolute bottom-4 left-4 z-[10] hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white/80 text-[11px] border border-white/10 shadow-lg pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
        <span>{hintText}</span>
      </div>

      {/* Floating Interactive Card Popup when a pin is tapped */}
      {activePopupData && (
        <div className="absolute bottom-4 left-4 right-16 sm:right-auto sm:max-w-sm z-[20] animate-slideUp">
          <div className="p-3.5 rounded-2xl bg-[#181d22]/95 backdrop-blur-md border border-[#FF6B00]/40 shadow-2xl text-white space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {activePopupData.image && (
                  <img
                    src={activePopupData.image}
                    alt={activePopupData.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/15 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white truncate leading-tight">
                    {activePopupData.name}
                  </h4>
                  <p className="text-[11px] text-[#FF6B00] font-medium truncate">
                    {activePopupData.province}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePopupData(null)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X size={13} />
              </button>
            </div>

            {activePopupData.description && (
              <p className="text-[11px] text-white/75 line-clamp-2 leading-relaxed font-light">
                {activePopupData.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
              <span className="text-[11px] text-white/60">
                {activePopupData.problemCount
                  ? `${activePopupData.problemCount} ${mode === 'gyms' ? 'Problems' : 'Jalur Terverifikasi'}`
                  : mode === 'gyms' ? 'Climbing Gym' : 'Jalur Panjat Alami'}
              </span>

              {activePopupData.cragRef ? (
                <Link
                  href={`/crags/${activePopupData.cragRef.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B00] hover:underline"
                >
                  <span>Buka Tebing</span>
                  <ExternalLink size={12} />
                </Link>
              ) : mode === 'problems' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectProvince) onSelectProvince(activePopupData.province)
                    setActivePopupData(null)
                  }}
                  className="text-[11px] font-bold text-[#FF6B00] hover:underline"
                >
                  Filter Topo Ini &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectProvince) onSelectProvince(activePopupData.province)
                    setActivePopupData(null)
                  }}
                  className="text-[11px] font-bold text-[#FF6B00] hover:underline"
                >
                  Filter {filterPrefix} Ini &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

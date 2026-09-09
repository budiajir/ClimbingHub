// Mock data for Bouldering & Climbing Hub (Jalur)
export interface Gym {
  id: string
  name: string
  city: string
  province: string
  image: string
  rating: number
  reviewCount: number
  slots: { morning: number; afternoon: number; evening: number }
  maxSlots: { morning: number; afternoon: number; evening: number }
  facilities: string[]
  pricePerSession: number
  address: string
  routeSetters: string[]
  description: string
  phone: string
  instagram: string
}

export interface CragRegion {
  id: string
  name: string
  province: string
  image: string
  sectorCount: number
  problemCount: number
  sectors: Sector[]
}

export interface Sector {
  id: string
  name: string
  image: string
  problems: Problem[]
}

export type RouteDiscipline = 'sport' | 'multipitch' | 'bouldering'

export interface PitchDetail {
  pitchNumber: number
  grade: string
  length: string
  description: string
}

export interface Problem {
  id: string
  name: string
  discipline: RouteDiscipline // 'sport' | 'multipitch' | 'bouldering'
  grade: string
  fontGrade: string
  setter: string
  fa: string
  faDate: string
  description: string
  imageUrl?: string // Custom photo uploaded for this specific route
  betaVideoUrl?: string
  accessInfo: string
  localContact: string
  ascentCount: number
  gradeVotes: { grade: string; votes: number }[]
  markers: TopoMarker[]
  // Discipline Specific attributes:
  // 1. Sport Climbing / Single Pitch
  pitchLength?: string // e.g. "24m"
  boltCount?: number // e.g. 9
  anchorType?: string // e.g. "Double Ring Chain Anchor"
  // 2. Multi Pitch
  totalPitches?: number // e.g. 4
  totalHeight?: string // e.g. "160m"
  pitchBreakdown?: PitchDetail[]
  descentInfo?: string // e.g. "4x Rappels via chained anchor stations with 2x60m ropes"
  // 3. Bouldering
  padRecommendation?: string // e.g. "2 - 3 Crashpads + 1 Spotter"
  landingQuality?: string // e.g. "Flat sandy"
  startType?: 'Sit Start (SS)' | 'Stand Start'
}

export interface TopoMarker {
  id: string
  type: 'S' | 'Z' | 'T' | 'B' | 'P' // S = Start, Z = Crux/Zone, T = Top, B = Bolt, P = Pitch
  x: number
  y: number
  label?: string
}

export interface Community {
  id: string
  name: string
  city: string
  province: string
  image: string
  memberCount: number
  homebase: string
  description: string
  whatsapp: string
  instagram: string
  members: { name: string; avatar: string; role: string }[]
  tags: string[]
}

export interface Meetup {
  id: string
  title: string
  organizer: string
  location: string
  date: string
  time: string
  maxParticipants: number
  currentParticipants: number
  image: string
  description: string
  tags: string[]
}

// ========== GYM DATA ==========
export const gyms: Gym[] = [
  {
    id: 'gym-1',
    name: 'Vertigo Boulder Gym',
    city: 'South Jakarta',
    province: 'DKI Jakarta',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
    rating: 4.8,
    reviewCount: 342,
    slots: { morning: 8, afternoon: 3, evening: 12 },
    maxSlots: { morning: 20, afternoon: 20, evening: 30 },
    facilities: ['Bouldering Wall', 'Lead Wall', 'Training Board', 'Lockers', 'Showers', 'Cafe', 'Pro Shop'],
    pricePerSession: 75000,
    address: 'Jl. Kemang Raya No.45, Kemang, South Jakarta',
    routeSetters: ['Adi Prasetyo', 'Sari Dewi', 'Budi Santoso'],
    description: 'Premier bouldering facility in Kemang featuring 300+ problems ranging from VB to V10. Renowned for creative route-setting and an engaged community.',
    phone: '+6281234567890',
    instagram: '@vertigoboulder',
  },
  {
    id: 'gym-2',
    name: 'Crux Climbing Bandung',
    city: 'Bandung',
    province: 'West Java',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    rating: 4.6,
    reviewCount: 218,
    slots: { morning: 15, afternoon: 7, evening: 5 },
    maxSlots: { morning: 25, afternoon: 25, evening: 25 },
    facilities: ['Bouldering Wall', 'Spray Wall', 'Moonboard', 'Lockers', 'Showers'],
    pricePerSession: 60000,
    address: 'Jl. Dago No.123, Coblong, Bandung',
    routeSetters: ['Rizky Fauzan', 'Maya Sari'],
    description: 'Top bouldering spot in Bandung with scenic mountain views. Equipped with a standard MoonBoard and Spray Wall for focused training.',
    phone: '+6282345678901',
    instagram: '@cruxclimbing.bdg',
  },
  {
    id: 'gym-3',
    name: 'Summit Bloc Yogyakarta',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    image: 'https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=800&q=80',
    rating: 4.7,
    reviewCount: 189,
    slots: { morning: 18, afternoon: 10, evening: 20 },
    maxSlots: { morning: 20, afternoon: 20, evening: 30 },
    facilities: ['Bouldering Wall', 'Training Board', 'Lockers', 'Cafe', 'Yoga Studio'],
    pricePerSession: 55000,
    address: 'Jl. Malioboro Area, Yogyakarta',
    routeSetters: ['Arif Hidayat', 'Putri Wulandari', 'Joko Susilo'],
    description: 'A welcoming bouldering hub in Jogja. Community-driven atmosphere with monthly boulder league events and workshops.',
    phone: '+6283456789012',
    instagram: '@summitbloc.jogja',
  },
  {
    id: 'gym-4',
    name: 'Grip Factory Surabaya',
    city: 'Surabaya',
    province: 'East Java',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
    rating: 4.5,
    reviewCount: 156,
    slots: { morning: 5, afternoon: 12, evening: 8 },
    maxSlots: { morning: 20, afternoon: 25, evening: 25 },
    facilities: ['Bouldering Wall', 'Lead Wall', 'Lockers', 'Pro Shop'],
    pricePerSession: 65000,
    address: 'Jl. Raya Darmo No.88, Surabaya',
    routeSetters: ['Denny Kurniawan'],
    description: 'Largest bouldering hall in East Java featuring 250+ boulder problems with bi-weekly route resets and dedicated comp walls.',
    phone: '+6284567890123',
    instagram: '@gripfactory.sby',
  },
]

// ========== CRAG & BOULDER ROUTE DATA ==========
export const cragRegions: CragRegion[] = [
  {
    id: 'citatah',
    name: 'Citatah Crag',
    province: 'West Java',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
    sectorCount: 8,
    problemCount: 147,
    sectors: [
      {
        id: 'citatah-sektor-a',
        name: 'Sector A — Pawon Cave',
        image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
        problems: [
          {
            id: 'citatah-a-1',
            name: 'Batu Merah Direct',
            discipline: 'bouldering',
            grade: 'V5',
            fontGrade: '6C',
            padRecommendation: '2 Crashpads + 1 Spotter',
            landingQuality: 'Flat grassy ground',
            startType: 'Sit Start (SS)',
            setter: 'Andi Wahyu',
            fa: 'Rizky Fauzan',
            faDate: '2019-03-15',
            description: 'Powerful boulder problem on the red limestone overhang of Pawon Cave. Crux moves through a positive undercling to a dynamic pop for the upper lip.',
            betaVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            accessInfo: 'From Padalarang, follow the signs to Gua Pawon (~3 km). Park at the main tourist lot. Walk 10 minutes to the sector base.',
            localContact: 'Pak Asep (Local Guide): +6281234567',
            ascentCount: 89,
            gradeVotes: [
              { grade: 'V4', votes: 12 },
              { grade: 'V5', votes: 45 },
              { grade: 'V6', votes: 18 },
            ],
            markers: [
              { id: 'm1', type: 'S', x: 25, y: 78 },
              { id: 'm2', type: 'Z', x: 45, y: 52 },
              { id: 'm3', type: 'T', x: 62, y: 20 },
            ],
          },
          {
            id: 'citatah-a-2',
            name: 'Kuda Laut (Seahorse)',
            discipline: 'bouldering',
            grade: 'V6',
            fontGrade: '7A',
            padRecommendation: '2 Crashpads + 1 Spotter',
            landingQuality: 'Flat grassy rocks',
            startType: 'Sit Start (SS)',
            setter: 'Sari Dewi',
            fa: 'Sari Dewi',
            faDate: '2020-07-22',
            description: 'Steep compression sloper roof problem. Demands strong heel hooking and sustained core tension to pull through the lip mantle.',
            accessInfo: 'Same access as Sector A, located 20m left of Batu Merah.',
            localContact: 'Pak Asep: +6281234567',
            ascentCount: 34,
            gradeVotes: [
              { grade: 'V5', votes: 8 },
              { grade: 'V6', votes: 22 },
              { grade: 'V7', votes: 15 },
            ],
            markers: [
              { id: 'm4', type: 'S', x: 30, y: 82 },
              { id: 'm5', type: 'T', x: 55, y: 25 },
            ],
          },
        ],
      },
      {
        id: 'citatah-sektor-b',
        name: 'Sector B — Cliff 125',
        image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200&q=80',
        problems: [
          {
            id: 'citatah-b-1',
            name: 'Tiger Claw',
            discipline: 'bouldering',
            grade: 'V7',
            fontGrade: '7A+',
            padRecommendation: '3 Crashpads + 2 Spotters',
            landingQuality: 'Slight slope with rock tier',
            startType: 'Sit Start (SS)',
            setter: 'Budi Santoso',
            fa: 'Adi Prasetyo',
            faDate: '2021-11-05',
            description: 'A classic testpiece in Citatah. Explosive dyno from low jugs into an incut pinch, finishing with a technical heel-toe cam.',
            accessInfo: 'From Sector A, continue 500m east along the trail. Follow red trail markers on limestone boulders.',
            localContact: 'Pak Dede: +6285678901234',
            ascentCount: 56,
            gradeVotes: [
              { grade: 'V6', votes: 15 },
              { grade: 'V7', votes: 30 },
              { grade: 'V8', votes: 11 },
            ],
            markers: [
              { id: 'm6', type: 'S', x: 20, y: 85 },
              { id: 'm7', type: 'Z', x: 38, y: 58 },
              { id: 'm8', type: 'T', x: 60, y: 22 },
            ],
          },
          {
            id: 'citatah-b-2',
            name: 'Pillar Crimp Boulder',
            discipline: 'bouldering',
            grade: 'V8',
            fontGrade: '7B',
            padRecommendation: '3 Crashpads + 2 Spotters',
            landingQuality: 'Flat sand base',
            startType: 'Sit Start (SS)',
            setter: 'West Java FPTI',
            fa: 'FPTI Team (2018)',
            faDate: '2018-06-10',
            description: 'Highly technical boulder line on a detached karst pillar. Sharp micro-crimps and precise footwork required throughout.',
            accessInfo: 'Cliff 125 Basecamp Padalarang.',
            localContact: 'Pak Dede: +6285678901234',
            ascentCount: 41,
            gradeVotes: [
              { grade: 'V7', votes: 10 },
              { grade: 'V8', votes: 24 },
            ],
            markers: [
              { id: 'm9', type: 'S', x: 50, y: 90 },
              { id: 'm10', type: 'T', x: 50, y: 15 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'harau',
    name: 'Harau Valley',
    province: 'West Sumatra',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    sectorCount: 5,
    problemCount: 89,
    sectors: [
      {
        id: 'harau-echo',
        name: 'Sector Echo Valley & Red Granite',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
        problems: [
          {
            id: 'harau-multi-1',
            name: 'Echo Valley Boulder',
            discipline: 'bouldering',
            grade: 'V7',
            fontGrade: '7A+',
            padRecommendation: '3 Crashpads + 2 Spotters',
            landingQuality: 'Flat grassy meadow',
            startType: 'Sit Start (SS)',
            setter: 'Indo-French Expedition',
            fa: 'Pierre & Mak Etek (2017)',
            faDate: '2017-08-17',
            description: 'Stunning red granite boulder sitting in the valley floor. Features powerful underclings leading to delicate compression slopers.',
            accessInfo: 'Enter Lembah Harau reserve. Walk 15 minutes from Homestay Abdi toward the base of Echo Wall.',
            localContact: 'Mak Etek (Local Guide): +6281345678901',
            ascentCount: 28,
            gradeVotes: [
              { grade: 'V6', votes: 5 },
              { grade: 'V7', votes: 19 },
              { grade: 'V8', votes: 4 },
            ],
            markers: [
              { id: 'mh-start', type: 'S', x: 45, y: 92, label: 'S' },
              { id: 'mh-p1', type: 'Z', x: 47, y: 62, label: 'Z' },
              { id: 'mh-top', type: 'T', x: 50, y: 12, label: 'T' },
            ],
          },
          {
            id: 'harau-sport-1',
            name: 'Echo Chamber Sloper',
            discipline: 'bouldering',
            grade: 'V6',
            fontGrade: '7A',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat sand base',
            startType: 'Sit Start (SS)',
            setter: 'Doni Pratama',
            fa: 'Doni Pratama (2020)',
            faDate: '2020-09-12',
            description: 'Friction-dependent problem on polished granite with micro-crystal crimps. Tests finger strength and precise body positioning.',
            accessInfo: 'Base of Echo Valley Wall.',
            localContact: 'Mak Etek: +6281345678901',
            ascentCount: 19,
            gradeVotes: [
              { grade: 'V5', votes: 6 },
              { grade: 'V6', votes: 13 },
            ],
            markers: [
              { id: 'hs1', type: 'S', x: 30, y: 85 },
              { id: 'hs2', type: 'T', x: 35, y: 22 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'siung',
    name: 'Siung Beach',
    province: 'DI Yogyakarta',
    image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80',
    sectorCount: 12,
    problemCount: 203,
    sectors: [
      {
        id: 'siung-karang',
        name: 'Sector Karang Bolong & Beach Blocks',
        image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80',
        problems: [
          {
            id: 'siung-boulder-1',
            name: 'Ocean Breaker',
            discipline: 'bouldering',
            grade: 'V5',
            fontGrade: '6C',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat sandy beach',
            startType: 'Sit Start (SS)',
            setter: 'Jogja Local',
            fa: 'Bambang S. (2019)',
            faDate: '2019-05-10',
            description: 'Iconic karst boulder sitting right at the shoreline. Excellent sandy landing with ocean views and wave crashes behind you.',
            accessInfo: 'East side of Siung Beach, 5 minutes walk from the main parking area.',
            localContact: 'Mas Danang (FPTI Siung): +6285678901234',
            ascentCount: 52,
            gradeVotes: [
              { grade: 'V4', votes: 10 },
              { grade: 'V5', votes: 35 },
              { grade: 'V6', votes: 7 },
            ],
            markers: [
              { id: 'sb1', type: 'S', x: 40, y: 80 },
              { id: 'sb2', type: 'T', x: 45, y: 25 },
            ],
          },
          {
            id: 'siung-sport-1',
            name: 'Karst Coastal Roof',
            discipline: 'bouldering',
            grade: 'V4',
            fontGrade: '6B',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat sandy beach',
            startType: 'Sit Start (SS)',
            setter: 'FPTI DIY',
            fa: 'FPTI Team (2015)',
            faDate: '2015-04-12',
            description: 'Steep coastal overhang with incut pockets and juggy top out on solid seaside limestone.',
            accessInfo: 'West cliff sector of Siung Beach.',
            localContact: 'Mas Danang: +6285678901234',
            ascentCount: 115,
            gradeVotes: [
              { grade: 'V3', votes: 20 },
              { grade: 'V4', votes: 85 },
              { grade: 'V5', votes: 10 },
            ],
            markers: [
              { id: 'ss1', type: 'S', x: 55, y: 88 },
              { id: 'ss2', type: 'T', x: 58, y: 20 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pabeasan',
    name: 'Pabeasan',
    province: 'West Java',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
    sectorCount: 3,
    problemCount: 24,
    sectors: [
      {
        id: 'pabeasan-main',
        name: 'Sector Pabeasan & Hawu Bloc',
        image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
        problems: [
          {
            id: 'pab-1',
            name: 'Hawu Roof Dyno',
            discipline: 'bouldering',
            grade: 'V6',
            fontGrade: '7A',
            padRecommendation: '2 Crashpads + 1 Spotter',
            landingQuality: 'Flat grassy dirt',
            startType: 'Sit Start (SS)',
            setter: 'Bandung Collective',
            fa: 'Rizky Fauzan (2021)',
            faDate: '2021-04-12',
            description: 'Steep karst roof problem with compression moves leading into a thrilling cut-loose finish.',
            accessInfo: 'Gunung Hawu area Padalarang, 10-minute walk from basecamp parking.',
            localContact: 'Kang Asep: +628123456789',
            ascentCount: 48,
            gradeVotes: [{ grade: 'V6', votes: 20 }, { grade: 'V7', votes: 8 }],
            markers: [
              { id: 'pb1', type: 'S', x: 25, y: 80 },
              { id: 'pb2', type: 'Z', x: 42, y: 55 },
              { id: 'pb3', type: 'T', x: 60, y: 20 },
            ],
          },
          {
            id: 'pab-2',
            name: 'Pabeasan Traverse',
            discipline: 'bouldering',
            grade: 'V4',
            fontGrade: '6B',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Clean and level',
            startType: 'Stand Start',
            setter: 'Padalarang Locals',
            fa: 'Maya Sari (2020)',
            faDate: '2020-08-19',
            description: 'Horizontal traverse following the karst limestone lip with sharp crimps and technical heel hooks.',
            accessInfo: 'East face of the Pabeasan boulder block.',
            localContact: 'Kang Asep: +628123456789',
            ascentCount: 65,
            gradeVotes: [{ grade: 'V4', votes: 28 }, { grade: 'V5', votes: 9 }],
            markers: [
              { id: 'pb4', type: 'S', x: 15, y: 70 },
              { id: 'pb5', type: 'T', x: 80, y: 35 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hanyawong',
    name: 'Hanyawong',
    province: 'West Java',
    image: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?w=1200&q=80',
    sectorCount: 2,
    problemCount: 18,
    sectors: [
      {
        id: 'hanyawong-1',
        name: 'Sector Hanyawong Bloc',
        image: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?w=1200&q=80',
        problems: [
          {
            id: 'han-1',
            name: 'Hanyawong Crimp Line',
            discipline: 'bouldering',
            grade: 'V5',
            fontGrade: '6C',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Compacted rocky dirt',
            startType: 'Sit Start (SS)',
            setter: 'West Java Boulder Crew',
            fa: 'Andi Nugraha (2022)',
            faDate: '2022-06-15',
            description: 'Technical micro-crimp face climb requiring delicate foot tension on natural freestanding boulders.',
            accessInfo: 'Village footpath, 15 minutes walk from the community shelter.',
            localContact: 'Kang Dadan: +628211234567',
            ascentCount: 31,
            gradeVotes: [{ grade: 'V5', votes: 19 }, { grade: 'V6', votes: 5 }],
            markers: [
              { id: 'hn1', type: 'S', x: 35, y: 85 },
              { id: 'hn2', type: 'T', x: 50, y: 18 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'jeger',
    name: 'Jeger',
    province: 'West Java',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    sectorCount: 2,
    problemCount: 14,
    sectors: [
      {
        id: 'jeger-boulder',
        name: 'Sector Jeger Boulders',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
        problems: [
          {
            id: 'jeg-1',
            name: 'Si Jeger Dyno',
            discipline: 'bouldering',
            grade: 'V7',
            fontGrade: '7A+',
            padRecommendation: '3 Crashpads + Spotter',
            landingQuality: 'Slight slope',
            startType: 'Sit Start (SS)',
            setter: 'Sari Dewi',
            fa: 'Adi Prasetyo (2021)',
            faDate: '2021-09-10',
            description: 'Explosive dyno to a rounded sloper on top of the Jeger boulder. Highly athletic power problem.',
            accessInfo: 'Jeger cliff area, follow plantation trail.',
            localContact: 'Pak Ujang: +628571234567',
            ascentCount: 22,
            gradeVotes: [{ grade: 'V7', votes: 15 }, { grade: 'V8', votes: 6 }],
            markers: [
              { id: 'jg1', type: 'S', x: 30, y: 88 },
              { id: 'jg2', type: 'T', x: 55, y: 22 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'punceling',
    name: 'Punceling',
    province: 'West Java',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
    sectorCount: 3,
    problemCount: 28,
    sectors: [
      {
        id: 'punceling-forest',
        name: 'Sector Punceling Pine Forest',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
        problems: [
          {
            id: 'pun-1',
            name: 'Pine Arête',
            discipline: 'bouldering',
            grade: 'V4',
            fontGrade: '6B',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Soft forest floor covered in pine needles',
            startType: 'Stand Start',
            setter: 'Bandung Rock Bloc',
            fa: 'Fikri Pratama (2020)',
            faDate: '2020-11-20',
            description: 'Beautiful compression arête nestled in the misty, cool pine woods of Ciwidey.',
            accessInfo: 'Punceling Pass tourist area, South Ciwidey, Bandung.',
            localContact: 'Punceling Management: +628132345678',
            ascentCount: 54,
            gradeVotes: [{ grade: 'V3', votes: 12 }, { grade: 'V4', votes: 32 }],
            markers: [
              { id: 'pc1', type: 'S', x: 28, y: 82 },
              { id: 'pc2', type: 'T', x: 48, y: 15 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    province: 'West Java',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    sectorCount: 2,
    problemCount: 16,
    sectors: [
      {
        id: 'mastodon-bloc',
        name: 'Sector Mastodon Boulders',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
        problems: [
          {
            id: 'mas-1',
            name: 'Mastodon Tusk',
            discipline: 'bouldering',
            grade: 'V8',
            fontGrade: '7B',
            padRecommendation: '3 Crashpads + 2 Spotters',
            landingQuality: 'Uneven rocks, arrange pads carefully',
            startType: 'Sit Start (SS)',
            setter: 'Adi Prasetyo',
            fa: 'Adi Prasetyo (2022)',
            faDate: '2022-03-05',
            description: 'Heavy power problem utilizing twin protruding pinches resembling mammoth tusks. Demands full body compression.',
            accessInfo: 'Mastodon boulder field, contact local climbing guide.',
            localContact: 'Kang Wawan: +628781234567',
            ascentCount: 14,
            gradeVotes: [{ grade: 'V8', votes: 11 }, { grade: 'V9', votes: 3 }],
            markers: [
              { id: 'ms1', type: 'S', x: 40, y: 88 },
              { id: 'ms2', type: 'Z', x: 50, y: 50 },
              { id: 'ms3', type: 'T', x: 55, y: 20 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'stone-garden',
    name: 'Stone Garden',
    province: 'West Java',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
    sectorCount: 4,
    problemCount: 35,
    sectors: [
      {
        id: 'sg-karst',
        name: 'Sector Stone Garden Ancient Karst',
        image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
        problems: [
          {
            id: 'sg-1',
            name: 'Ancient Karst Flake',
            discipline: 'bouldering',
            grade: 'V3',
            fontGrade: '6A',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat rocky sand',
            startType: 'Stand Start',
            setter: 'Padalarang Community',
            fa: 'Rian Hidayat (2019)',
            faDate: '2019-07-14',
            description: 'Friendly prehistoric limestone flake problem, ideal for beginner to intermediate outdoor boulderers.',
            accessInfo: 'Stone Garden Geopark Padalarang.',
            localContact: 'Geopark Officer: +628129876543',
            ascentCount: 88,
            gradeVotes: [{ grade: 'V3', votes: 55 }, { grade: 'V4', votes: 12 }],
            markers: [
              { id: 'sgm1', type: 'S', x: 30, y: 80 },
              { id: 'sgm2', type: 'T', x: 45, y: 25 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bukit-tegal-malaka',
    name: 'Bukit Tegal Malaka',
    province: 'West Java',
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200&q=80',
    sectorCount: 2,
    problemCount: 15,
    sectors: [
      {
        id: 'btm-puncak',
        name: 'Sector Tegal Malaka Summit Blocks',
        image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200&q=80',
        problems: [
          {
            id: 'btm-1',
            name: 'Malaka Highball',
            discipline: 'bouldering',
            grade: 'V5',
            fontGrade: '6C',
            padRecommendation: '3 Crashpads + 2 Spotters',
            landingQuality: 'Firm grassy ground',
            startType: 'Stand Start',
            setter: 'Sumedang FPTI',
            fa: 'Dedi Kurnia (2021)',
            faDate: '2021-10-02',
            description: '5-meter tall highball with positive crimps and an airy, committing mantle top out.',
            accessInfo: 'Bukit Tegal Malaka Sumedang, 20-minute uphill trek from village road.',
            localContact: 'Kang Dedi: +628221234567',
            ascentCount: 26,
            gradeVotes: [{ grade: 'V5', votes: 18 }, { grade: 'V6', votes: 4 }],
            markers: [
              { id: 'bt1', type: 'S', x: 38, y: 85 },
              { id: 'bt2', type: 'Z', x: 45, y: 48 },
              { id: 'bt3', type: 'T', x: 50, y: 15 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'maros',
    name: 'Maros',
    province: 'South Sulawesi',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    sectorCount: 4,
    problemCount: 42,
    sectors: [
      {
        id: 'maros-rammang',
        name: 'Sector Rammang-Rammang Karst Towers',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
        problems: [
          {
            id: 'mrs-1',
            name: 'Celebes Roof',
            discipline: 'bouldering',
            grade: 'V7',
            fontGrade: '7A+',
            padRecommendation: '3 Crashpads + Spotter',
            landingQuality: 'Flat dirt alongside karst river',
            startType: 'Sit Start (SS)',
            setter: 'South Sulawesi FPTI & Expedition',
            fa: 'Makmur & Team (2020)',
            faDate: '2020-02-18',
            description: 'Spectacular roof boulder at the base of the world-famous Maros karst towers. Features tufa pinches and aggressive heel hooks.',
            accessInfo: 'Rammang-Rammang Pier Maros, take a 15-minute Jolloro boat ride to Berua village dock.',
            localContact: 'Daeng Rasyid (Boat Guide): +628521234567',
            ascentCount: 39,
            gradeVotes: [{ grade: 'V6', votes: 8 }, { grade: 'V7', votes: 24 }, { grade: 'V8', votes: 5 }],
            markers: [
              { id: 'mr1', type: 'S', x: 22, y: 82 },
              { id: 'mr2', type: 'Z', x: 40, y: 55 },
              { id: 'mr3', type: 'T', x: 58, y: 22 },
            ],
          },
        ],
      },
    ],
  },
]

// ========== COMMUNITY DATA ==========
export const communities: Community[] = [
  {
    id: 'comm-1',
    name: 'Jakarta Boulders Collective',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    memberCount: 124,
    homebase: 'Vertigo Boulder Gym',
    description: 'Active Jakarta bouldering collective. Weekly gym sessions every Saturday + monthly outdoor crag trips to Citatah.',
    whatsapp: 'https://wa.me/+6281234567890',
    instagram: 'https://instagram.com/jakartabouldersco',
    tags: ['Bouldering', 'Outdoor', 'Weekly Session'],
    members: [
      { name: 'Ahmad Rizki', avatar: 'https://i.pravatar.cc/60?img=1', role: 'Founder' },
      { name: 'Dewi Pratiwi', avatar: 'https://i.pravatar.cc/60?img=5', role: 'Setter' },
      { name: 'Budi Santoso', avatar: 'https://i.pravatar.cc/60?img=3', role: 'Member' },
    ],
  },
  {
    id: 'comm-2',
    name: 'Bandung Rock Bloc',
    city: 'Bandung',
    province: 'West Java',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    memberCount: 87,
    homebase: 'Crux Climbing Bandung',
    description: 'Bandung bouldering squad. Focused on climbing movement and technique. Frequent trips to Citatah and Harau.',
    whatsapp: 'https://wa.me/+6282345678901',
    instagram: 'https://instagram.com/bandungrockbloc',
    tags: ['Technique', 'Movement', 'Trip'],
    members: [
      { name: 'Rizky Fauzan', avatar: 'https://i.pravatar.cc/60?img=7', role: 'Captain' },
      { name: 'Maya Sari', avatar: 'https://i.pravatar.cc/60?img=9', role: 'Setter' },
    ],
  },
  {
    id: 'comm-3',
    name: 'Jogja Crag Collective',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
    memberCount: 63,
    homebase: 'Summit Bloc Yogyakarta',
    description: 'Yogyakarta climbing community. Focuses on outdoor bouldering and coastal climbing at Siung Beach.',
    whatsapp: 'https://wa.me/+6283456789012',
    instagram: 'https://instagram.com/jogjacragco',
    tags: ['Outdoor', 'Bouldering', 'Siung'],
    members: [
      { name: 'Arif Hidayat', avatar: 'https://i.pravatar.cc/60?img=11', role: 'Organizer' },
      { name: 'Putri W.', avatar: 'https://i.pravatar.cc/60?img=13', role: 'Member' },
    ],
  },
]

// ========== MEETUP DATA ==========
export const meetups: Meetup[] = [
  {
    id: 'meetup-1',
    title: 'Saturday Boulder Session — Vertigo',
    organizer: 'Jakarta Boulders Collective',
    location: 'Vertigo Boulder Gym, Jakarta',
    date: '2026-09-06',
    time: '09:00 - 12:00',
    maxParticipants: 20,
    currentParticipants: 14,
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
    description: 'Community bouldering meetup every Saturday morning. All levels welcome. Bring your shoes, chalk bag, and psych!',
    tags: ['Bouldering', 'All Levels', 'Jakarta'],
  },
  {
    id: 'meetup-2',
    title: 'Outdoor Trip — Citatah Boulders',
    organizer: 'Bandung Rock Bloc',
    location: 'Citatah, West Bandung',
    date: '2026-09-13',
    time: '06:00 - 17:00',
    maxParticipants: 15,
    currentParticipants: 9,
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    description: 'Day trip to Citatah outdoor boulders focusing on Sector A & B. Carpool available from Bandung. Bring your crash pads!',
    tags: ['Outdoor', 'Day Trip', 'Citatah'],
  },
  {
    id: 'meetup-3',
    title: 'Beginner Clinic — Footwork & Balance',
    organizer: 'Summit Bloc Yogyakarta',
    location: 'Summit Bloc Yogyakarta',
    date: '2026-09-07',
    time: '15:00 - 17:30',
    maxParticipants: 12,
    currentParticipants: 7,
    image: 'https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=800&q=80',
    description: 'Dedicated beginner workshop. Master foot placement, body tension, and efficient movement guided by experienced setters.',
    tags: ['Beginner', 'Clinic', 'Yogyakarta'],
  },
]

// ========== UPCOMING SESSIONS (Hero Panels) ==========
export const upcomingSessions = [
  {
    id: 'session-1',
    title: 'Outdoor Citatah Trip',
    organizer: 'Bandung Rock Bloc',
    date: 'Sat, Sep 6',
    participants: 9,
    maxParticipants: 15,
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1600&q=85',
    type: 'outdoor',
  },
  {
    id: 'session-2',
    title: 'Weekly Boulder Session',
    organizer: 'Jakarta Boulders Co.',
    date: 'Sun, Sep 7',
    participants: 14,
    maxParticipants: 20,
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&q=85',
    type: 'indoor',
  },
  {
    id: 'session-3',
    title: 'Harau Valley Expedition',
    organizer: 'Indonesia Climbing Federation',
    date: 'Sep 13-15',
    participants: 22,
    maxParticipants: 30,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
    type: 'expedition',
  },
]

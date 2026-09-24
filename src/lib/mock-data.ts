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
  description?: string
  // 1. Peta lokasi + link gmaps
  coordinates?: { lat: number; lng: number }
  gmapsUrl?: string
  mapEmbedUrl?: string
  // 2. How to Get There
  howToGetThere?: {
    driveInfo: string
    hikeDuration: string
    parkingInfo: string
    publicTransit?: string
  }
  // 3. Who to Contact
  whoToContact?: {
    name: string
    role: string
    phone: string
    basecampName: string
    basecampAddress?: string
  }
  // 4. Jenis Batuan
  rockType?: {
    type: string
    texture: string
    features: string
    ethics?: string
  }
  // 5. Perkiraan Cuaca
  weatherForecast?: {
    condition: string
    tempAvg: string
    bestSeason: string
    humidity?: string
    rainNotes?: string
  }
}

export interface Sector {
  id: string
  name: string
  image: string
  description?: string
  problems: Problem[]
}

export type RouteCategory = 'lead' | 'trad' | 'boulder'
export type RouteDiscipline = 'sport' | 'multipitch' | 'bouldering' | 'lead' | 'trad' | 'boulder'

export interface PitchDetail {
  pitchNumber: number
  grade: string
  length: string
  description: string
}

export interface Problem {
  id: string
  name: string
  category?: RouteCategory // 'lead' | 'trad' | 'boulder'
  sectorName?: string
  sectorId?: string
  discipline: RouteDiscipline
  grade: string
  fontGrade: string
  setter: string
  setterYear?: string // e.g. "Andi Wahyu (2019)"
  fa: string
  faDate: string
  description: string
  imageUrl?: string
  height?: string // e.g. "4.5m" or "24m"
  holdsCount?: number // e.g. 14 pegangan
  holdDetails?: string // e.g. "2 start crimps, 1 undercling, 1 pinch, 2 jugs to top"
  anchorCount?: number // e.g. 9 bolts + 1 double ring anchor
  anchorType?: string // e.g. "Double Ring Chain Anchor with steel carabiners"
  betaText?: string
  betaVideoUrl?: string
  accessInfo: string
  localContact: string
  ascentCount: number
  gradeVotes: { grade: string; votes: number }[]
  markers: TopoMarker[]
  // Discipline Specific attributes:
  pitchLength?: string
  boltCount?: number
  totalPitches?: number
  totalHeight?: string
  pitchBreakdown?: PitchDetail[]
  descentInfo?: string
  padRecommendation?: string
  landingQuality?: string
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
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Indoors_bouldering_in_Pasila%2C_Helsinki.jpg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Fitz_Roy_Climbing_Wall.jpg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Venga_Climbing_Gym.JPG',
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
    description: "Legendary karst region in Padalarang featuring ancient limestone formations dating back millions of years. Indonesia's premier hub for bouldering exploration and sport climbing in West Java.",
    coordinates: { lat: -6.8375, lng: 107.4589 },
    gmapsUrl: "https://maps.google.com/?q=-6.8375,107.4589",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.439872583861!2d107.4563251!3d-6.8375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e4cbb5b0c7db%3A0x6b1f2382f7c2225!2sTebing%20Citatah%2090!5e0!3m2!1sid!2sid!4v1700000000000",
    howToGetThere: {
      driveInfo: "From Bandung or Jakarta via Tol Purbaleunyi, take the Padalarang Toll exit. Follow Jalan Raya Cipatat towards the Gua Pawon / Citatah area (~15 mins from toll exit). Paved road accessible by two-wheel and four-wheel vehicles.",
      hikeDuration: "5 - 10 min easy approach walk from the basecamp parking area to the cliff base.",
      parkingInfo: "Spacious car and motorcycle parking at Basecamp Pawon / Saung Panjat Citatah 90 (IDR 5,000 for motorcycles, IDR 15,000 for cars).",
      publicTransit: "Whoosh High-Speed Train to Padalarang station or Commuter Line Bandung Raya, followed by local public transit or ride-hailing to Gua Pawon."
    },
    whoToContact: {
      name: "Kang Asep Kurnia",
      role: "Head of Crag Management & FPTI Senior Guide",
      phone: "+6281234567890",
      basecampName: "Basecamp Saung Panjat Citatah 90",
      basecampAddress: "Kampung Cibukur RT 02/RW 11, Gunung Masigit, Cipatat, West Bandung Regency"
    },
    rockType: {
      type: "Dense Karst Limestone",
      texture: "Sharp, compact limestone with deep pockets, massive natural tufas, steep overhang crimps, and solid roof features.",
      features: "Dominated by steep bouldering caves in Gua Pawon and vertical pocket faces at Cliff 90 & 125.",
      ethics: "Use magnesium chalk sparingly and brush off tick marks with a soft brush (nylon/boar hair). Rock chipping is strictly forbidden."
    },
    weatherForecast: {
      condition: "Partly Sunny",
      tempAvg: "26°C - 31°C",
      bestSeason: "May through October (Dry Season). Sheltered sectors inside Pawon Cave remain climbable during rain.",
      humidity: "68%",
      rainNotes: "Outer cliff faces become slippery during heavy downpours; climbing under sheltered overhangs is recommended when overcast."
    },
    sectors: [
      {
        id: 'citatah-sektor-a',
        name: 'Sector A — Pawon Cave',
        image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
        problems: [
          {
            id: 'citatah-a-1',
            name: 'Batu Merah Direct',
            category: 'boulder',
            discipline: 'bouldering',
            grade: 'V5',
            fontGrade: '6C',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Christian_Core_on_Gioia.jpg',
            setter: 'Andi Wahyu',
            setterYear: 'Andi Wahyu (2019)',
            fa: 'Rizky Fauzan',
            faDate: '2019-03-15',
            height: '4.2m',
            holdsCount: 12,
            holdDetails: '2 sharp starting crimps, 1 right undercling, 1 solid mid-zone pinch, dynamic pop to upper lip sloper, 2 deep finishing jugs.',
            anchorCount: 0,
            anchorType: 'Top-out Ledge Mantle',
            padRecommendation: '2 Crashpads + 1 Spotter',
            landingQuality: 'Flat grassy ground',
            startType: 'Sit Start (SS)',
            description: 'Powerful boulder problem on the red limestone overhang of Pawon Cave. Crux moves through a positive undercling to a dynamic pop for the upper lip.',
            betaText: 'Begin from a dual-crimp sit start. Lock a high right heel hook on the lower protrusion, pull into the deep left-hand undercling, dyno to the lip sloper, then mantle the right foot over to top out.',
            betaVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            accessInfo: 'From Padalarang, follow the signs to Gua Pawon (~3 km). Park at the main tourist lot. Walk 10 minutes to the sector base.',
            localContact: 'Kang Asep (Local Guide): +6281234567890',
            ascentCount: 89,
            gradeVotes: [
              { grade: 'V4', votes: 12 },
              { grade: 'V5', votes: 45 },
              { grade: 'V6', votes: 18 },
            ],
            markers: [
              { id: 'm1', type: 'S', x: 25, y: 78, label: 'Start (Crimp)' },
              { id: 'm2', type: 'Z', x: 45, y: 52, label: 'Crux Undercling' },
              { id: 'm3', type: 'T', x: 62, y: 20, label: 'Top-out Jug' },
            ],
          },
          {
            id: 'citatah-lead-1',
            name: 'Pawon Super Crack & Face',
            category: 'lead',
            discipline: 'sport',
            grade: '5.11b',
            fontGrade: '6c+',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Chris_Sharma_-_1.jpg',
            setter: 'Iqbal & Tim FPTI',
            setterYear: 'Iqbal & Tim FPTI (2018)',
            fa: 'Iqbal',
            faDate: '2018-05-12',
            height: '24m',
            holdsCount: 36,
            holdDetails: '10 finger crack jams in the lower section, rest ledge at bolt 5, crux micro-crimps and tufa pinch at bolt 7, 2 finishing bucket jugs.',
            anchorCount: 10,
            boltCount: 9,
            anchorType: 'Double Ring Stainless Chain Anchor with steel carabiner',
            description: 'Premier sport climbing route at Citatah. Demands forearm endurance and precise footwork on vertical limestone.',
            betaText: 'Bring 10 quickdraws and a 60m dynamic rope. The crux sits between bolts 6 and 7; use the left tufa pinch and high-step the right foot onto a small divot to latch the upper crimp.',
            betaVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            accessInfo: 'Located in the central Pawon cliff sector, 15 meters from the cave entrance.',
            localContact: 'Kang Asep: +6281234567890',
            ascentCount: 112,
            gradeVotes: [
              { grade: '5.11a', votes: 14 },
              { grade: '5.11b', votes: 52 },
              { grade: '5.11c', votes: 20 },
            ],
            markers: [
              { id: 'lead-s', type: 'S', x: 28, y: 92, label: 'Start' },
              { id: 'lead-b1', type: 'B', x: 30, y: 75, label: 'Bolt 1-3' },
              { id: 'lead-crux', type: 'Z', x: 34, y: 48, label: 'Crux Bolt 7' },
              { id: 'lead-anc', type: 'T', x: 36, y: 15, label: 'Anchor' },
            ],
          },
          {
            id: 'citatah-a-2',
            name: 'Kuda Laut (Seahorse)',
            category: 'boulder',
            discipline: 'bouldering',
            grade: 'V6',
            fontGrade: '7A',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/50/GIOVANNI_BOULDERING.jpg',
            setter: 'Sari Dewi',
            setterYear: 'Sari Dewi (2020)',
            fa: 'Sari Dewi',
            faDate: '2020-07-22',
            height: '3.8m',
            holdsCount: 10,
            holdDetails: 'Dual compression slopers, 2 heel hook features, 1 undercling, 1 mantle lip.',
            anchorCount: 0,
            anchorType: 'Top-out Boulder Mantle',
            padRecommendation: '2 Crashpads + 1 Spotter',
            landingQuality: 'Flat grassy rocks',
            startType: 'Sit Start (SS)',
            description: 'Steep compression sloper roof problem. Demands strong heel hooking and sustained core tension to pull through the lip mantle.',
            betaText: 'Pure compression sloper problem on a 45-degree roof. Use a left toe hook to prevent body swing during the transition to the lip mantle.',
            accessInfo: 'Same access as Sector A, located 20m left of Batu Merah.',
            localContact: 'Kang Asep: +6281234567890',
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
        image: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Action_Directe_%28Waldkopf%29.JPG',
        problems: [
          {
            id: 'citatah-b-1',
            name: 'Tiger Claw',
            discipline: 'bouldering',
            grade: 'V7',
            fontGrade: '7A+',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Joshue_Tree_National_Park_-_Manx_Boulder_-_6.jpg',
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
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Action_Directe_%28Waldkopf%29.JPG',
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
    name: 'Lembah Harau',
    province: 'West Sumatra',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Fabio_Palma%2C_Cardiopalma%2C_7c%2C_Kalymnos.jpg',
    sectorCount: 5,
    problemCount: 91,
    description: "A breathtaking valley of monolithic granite and andesite big walls rising 100-300 meters above emerald Minangkabau rice paddies. Indonesia's premier world-class climbing sanctuary.",
    coordinates: { lat: -0.1011, lng: 100.6722 },
    gmapsUrl: "https://maps.google.com/?q=-0.1011,100.6722",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.817345383561!2d100.6700!3d-0.1011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd5373a6a9b441f%3A0x8e82d8c303ea!2sLembah%20Harau!5e0!3m2!1sid!2sid!4v1700000000000",
    howToGetThere: {
      driveInfo: "From Minangkabau International Airport (BIM) Padang, drive approximately 2.5 - 3 hours to Payakumbuh, then 15 minutes onward to Lembah Harau via paved highway.",
      hikeDuration: "2 - 15 min approach along scenic rice paddy paths from nearby homestays or parking lots to the cliff base.",
      parkingInfo: "Parking available at homestays, Lembah Harau tourist gates, and Echo Valley climber basecamps.",
      publicTransit: "Intercity travel from Padang to Payakumbuh, then local transit or motorcycle taxi to the Harau nature reserve gate."
    },
    whoToContact: {
      name: "Mak Etek & Sutan Harau",
      role: "Senior Harau Valley Guide & Harau Climbers Community Leader",
      phone: "+6281345678901",
      basecampName: "Echo Valley Homestay & Climber Camp",
      basecampAddress: "Nagari Tarantang, Harau District, Lima Puluh Kota Regency, West Sumatra"
    },
    rockType: {
      type: "Granite Breccia & Vertical Andesite",
      texture: "Massive andesite and granite with high friction, micro-crystal crimps, natural splitter cracks, and sheer 90-degree vertical walls.",
      features: "Towering cliffs ideal for multi-pitch, trad crack lines, and giant boulder fields scattered across the valley floor.",
      ethics: "Respect local Minangkabau customs and landowners. Keep the valley clean and pack out all tape and food wrappers."
    },
    weatherForecast: {
      condition: "Tropical Mild",
      tempAvg: "23°C - 28°C",
      bestSeason: "June through September. Early morning and late afternoon temperatures are ideal for climbing.",
      humidity: "72%",
      rainNotes: "Tropical mountain showers often develop in the late afternoon; starting morning sessions around 07:00 AM is recommended."
    },
    sectors: [
      {
        id: 'harau-echo',
        name: 'Sector Echo Valley & Red Granite',
        image: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Climbing_in_Yosemite_Valley_-_01.jpg',
        problems: [
          {
            id: 'harau-gorejat',
            name: 'Gorejat',
            category: 'boulder',
            discipline: 'bouldering',
            grade: 'V8',
            fontGrade: '7B',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Midnight_Lightning_yosemite.jpg',
            setter: 'Curated',
            setterYear: 'Curated (2021)',
            fa: 'Curated',
            faDate: '2021-06-15',
            height: '4.2m',
            holdsCount: 11,
            holdDetails: 'Sharp undercling, dynamic dyno to right-side crimp, solid topout finish.',
            anchorCount: 0,
            anchorType: 'Top-out',
            padRecommendation: '3 Crashpads + 1 Spotter',
            landingQuality: 'Flat meadow',
            startType: 'Sit Start (SS)',
            description: 'Legendary V8 boulder problem on the granite block of Lembah Harau featuring aggressive compression transitions and a technical topout.',
            betaText: 'Start on a solid left-hand undercling, set a high right heel hook on the granite lip, and launch dynamically to the upper crimp.',
            accessInfo: 'Located near Echo Valley cliff, 5 minutes from the main Lembah Harau road.',
            localContact: 'Mak Etek (Local Guide): +6281345678901',
            ascentCount: 19,
            gradeVotes: [
              { grade: 'V7', votes: 2 },
              { grade: 'V8', votes: 15 },
              { grade: 'V9', votes: 2 },
            ],
            markers: [
              { id: 'gj-s', type: 'S', x: 40, y: 88, label: 'Start Sit' },
              { id: 'gj-c', type: 'Z', x: 46, y: 52, label: 'Crux Dyno' },
              { id: 'gj-t', type: 'T', x: 50, y: 15, label: 'Topout' },
            ],
          },
          {
            id: 'harau-sima-maung',
            name: 'Sima Maung',
            category: 'boulder',
            discipline: 'bouldering',
            grade: 'V7',
            fontGrade: '7A+',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Christian_Core_on_Gioia.jpg',
            setter: 'Curated',
            setterYear: 'Curated (2019)',
            fa: 'Curated',
            faDate: '2019-08-10',
            height: '3.9m',
            holdsCount: 12,
            holdDetails: 'Sharp granite sloper, high heel hook, compression arête.',
            anchorCount: 0,
            anchorType: 'Top-out',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat meadow ground',
            startType: 'Sit Start (SS)',
            description: 'Distinctive compression problem along a sharp arête demanding finger strength and high flexibility.',
            betaText: 'Pinch the arête firmly, bring the right foot high onto the crystal ledge to balance your center of mass.',
            accessInfo: 'Central Harau boulder block, adjacent to Gorejat.',
            localContact: 'Mak Etek: +6281345678901',
            ascentCount: 24,
            gradeVotes: [
              { grade: 'V6', votes: 3 },
              { grade: 'V7', votes: 18 },
              { grade: 'V8', votes: 3 },
            ],
            markers: [
              { id: 'sm-s', type: 'S', x: 42, y: 90, label: 'Start Arête' },
              { id: 'sm-c', type: 'Z', x: 48, y: 55, label: 'High Heel Crux' },
              { id: 'sm-t', type: 'T', x: 49, y: 14, label: 'Top Mantle' },
            ],
          },
          {
            id: 'harau-multi-1',
            name: 'Echo Valley Boulder',
            category: 'boulder',
            discipline: 'bouldering',
            grade: 'V7',
            fontGrade: '7A+',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/50/GIOVANNI_BOULDERING.jpg',
            setter: 'Pierre & Mak Etek',
            setterYear: 'Pierre & Mak Etek (2017)',
            fa: 'Pierre & Mak Etek (2017)',
            faDate: '2017-08-17',
            height: '4.8m',
            holdsCount: 14,
            holdDetails: 'Dual red granite underclings, compression slopers along crystal lips, solid top mantle finish.',
            anchorCount: 0,
            anchorType: 'Top-out Highball Ledge',
            padRecommendation: '3 Crashpads + 2 Spotters',
            landingQuality: 'Flat grassy meadow',
            startType: 'Sit Start (SS)',
            description: 'Stunning red granite boulder sitting on the valley floor. Features powerful underclings leading to delicate compression slopers.',
            betaText: 'Striking red granite block on the valley floor. Trust shoe friction on the lower smear, squeeze the crystal slopers, and commit upward through the mantle.',
            accessInfo: 'Enter Lembah Harau reserve. Walk 15 minutes from Homestay Abdi toward the base of Echo Wall.',
            localContact: 'Mak Etek (Local Guide): +6281345678901',
            ascentCount: 28,
            gradeVotes: [
              { grade: 'V6', votes: 5 },
              { grade: 'V7', votes: 19 },
              { grade: 'V8', votes: 4 },
            ],
            markers: [
              { id: 'mh-start', type: 'S', x: 45, y: 92, label: 'Start (Undercling)' },
              { id: 'mh-p1', type: 'Z', x: 47, y: 62, label: 'Crux Compression' },
              { id: 'mh-top', type: 'T', x: 50, y: 12, label: 'Top Mantle' },
            ],
          },
          {
            id: 'harau-trad-1',
            name: 'Sarasah Splitter Crack',
            category: 'trad',
            discipline: 'multipitch',
            grade: '5.10c',
            fontGrade: '6b',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Coyne_Crack_5.11%2B_-_Supercrack_Buttress_-_Indian_Creek.jpg',
            setter: 'Ekspedisi Harau',
            setterYear: 'Ekspedisi Harau (2015)',
            fa: 'Bambang & Tim',
            faDate: '2015-06-20',
            height: '45m',
            holdsCount: 52,
            holdDetails: 'Consistent hand jams sizing #2 and #3 Camalots, finger locks at the pitch 1 crux, rest platform at the mid terrace.',
            anchorCount: 2,
            anchorType: 'Trad Gear Anchor & Tree / Bolted Rappel Station',
            description: 'Pure splitter trad crack line on the vertical andesite walls of Sarasah Harau. Requires solid active cam placements.',
            betaText: 'Rack a full set of cams (#0.4 to #4) with double #2s. Clean hand jams; tape gloves strongly recommended.',
            accessInfo: 'Located on the left flank of Sarasah Bunta waterfall, 10 min walk.',
            localContact: 'Mak Etek: +6281345678901',
            ascentCount: 16,
            gradeVotes: [
              { grade: '5.10b', votes: 3 },
              { grade: '5.10c', votes: 11 },
              { grade: '5.10d', votes: 2 },
            ],
            markers: [
              { id: 'ht-s', type: 'S', x: 42, y: 94, label: 'Crack Base' },
              { id: 'ht-p1', type: 'Z', x: 44, y: 55, label: 'Crux Finger Lock' },
              { id: 'ht-top', type: 'T', x: 46, y: 10, label: 'Pitch 1 Anchor' },
            ],
          },
          {
            id: 'harau-sport-1',
            name: 'Echo Chamber Sloper',
            category: 'boulder',
            discipline: 'bouldering',
            grade: 'V6',
            fontGrade: '7A',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Joshue_Tree_National_Park_-_Manx_Boulder_-_6.jpg',
            setter: 'Doni Pratama',
            setterYear: 'Doni Pratama (2020)',
            fa: 'Doni Pratama (2020)',
            faDate: '2020-09-12',
            height: '3.6m',
            holdsCount: 8,
            holdDetails: 'Micro-crystal crimps and rounded granite slopers.',
            anchorCount: 0,
            anchorType: 'Top-out',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat sand base',
            startType: 'Sit Start (SS)',
            description: 'Friction-dependent problem on polished granite with micro-crystal crimps. Tests finger strength and precise body positioning.',
            betaText: 'Heavily friction-dependent. Clean shoe soles and brush off granite dust before attempting the sit start.',
            accessInfo: 'Base of Echo Valley Wall.',
            localContact: 'Mak Etek: +6281345678901',
            ascentCount: 19,
            gradeVotes: [
              { grade: 'V5', votes: 6 },
              { grade: 'V6', votes: 13 },
            ],
            markers: [
              { id: 'hs1', type: 'S', x: 30, y: 85, label: 'Start' },
              { id: 'hs2', type: 'T', x: 35, y: 22, label: 'Top' },
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Chris_Sharma_-_1.jpg',
    sectorCount: 12,
    problemCount: 203,
    description: "Exotic sea cliff climbing haven on the Indian Ocean coast of Gunungkidul with 200+ climbing routes. Experience the thrill of ocean spray and spectacular sunset vistas right off the beach.",
    coordinates: { lat: -8.1819, lng: 110.6833 },
    gmapsUrl: "https://maps.google.com/?q=-8.1819,110.6833",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.482718294621!2d110.6811!3d-8.1819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7bc449ad681997%3A0x6b7722bb0b7123!2sPantai%20Siung!5e0!3m2!1sid!2sid!4v1700000000000",
    howToGetThere: {
      driveInfo: "From Yogyakarta city center heading towards Wonosari, continue to Tepus via Jl. Baron and Jl. Pantai Siung (~2 hours drive). Smooth winding paved roads through rolling karst hills.",
      hikeDuration: "2 - 5 min walk directly from the shoreline and local beach warungs to the cliff sectors.",
      parkingInfo: "Expansive beachside parking managed by Purwodadi Village youth community (IDR 5,000 for motorbikes, IDR 10,000 for cars).",
      publicTransit: "Damri shuttle bus from Yogyakarta to Pantai Baron / Wonosari, then motorcycle rental or local taxi to Siung Beach."
    },
    whoToContact: {
      name: "Pak Sumarno & Mas Arif",
      role: "Siung Climbing Basecamp Managers & FPTI Route Pioneers",
      phone: "+6281298765432",
      basecampName: "Siung Beach Rock Climbing Basecamp",
      basecampAddress: "Dusun Duwet, Purwodadi, Tepus, Gunungkidul Regency, D.I. Yogyakarta"
    },
    rockType: {
      type: "Marine Karst Limestone",
      texture: "Extremely hard sea-sculpted limestone with jagged sharp pockets, water-eroded jugs, salt-glazed slopers, and solid overhangs.",
      features: "Oceanside sea walls with coastal breeze, sandy boulder blocks, and certified stainless hanger sport routes.",
      ethics: "Inspect bolt hangers for marine salt corrosion before committing. Brush chalk off holds to prevent salt crystallization."
    },
    weatherForecast: {
      condition: "Sunny & Breezy",
      tempAvg: "27°C - 32°C",
      bestSeason: "April through November (Calm seas & clear skies).",
      humidity: "75%",
      rainNotes: "Check ocean tide charts for lower beach boulder sectors; best climbed at low tide in the morning and late afternoon."
    },
    sectors: [
      {
        id: 'siung-karang',
        name: 'Sector Karang Bolong & Beach Blocks',
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Alexandre_Chabot_-_PuntX_9a_-_Gorges_du_Loup.jpg',
        problems: [
          {
            id: 'siung-boulder-1',
            name: 'Ocean Breaker',
            category: 'boulder',
            discipline: 'bouldering',
            grade: 'V5',
            fontGrade: '6C',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Alexandre_Chabot_-_PuntX_9a_-_Gorges_du_Loup.jpg',
            setter: 'Jogja Local',
            setterYear: 'Bambang S. (2019)',
            fa: 'Bambang S. (2019)',
            faDate: '2019-05-10',
            height: '4.0m',
            holdsCount: 11,
            holdDetails: 'Marine limestone pocket underclings, mid-section crimp rail, flat sandy mantle.',
            anchorCount: 0,
            anchorType: 'Top-out',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat sandy beach',
            startType: 'Sit Start (SS)',
            description: 'Iconic karst boulder sitting right at the shoreline. Excellent sandy landing with ocean views and wave crashes behind you.',
            betaText: 'Observe ocean tide conditions when approaching this boulder block. Marine erosion creates exceptional friction, but beware of sharp coral edges.',
            accessInfo: 'East side of Siung Beach, 5 minutes walk from the main parking area.',
            localContact: 'Mas Danang (FPTI Siung): +6285678901234',
            ascentCount: 52,
            gradeVotes: [
              { grade: 'V4', votes: 10 },
              { grade: 'V5', votes: 35 },
              { grade: 'V6', votes: 7 },
            ],
            markers: [
              { id: 'sb1', type: 'S', x: 40, y: 80, label: 'Start' },
              { id: 'sb2', type: 'T', x: 45, y: 25, label: 'Top' },
            ],
          },
          {
            id: 'siung-sport-1',
            name: 'Karst Coastal Roof & Pockets',
            category: 'lead',
            discipline: 'sport',
            grade: '5.10d',
            fontGrade: '6b+',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Fabio_Palma%2C_Cardiopalma%2C_7c%2C_Kalymnos.jpg',
            setter: 'FPTI DIY',
            setterYear: 'FPTI DIY (2015)',
            fa: 'FPTI Team (2015)',
            faDate: '2015-04-12',
            height: '18m',
            holdsCount: 26,
            holdDetails: 'Sharp coral limestone pockets, 2 kneebars at the rest station, 1 crux sidepull leading to bolt 5.',
            anchorCount: 8,
            boltCount: 7,
            anchorType: 'Marine Grade 316 Stainless Steel Double Ring Anchor',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat sandy beach',
            startType: 'Stand Start',
            description: 'Classic oceanside sport lead climbing route with direct Indian Ocean panoramas. Solid marine pocketed limestone with refreshing coastal breezes.',
            betaText: 'Iconic beachside sport route. 7 marine-grade stainless steel bolts. Bring at least a 50-meter rope and 8 quickdraws.',
            accessInfo: 'West cliff of Siung Beach, 3 minutes from the shoreline.',
            localContact: 'Mas Danang: +6285678901234',
            ascentCount: 115,
            gradeVotes: [
              { grade: '5.10c', votes: 20 },
              { grade: '5.10d', votes: 85 },
              { grade: '5.11a', votes: 10 },
            ],
            markers: [
              { id: 'ss1', type: 'S', x: 55, y: 88, label: 'Start' },
              { id: 'ss2', type: 'B', x: 56, y: 55, label: 'Bolt 4' },
              { id: 'ss3', type: 'T', x: 58, y: 20, label: 'Anchor' },
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Muriel_Rock_Climbing.jpg',
    sectorCount: 3,
    problemCount: 24,
    sectors: [
      {
        id: 'pabeasan-main',
        name: 'Sector Pabeasan & Hawu Bloc',
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Muriel_Rock_Climbing.jpg',
        problems: [
          {
            id: 'pab-1',
            name: 'Hawu Roof Dyno',
            discipline: 'bouldering',
            grade: 'V6',
            fontGrade: '7A',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Adam_Ondra_climbing_Silence_9c_by_PAVEL_BLAZEK_2.jpg',
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
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Muriel_Rock_Climbing.jpg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Coyne_Crack_5.11%2B_-_Supercrack_Buttress_-_Indian_Creek.jpg',
    sectorCount: 2,
    problemCount: 18,
    sectors: [
      {
        id: 'hanyawong-1',
        name: 'Sector Hanyawong Bloc',
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Coyne_Crack_5.11%2B_-_Supercrack_Buttress_-_Indian_Creek.jpg',
        problems: [
          {
            id: 'han-1',
            name: 'Hanyawong Crimp Line',
            discipline: 'bouldering',
            grade: 'V5',
            fontGrade: '6C',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Action_Directe_%28Waldkopf%29.JPG',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Joshue_Tree_National_Park_-_Manx_Boulder_-_6.jpg',
    sectorCount: 2,
    problemCount: 14,
    sectors: [
      {
        id: 'jeger-boulder',
        name: 'Sector Jeger Boulders',
        image: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Joshue_Tree_National_Park_-_Manx_Boulder_-_6.jpg',
        problems: [
          {
            id: 'jeg-1',
            name: 'Si Jeger Dyno',
            discipline: 'bouldering',
            grade: 'V7',
            fontGrade: '7A+',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Joshue_Tree_National_Park_-_Manx_Boulder_-_6.jpg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Midnight_Lightning_yosemite.jpg',
    sectorCount: 3,
    problemCount: 28,
    sectors: [
      {
        id: 'punceling-forest',
        name: 'Sector Punceling Pine Forest',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Midnight_Lightning_yosemite.jpg',
        problems: [
          {
            id: 'pun-1',
            name: 'Pine Arête',
            discipline: 'bouldering',
            grade: 'V4',
            fontGrade: '6B',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Midnight_Lightning_yosemite.jpg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/50/GIOVANNI_BOULDERING.jpg',
    sectorCount: 2,
    problemCount: 16,
    sectors: [
      {
        id: 'mastodon-bloc',
        name: 'Sector Mastodon Boulders',
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/50/GIOVANNI_BOULDERING.jpg',
        problems: [
          {
            id: 'mas-1',
            name: 'Mastodon Tusk',
            discipline: 'bouldering',
            grade: 'V8',
            fontGrade: '7B',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/50/GIOVANNI_BOULDERING.jpg',
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
            imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Climbing_in_Yosemite_Valley_-_01.jpg',
    sectorCount: 2,
    problemCount: 15,
    sectors: [
      {
        id: 'btm-puncak',
        name: 'Sector Tegal Malaka Summit Blocks',
        image: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Climbing_in_Yosemite_Valley_-_01.jpg',
        problems: [
          {
            id: 'btm-1',
            name: 'Malaka Highball',
            discipline: 'bouldering',
            grade: 'V5',
            fontGrade: '6C',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Climbing_in_Yosemite_Valley_-_01.jpg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Adam_Ondra_climbing_Silence_9c_by_PAVEL_BLAZEK_2.jpg',
    sectorCount: 4,
    problemCount: 42,
    sectors: [
      {
        id: 'maros-rammang',
        name: 'Sector Rammang-Rammang Karst Towers',
        image: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Adam_Ondra_climbing_Silence_9c_by_PAVEL_BLAZEK_2.jpg',
        problems: [
          {
            id: 'mrs-1',
            name: 'Celebes Roof',
            discipline: 'bouldering',
            grade: 'V7',
            fontGrade: '7A+',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Adam_Ondra_climbing_Silence_9c_by_PAVEL_BLAZEK_2.jpg',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Climbing.wall.bath.university.arp.jpg',
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
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Indoors_bouldering_in_Pasila%2C_Helsinki.jpg',
    type: 'indoor',
  },
  {
    id: 'session-3',
    title: 'Harau Valley Expedition',
    organizer: 'Indonesia Climbing Federation',
    date: 'Sep 13-15',
    participants: 22,
    maxParticipants: 30,
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Fabio_Palma%2C_Cardiopalma%2C_7c%2C_Kalymnos.jpg',
    type: 'expedition',
  },
]

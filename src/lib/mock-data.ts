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
    description: "Kawasan karst legendaris di Padalarang dengan formasi tebing kapur purba berusia jutaan tahun. Pusat pelatihan dan eksplorasi bouldering serta sport climbing terfavorit di Jawa Barat.",
    coordinates: { lat: -6.8375, lng: 107.4589 },
    gmapsUrl: "https://maps.google.com/?q=-6.8375,107.4589",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.439872583861!2d107.4563251!3d-6.8375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e4cbb5b0c7db%3A0x6b1f2382f7c2225!2sTebing%20Citatah%2090!5e0!3m2!1sid!2sid!4v1700000000000",
    howToGetThere: {
      driveInfo: "Dari Bandung atau Jakarta via Tol Purbaleunyi, keluar di Gerbang Tol Padalarang. Ikuti Jalan Raya Cipatat menuju kawasan Gua Pawon / Citatah (~15 menit dari gerbang tol). Jalan beraspal mulus dapat diakses kendaraan roda 2 dan roda 4.",
      hikeDuration: "5 - 10 menit jalan kaki santai dari area parkir basecamp menuju dasar tebing sektor panjat.",
      parkingInfo: "Area parkir luas untuk mobil dan motor di Basecamp Pawon / Saung Panjat Citatah 90 (Rp 5.000 roda 2, Rp 15.000 roda 4).",
      publicTransit: "Kereta Cepat Whoosh stasiun Padalarang atau KRL Commuter Line Bandung Raya, disambung angkot Padalarang-Rajamandala (turun di pertigaan Gua Pawon)."
    },
    whoToContact: {
      name: "Kang Asep Kurnia",
      role: "Ketua Pengelola Tebing & Senior Guide FPTI Jabar",
      phone: "+6281234567890",
      basecampName: "Basecamp Saung Panjat Citatah 90",
      basecampAddress: "Kampung Cibukur RT 02/RW 11, Desa Gunung Masigit, Kec. Cipatat, Kab. Bandung Barat"
    },
    rockType: {
      type: "Karst Limestone (Batu Gamping Karst Padat)",
      texture: "Batu kapur tajam berpori padat dengan pocket dalam, tufas masif alami, crimps bertebing overhang, dan batuan atap yang kokoh.",
      features: "Didominasi overhang bouldering cave di sektor Gua Pawon serta vertical pocket face di Tebing 90 & 125.",
      ethics: "Gunakan magnesium secukupnya dan bersihkan bekas tick mark dengan sikat berbulu halus (nylon/horsehair). Dilarang keras melakukan chipping batuan."
    },
    weatherForecast: {
      condition: "Cerah Berawan",
      tempAvg: "26°C - 31°C",
      bestSeason: "Mei hingga Oktober (Musim Kemarau). Sektor dalam Gua Pawon tetap terlindung saat hujan gerimis.",
      humidity: "68%",
      rainNotes: "Permukaan batuan luar licin jika terkena hujan lebat; disarankan memanjat di area overhang terlindung saat cuaca mendung."
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
            holdDetails: '2 crimps awal tajam, 1 undercling kanan, 1 pinch stabil di zona tengah, dyno ke upper lip sloper, 2 finish jugs mantap.',
            anchorCount: 0,
            anchorType: 'Top-out Ledge Mantle',
            padRecommendation: '2 Crashpads + 1 Spotter',
            landingQuality: 'Flat grassy ground',
            startType: 'Sit Start (SS)',
            description: 'Powerful boulder problem on the red limestone overhang of Pawon Cave. Crux moves through a positive undercling to a dynamic pop for the upper lip.',
            betaText: 'Mulai dari sit start pegangan crimp ganda. Kunci tumit (heel hook) kanan pada tonjolan batu bawah, rengkuh undercling dalam dengan tangan kiri, ledakkan tenaga dyno ke sloper bibir tebing, lalu mantle kaki kanan untuk berdiri di atas.',
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
            holdDetails: '10 finger crack jams di seksi bawah, rest ledge di baut 5, crux micro-crimps dan tufa pinch di baut 7, 2 finish bucket jugs.',
            anchorCount: 10,
            boltCount: 9,
            anchorType: 'Double Ring Stainless Chain Anchor dengan carabiner baja',
            description: 'Jalur lead sport climbing favorit di Tebing Citatah. Menantang ketahanan lengan (endurance) dan ketepatan footwork di dinding kapur 90 derajat.',
            betaText: 'Bawa 10 set quickdraw dan tali minimal 60 meter. Crux berada di antara baut ke-6 dan ke-7; gunakan tufa pinch kiri dan high-step kaki kanan ke celah kecil untuk meraih crimp atas.',
            betaVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            accessInfo: 'Terletak di sektor tengah tebing Pawon, 15 meter dari pintu masuk gua.',
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
            betaText: 'Problem kompresi sloper murni di atap 45 derajat. Gunakan toe hook kiri untuk menahan rotasi tubuh saat transisi ke lip mantle.',
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
    description: "Lembah tebing granit dan andesit raksasa setinggi 100-300 meter yang menjulang di antara hamparan sawah hijau Minangkabau. Surga panjat alam Indonesia dengan nuansa pemandangan kelas dunia.",
    coordinates: { lat: -0.1011, lng: 100.6722 },
    gmapsUrl: "https://maps.google.com/?q=-0.1011,100.6722",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.817345383561!2d100.6700!3d-0.1011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd5373a6a9b441f%3A0x8e82d8c303ea!2sLembah%20Harau!5e0!3m2!1sid!2sid!4v1700000000000",
    howToGetThere: {
      driveInfo: "Dari Bandara Internasional Minangkabau (BIM) Padang, berkendara sekitar 2,5 - 3 jam menuju Kota Payakumbuh, lalu lanjut 15 menit menuju Lembah Harau via jalan beraspal.",
      hikeDuration: "2 - 15 menit jalan kaki santai menyusuri pematang sawah dari homestay atau tempat parkir ke kaki tebing.",
      parkingInfo: "Parkir tersedia di area homestay, gerbang wisata Lembah Harau, dan spot basecamp Echo Valley.",
      publicTransit: "Travel rute Padang - Payakumbuh, dilanjutkan angkutan pedesaan atau ojek ke gerbang cagar alam Harau."
    },
    whoToContact: {
      name: "Mak Etek & Sutan Harau",
      role: "Pemandu Senior Lembah Harau & Komunitas Harau Climbers",
      phone: "+6281345678901",
      basecampName: "Echo Valley Homestay & Climber Camp",
      basecampAddress: "Nagari Tarantang, Kec. Harau, Kab. Lima Puluh Kota, Sumatera Barat"
    },
    rockType: {
      type: "Breccia Granit & Batuan Andesit Vertikal",
      texture: "Batuan andesit dan granit masif dengan friction tinggi, micro crystal crimps, rekahan crack alami, dan dinding tegak 90 derajat.",
      features: "Tebing tinggi ratusan meter cocok untuk multipitch, trad climbing crack, serta boulder-boulder raksasa di dasar lembah.",
      ethics: "Menghormati kearifan lokal masyarakat Nagari Tarantang. Jaga kebersihan lembah dan jangan meninggalkan sampah bungkus tape/makanan."
    },
    weatherForecast: {
      condition: "Sejuk Tropis",
      tempAvg: "23°C - 28°C",
      bestSeason: "Juni hingga September. Suhu pagi dan sore sangat nyaman untuk memanjat.",
      humidity: "72%",
      rainNotes: "Hujan pegunungan tropis dapat terjadi di sore hari; disarankan memulai sesi panjat pagi hari pukul 07:00."
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
            holdDetails: 'Undercling tajam, dyno dinamis ke crimp sisi kanan, finish topout kokoh.',
            anchorCount: 0,
            anchorType: 'Top-out',
            padRecommendation: '3 Crashpads + 1 Spotter',
            landingQuality: 'Flat meadow',
            startType: 'Sit Start (SS)',
            description: 'Jalur bouldering V8 legendaris di blok granit Lembah Harau dengan transisi kompresi agresif dan topout teknikal.',
            betaText: 'Mulai dengan undercling tangan kiri yang solid, pasang heel hook kanan di lipatan granit, ledakkan lompatan ke crimp atas.',
            accessInfo: 'Terletak di dekat tebing Echo Valley, 5 menit dari jalan utama Lembah Harau.',
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
            holdDetails: 'Sloper tajam granit, heel hook tinggi, compression arête.',
            anchorCount: 0,
            anchorType: 'Top-out',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Datar berumput',
            startType: 'Sit Start (SS)',
            description: 'Problem bouldering berkarakter dengan kompresi arête tajam yang membutuhkan kekuatan jemari dan fleksibilitas tinggi.',
            betaText: 'Pegang arête dengan pinching kuat, bawa kaki kanan tinggi ke ledge kristal untuk menyeimbangkan badan.',
            accessInfo: 'Blok batu Harau sektor tengah, berdampingan dengan Gorejat.',
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
            holdDetails: 'Underclings ganda batu granit merah, compression slopers di pinggir kristal, finish mantle atas padat.',
            anchorCount: 0,
            anchorType: 'Top-out Highball Ledge',
            padRecommendation: '3 Crashpads + 2 Spotters',
            landingQuality: 'Flat grassy meadow',
            startType: 'Sit Start (SS)',
            description: 'Stunning red granite boulder sitting in the valley floor. Features powerful underclings leading to delicate compression slopers.',
            betaText: 'Batu granit merah unik di dasar lembah. Gunakan friksi sol sepatu dengan menekan tumit pada ledge bawah, jepit sloper kristal dan dorong badan ke atas tanpa ragu.',
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
            holdDetails: 'Hand jams konsisten ukuran #2 dan #3 Camalot, finger lock di crux pitch 1, rest platform di teras tengah.',
            anchorCount: 2,
            anchorType: 'Trad Gear Anchor & Tree / Bolted Rappel Station',
            description: 'Jalur trad climbing rekahan crack murni legendaris di dinding andesit Sarasah Harau. Membutuhkan penempatan cam aktif yang solid.',
            betaText: 'Bawa satu set lengkap cams (#0.4 hingga #4) dan double set ukuran #2. Jamming tangan sangat bersih; pastikan memakai tape gloves.',
            accessInfo: 'Terletak di sisi kiri air terjun Sarasah Bunta, 10 menit jalan kaki.',
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
            holdDetails: 'Micro-crystal crimps dan rounded granite slopers.',
            anchorCount: 0,
            anchorType: 'Top-out',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat sand base',
            startType: 'Sit Start (SS)',
            description: 'Friction-dependent problem on polished granite with micro-crystal crimps. Tests finger strength and precise body positioning.',
            betaText: 'Sangat bergantung pada suhu batuan dan kebersihan sol sepatu. Bersihkan debu granit sebelum start.',
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
    description: "Kawasan tebing karang laut eksotis di pesisir Samudra Hindia Gunungkidul dengan 200+ jalur panjat. Menawarkan sensasi memanjat ditemani deburan ombak dan panorama matahari terbenam spektakuler.",
    coordinates: { lat: -8.1819, lng: 110.6833 },
    gmapsUrl: "https://maps.google.com/?q=-8.1819,110.6833",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.482718294621!2d110.6811!3d-8.1819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7bc449ad681997%3A0x6b7722bb0b7123!2sPantai%20Siung!5e0!3m2!1sid!2sid!4v1700000000000",
    howToGetThere: {
      driveInfo: "Dari pusat kota Yogyakarta menuju arah Wonosari, lanjut ke Tepus via Jl. Baron dan Jl. Pantai Siung (sekitar 2 jam berkendara). Jalan beraspal mulus berkelok khas perbukitan karst.",
      hikeDuration: "2 - 5 menit jalan kaki langsung dari bibir pantai dan warung warga menuju sektor-sektor tebing.",
      parkingInfo: "Area parkir pinggir pantai sangat luas, dikelola karang taruna Desa Purwodadi (Rp 5.000 roda 2, Rp 10.000 roda 4).",
      publicTransit: "Bus Damri / Shuttle wisata Yogyakarta - Pantai Baron / Wonosari, dilanjutkan sewa motor atau carter ojek lokal ke Pantai Siung."
    },
    whoToContact: {
      name: "Pak Sumarno & Mas Arif",
      role: "Pengelola Basecamp Panjat Siung & Perintis Jalur FPTI DIY",
      phone: "+6281298765432",
      basecampName: "Basecamp Panjat Tebing Pantai Siung",
      basecampAddress: "Dusun Duwet, Desa Purwodadi, Kec. Tepus, Kab. Gunungkidul, D.I. Yogyakarta"
    },
    rockType: {
      type: "Karst Karang Pesisir Laut (Marine Limestone)",
      texture: "Batuan kapur laut sangat keras dengan pocket tajam bergerigi, water-eroded jugs, slopers berlapis garam, dan overhang kokoh.",
      features: "Dinding tepi laut dengan angin semilir, sektor boulder pasir pantai, serta rute single-pitch sport climbing bersertifikasi hanger stainless.",
      ethics: "Periksa korosi hanger baut karena pengaruh udara garam laut. Bersihkan chalk dari batuan agar tidak terakumulasi garam."
    },
    weatherForecast: {
      condition: "Cerah Berangin",
      tempAvg: "27°C - 32°C",
      bestSeason: "April hingga November (Musim ombak tenang & langit cerah berbintang).",
      humidity: "75%",
      rainNotes: "Perhatikan pasang surut air laut untuk sektor boulder bawah pantai; aman saat air laut surut di pagi dan sore hari."
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
            holdDetails: 'Underclings pocket karang laut, rail crimp tengah, mantle flat pasir.',
            anchorCount: 0,
            anchorType: 'Top-out',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat sandy beach',
            startType: 'Sit Start (SS)',
            description: 'Iconic karst boulder sitting right at the shoreline. Excellent sandy landing with ocean views and wave crashes behind you.',
            betaText: 'Perhatikan kondisi ombak saat mendekat ke boulder ini. Grip sangat baik karena erosi air laut, namun waspadai ketajaman batuan karang.',
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
            holdDetails: 'Pockets karang tajam, 2 knee bars di rest station, 1 crux sidepull menuju baut 5.',
            anchorCount: 8,
            boltCount: 7,
            anchorType: 'Marine Grade 316 Stainless Steel Double Ring Anchor',
            padRecommendation: '2 Crashpads',
            landingQuality: 'Flat sandy beach',
            startType: 'Stand Start',
            description: 'Rute lead sport climbing tepi laut dengan pemandangan langsung ke Samudra Hindia. Karang laut ber-pocket kokoh dan angin laut yang segar.',
            betaText: 'Rute lead sport ikonik tepi pantai. 7 baut stainless steel tahan garam laut. Bawa tali minimal 50 meter dan 8 set quickdraw.',
            accessInfo: 'Tebing barat Pantai Siung, 3 menit dari bibir pantai.',
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

import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

/**
 * Shared JSON column types stored as structured metadata alongside PostgreSQL text URLs.
 * All image/media columns store text URLs only (e.g. Cloudinary secure_url), never binary or base64.
 */
export interface TopoMarkerJson {
  id: string
  type: 'S' | 'Z' | 'T' | 'B' | 'P' | 'H'
  x: number
  y: number
  label?: string
}

export interface PitchDetailJson {
  pitchNumber: number
  grade: string
  length: string
  description: string
}

export interface GradeVoteJson {
  grade: string
  votes: number
}

export interface CommunityMemberJson {
  name: string
  avatar: string
  role: string
}

export interface StoneTypologyJson {
  type: string
  texture: string
  features: string
  ethics?: string
  texturePhotoUrl?: string
  macroDescription?: string
}

export interface CoordinatesJson {
  lat: number
  lng: number
}

export interface CommunityCommentJson {
  user: string
  text: string
}

export const routeDisciplineEnum = pgEnum('route_discipline', [
  'sport',
  'multipitch',
  'bouldering',
])

export const userRoleEnum = pgEnum('user_role', [
  'guest',
  'registered',
  'gym_admin',
  'super_admin',
  'climber',
  'route_setter',
  'trip_guide',
])

export const ascentStyleEnum = pgEnum('ascent_style', [
  'redpoint',
  'flash',
  'onsight',
  'repeat',
])

export const bookingSlotEnum = pgEnum('booking_slot', [
  'morning',
  'afternoon',
  'evening',
])

export const bookingStatusEnum = pgEnum('booking_status', [
  'confirmed',
  'cancelled',
  'completed',
])

export const joinRequestStatusEnum = pgEnum('join_request_status', [
  'pending',
  'approved',
  'rejected',
])

// ============================================================================
// 1. Better Auth Core Tables + Jalur User Profile Fields
// ============================================================================

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  // Jalur climber / partner profile extensions
  role: userRoleEnum('role').notNull().default('climber'),
  handle: text('handle').unique(),
  gradeMax: text('grade_max'),
  ascentsCount: integer('ascents_count').notNull().default(0),
  hometown: text('hometown'),
  countryOfOrigin: text('country_of_origin').notNull().default('Indonesia'),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_user_id_idx').on(table.userId)]
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('account_user_id_idx').on(table.userId)]
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
)

// ============================================================================
// 2. Core Application Domain Tables (Migrated from Supabase SQL Schema)
// ============================================================================

export const gyms = pgTable('gyms', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').references(() => user.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull(),
  imageUrl: text('image_url').notNull().default(''),
  logoUrl: text('logo_url'),
  galleryImageUrls: text('gallery_image_urls')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  rating: numeric('rating', { precision: 2, scale: 1 }).notNull().default('0'),
  reviewCount: integer('review_count').notNull().default(0),
  slotsMorning: integer('slots_morning').notNull().default(0),
  slotsAfternoon: integer('slots_afternoon').notNull().default(0),
  slotsEvening: integer('slots_evening').notNull().default(0),
  maxSlotsMorning: integer('max_slots_morning').notNull().default(20),
  maxSlotsAfternoon: integer('max_slots_afternoon').notNull().default(20),
  maxSlotsEvening: integer('max_slots_evening').notNull().default(25),
  facilities: text('facilities')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  pricePerSession: integer('price_per_session').notNull().default(0),
  address: text('address').notNull().default(''),
  routeSetters: text('route_setters')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  description: text('description').notNull().default(''),
  phone: text('phone').notNull().default(''),
  instagram: text('instagram').notNull().default(''),
  gmapsUrl: text('gmaps_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cragRegions = pgTable('crag_regions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  province: text('province').notNull(),
  imageUrl: text('image_url').notNull().default(''),
  description: text('description').notNull().default(''),
  sectorCount: integer('sector_count').notNull().default(0),
  problemCount: integer('problem_count').notNull().default(0),
  coordinates: jsonb('coordinates').$type<CoordinatesJson>(),
  gmapsUrl: text('gmaps_url'),
  rockType: jsonb('rock_type').$type<StoneTypologyJson>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sectors = pgTable(
  'sectors',
  {
    id: text('id').primaryKey(),
    cragId: text('crag_id')
      .notNull()
      .references(() => cragRegions.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    imageUrl: text('image_url').notNull().default(''),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_sectors_crag').on(table.cragId)]
)

export const routes = pgTable(
  'routes',
  {
    id: text('id').primaryKey(),
    sectorId: text('sector_id')
      .notNull()
      .references(() => sectors.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    discipline: routeDisciplineEnum('discipline').notNull(),
    grade: text('grade').notNull(),
    fontGrade: text('font_grade').notNull().default(''),
    setter: text('setter').notNull().default(''),
    fa: text('fa').notNull().default(''),
    faDate: date('fa_date'),
    description: text('description').notNull().default(''),
    imageUrl: text('image_url'),
    betaVideoUrl: text('beta_video_url'),
    accessInfo: text('access_info').notNull().default(''),
    localContact: text('local_contact').notNull().default(''),
    ascentCount: integer('ascent_count').notNull().default(0),
    gradeVotes: jsonb('grade_votes').$type<GradeVoteJson[]>().notNull().default([]),
    markers: jsonb('markers').$type<TopoMarkerJson[]>().notNull().default([]),

    // Sport climbing specific fields
    pitchLength: text('pitch_length'),
    boltCount: integer('bolt_count'),
    anchorType: text('anchor_type'),

    // Multi-pitch specific fields
    totalPitches: integer('total_pitches'),
    totalHeight: text('total_height'),
    pitchBreakdown: jsonb('pitch_breakdown').$type<PitchDetailJson[]>(),
    descentInfo: text('descent_info'),

    // Bouldering specific fields
    padRecommendation: text('pad_recommendation'),
    landingQuality: text('landing_quality'),
    startType: text('start_type'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_routes_sector').on(table.sectorId),
    index('idx_routes_discipline').on(table.discipline),
  ]
)

export const communities = pgTable('communities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull(),
  imageUrl: text('image_url').notNull().default(''),
  memberCount: integer('member_count').notNull().default(0),
  homebase: text('homebase').notNull().default(''),
  description: text('description').notNull().default(''),
  whatsapp: text('whatsapp').notNull().default(''),
  instagram: text('instagram').notNull().default(''),
  tags: text('tags')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  members: jsonb('members').$type<CommunityMemberJson[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const ascentLogs = pgTable(
  'ascent_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    routeId: text('route_id')
      .notNull()
      .references(() => routes.id, { onDelete: 'cascade' }),
    ascentType: ascentStyleEnum('ascent_type').notNull().default('redpoint'),
    gradeOpinion: text('grade_opinion'),
    notes: text('notes'),
    rating: integer('rating'),
    // Send Card URL media & route overlay metadata (URL text only)
    imageUrl: text('image_url'),
    videoUrl: text('video_url'),
    climberName: text('climber_name'),
    attempts: text('attempts'),
    duration: text('duration'),
    belayer: text('belayer'),
    photographer: text('photographer'),
    wallAngle: text('wall_angle'),
    wallHeight: text('wall_height'),
    boltsCount: text('bolts_count'),
    locationLabel: text('location_label'),
    provinceCountry: text('province_country'),
    markers: jsonb('markers').$type<TopoMarkerJson[]>().notNull().default([]),
    loggedAt: timestamp('logged_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_ascent_logs_user').on(table.userId),
    index('idx_ascent_logs_route').on(table.routeId),
  ]
)

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gymId: text('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    slot: bookingSlotEnum('slot').notNull(),
    date: date('date').notNull(),
    status: bookingStatusEnum('status').notNull().default('confirmed'),
    ticketCode: text('ticket_code').unique(),
    totalAmount: integer('total_amount').notNull().default(0),
    addons: jsonb('addons').$type<Record<string, number>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_bookings_user').on(table.userId),
    index('idx_bookings_gym').on(table.gymId),
    index('idx_bookings_date').on(table.date),
  ]
)

export const waitlist = pgTable('waitlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  source: text('source').notNull().default('jalur.world'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================================
// 3. Extended Community Tables (Previously Mocked / LocalStorage Only)
// ============================================================================

export const communityPosts = pgTable(
  'community_posts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    userName: text('user_name').notNull(),
    userHandle: text('user_handle').notNull().default(''),
    avatarUrl: text('avatar_url').notNull().default(''),
    hometown: text('hometown').notNull().default('Indonesia'),
    activity: text('activity').notNull(),
    location: text('location').notNull(),
    grade: text('grade'),
    caption: text('caption').notNull(),
    imageUrl: text('image_url').notNull().default(''),
    likesCount: integer('likes_count').notNull().default(0),
    authorType: text('author_type').notNull().default('climber'),
    sharedUrl: text('shared_url'),
    comments: jsonb('comments').$type<CommunityCommentJson[]>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_community_posts_user').on(table.userId)]
)

export const communityPhotos = pgTable(
  'community_photos',
  {
    id: text('id').primaryKey(),
    communityId: text('community_id')
      .notNull()
      .references(() => communities.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    imageUrl: text('image_url').notNull(),
    caption: text('caption').notNull().default(''),
    uploaderName: text('uploader_name').notNull(),
    uploaderAvatarUrl: text('uploader_avatar_url'),
    likesCount: integer('likes_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_community_photos_community').on(table.communityId)]
)

export const communityJoinRequests = pgTable(
  'community_join_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    communityId: text('community_id')
      .notNull()
      .references(() => communities.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    climberName: text('climber_name').notNull(),
    level: text('level').notNull().default(''),
    note: text('note'),
    igHandle: text('ig_handle'),
    status: joinRequestStatusEnum('status').notNull().default('pending'),
    requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_community_join_requests_community').on(table.communityId)]
)

// ============================================================================
// 4. Drizzle Relations
// ============================================================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  ownedGyms: many(gyms),
  ascentLogs: many(ascentLogs),
  bookings: many(bookings),
  communityPosts: many(communityPosts),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const cragRegionsRelations = relations(cragRegions, ({ many }) => ({
  sectors: many(sectors),
}))

export const sectorsRelations = relations(sectors, ({ one, many }) => ({
  crag: one(cragRegions, { fields: [sectors.cragId], references: [cragRegions.id] }),
  routes: many(routes),
}))

export const routesRelations = relations(routes, ({ one, many }) => ({
  sector: one(sectors, { fields: [routes.sectorId], references: [sectors.id] }),
  ascentLogs: many(ascentLogs),
}))

export const gymsRelations = relations(gyms, ({ one, many }) => ({
  owner: one(user, { fields: [gyms.ownerId], references: [user.id] }),
  bookings: many(bookings),
}))

export const communitiesRelations = relations(communities, ({ many }) => ({
  photos: many(communityPhotos),
  joinRequests: many(communityJoinRequests),
}))

export const ascentLogsRelations = relations(ascentLogs, ({ one }) => ({
  user: one(user, { fields: [ascentLogs.userId], references: [user.id] }),
  route: one(routes, { fields: [ascentLogs.routeId], references: [routes.id] }),
}))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(user, { fields: [bookings.userId], references: [user.id] }),
  gym: one(gyms, { fields: [bookings.gymId], references: [gyms.id] }),
}))

export const communityPhotosRelations = relations(communityPhotos, ({ one }) => ({
  community: one(communities, {
    fields: [communityPhotos.communityId],
    references: [communities.id],
  }),
}))

export const communityJoinRequestsRelations = relations(communityJoinRequests, ({ one }) => ({
  community: one(communities, {
    fields: [communityJoinRequests.communityId],
    references: [communities.id],
  }),
}))

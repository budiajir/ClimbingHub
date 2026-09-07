/**
 * Supabase Database type definitions for ClimbingHub Indonesia.
 * Matches the SQL schema in supabase/migration.sql
 */

export type RouteDiscipline = 'sport' | 'multipitch' | 'bouldering'
export type UserRole = 'guest' | 'registered' | 'gym_admin' | 'super_admin'

export interface TopoMarkerJson {
  id: string
  type: 'S' | 'Z' | 'T' | 'B' | 'P'
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

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          role: UserRole
          name: string
          email: string
          handle: string | null
          avatar: string | null
          grade_max: string | null
          ascents_count: number
          created_at: string
        }
        Insert: {
          id?: string
          role?: UserRole
          name: string
          email: string
          handle?: string | null
          avatar?: string | null
          grade_max?: string | null
          ascents_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          name?: string
          email?: string
          handle?: string | null
          avatar?: string | null
          grade_max?: string | null
          ascents_count?: number
        }
      }
      gyms: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          city: string
          province: string
          image: string
          rating: number
          review_count: number
          slots_morning: number
          slots_afternoon: number
          slots_evening: number
          max_slots_morning: number
          max_slots_afternoon: number
          max_slots_evening: number
          facilities: string[]
          price_per_session: number
          address: string
          route_setters: string[]
          description: string
          phone: string
          instagram: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          city: string
          province: string
          image?: string
          rating?: number
          review_count?: number
          slots_morning?: number
          slots_afternoon?: number
          slots_evening?: number
          max_slots_morning?: number
          max_slots_afternoon?: number
          max_slots_evening?: number
          facilities?: string[]
          price_per_session?: number
          address: string
          route_setters?: string[]
          description?: string
          phone?: string
          instagram?: string
        }
        Update: {
          name?: string
          city?: string
          province?: string
          image?: string
          rating?: number
          review_count?: number
          slots_morning?: number
          slots_afternoon?: number
          slots_evening?: number
          facilities?: string[]
          price_per_session?: number
          address?: string
          route_setters?: string[]
          description?: string
          phone?: string
          instagram?: string
        }
      }
      crag_regions: {
        Row: {
          id: string
          name: string
          province: string
          image: string
          sector_count: number
          problem_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          province: string
          image?: string
          sector_count?: number
          problem_count?: number
        }
        Update: {
          name?: string
          province?: string
          image?: string
          sector_count?: number
          problem_count?: number
        }
      }
      sectors: {
        Row: {
          id: string
          crag_id: string
          name: string
          image: string
          created_at: string
        }
        Insert: {
          id?: string
          crag_id: string
          name: string
          image?: string
        }
        Update: {
          name?: string
          image?: string
        }
      }
      routes: {
        Row: {
          id: string
          sector_id: string
          name: string
          discipline: RouteDiscipline
          grade: string
          font_grade: string
          setter: string
          fa: string
          fa_date: string | null
          description: string
          image_url: string | null
          beta_video_url: string | null
          access_info: string
          local_contact: string
          ascent_count: number
          grade_votes: GradeVoteJson[]
          markers: TopoMarkerJson[]
          // Sport climbing fields
          pitch_length: string | null
          bolt_count: number | null
          anchor_type: string | null
          // Multi pitch fields
          total_pitches: number | null
          total_height: string | null
          pitch_breakdown: PitchDetailJson[] | null
          descent_info: string | null
          // Bouldering fields
          pad_recommendation: string | null
          landing_quality: string | null
          start_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sector_id: string
          name: string
          discipline: RouteDiscipline
          grade: string
          font_grade?: string
          setter?: string
          fa?: string
          fa_date?: string | null
          description?: string
          image_url?: string | null
          beta_video_url?: string | null
          access_info?: string
          local_contact?: string
          ascent_count?: number
          grade_votes?: GradeVoteJson[]
          markers?: TopoMarkerJson[]
          pitch_length?: string | null
          bolt_count?: number | null
          anchor_type?: string | null
          total_pitches?: number | null
          total_height?: string | null
          pitch_breakdown?: PitchDetailJson[] | null
          descent_info?: string | null
          pad_recommendation?: string | null
          landing_quality?: string | null
          start_type?: string | null
        }
        Update: {
          name?: string
          discipline?: RouteDiscipline
          grade?: string
          font_grade?: string
          setter?: string
          fa?: string
          fa_date?: string | null
          description?: string
          image_url?: string | null
          beta_video_url?: string | null
          access_info?: string
          local_contact?: string
          ascent_count?: number
          grade_votes?: GradeVoteJson[]
          markers?: TopoMarkerJson[]
          pitch_length?: string | null
          bolt_count?: number | null
          anchor_type?: string | null
          total_pitches?: number | null
          total_height?: string | null
          pitch_breakdown?: PitchDetailJson[] | null
          descent_info?: string | null
          pad_recommendation?: string | null
          landing_quality?: string | null
          start_type?: string | null
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          city: string
          province: string
          image: string
          member_count: number
          homebase: string
          description: string
          whatsapp: string
          instagram: string
          tags: string[]
          members: CommunityMemberJson[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          province: string
          image?: string
          member_count?: number
          homebase?: string
          description?: string
          whatsapp?: string
          instagram?: string
          tags?: string[]
          members?: CommunityMemberJson[]
        }
        Update: {
          name?: string
          city?: string
          province?: string
          image?: string
          member_count?: number
          homebase?: string
          description?: string
          whatsapp?: string
          instagram?: string
          tags?: string[]
          members?: CommunityMemberJson[]
        }
      }
      ascent_logs: {
        Row: {
          id: string
          user_id: string
          route_id: string
          grade_opinion: string | null
          notes: string | null
          rating: number | null
          logged_at: string
        }
        Insert: {
          id?: string
          user_id: string
          route_id: string
          grade_opinion?: string | null
          notes?: string | null
          rating?: number | null
          logged_at?: string
        }
        Update: {
          grade_opinion?: string | null
          notes?: string | null
          rating?: number | null
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          gym_id: string
          slot: string
          date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gym_id: string
          slot: string
          date: string
          status?: string
        }
        Update: {
          status?: string
        }
      }
    }
    Enums: {
      route_discipline: RouteDiscipline
      user_role: UserRole
    }
  }
}

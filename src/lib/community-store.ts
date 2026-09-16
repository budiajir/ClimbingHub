"use client";
export interface CommunityPhoto {
  id: string;
  communityId: string;
  url: string;
  caption: string;
  uploaderName: string;
  uploaderAvatar?: string;
  createdAt: string;
  likesCount?: number;
}

export interface JoinRequest {
  communityId: string;
  climberName: string;
  level: string;
  note?: string;
  igHandle?: string;
  status: "pending" | "approved";
  requestedAt: string;
}

const DEFAULT_COMMUNITY_PHOTOS: Record<string, CommunityPhoto[]> = {
  "comm-1": [
    {
      id: "photo-1-1",
      communityId: "comm-1",
      url: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=900&q=80",
      caption: "Sesi bouldering Sabtu pagi bareng squad di Vertigo! Crux dyno akhirnya berhasil di-send 🎉",
      uploaderName: "Ahmad Rizki",
      uploaderAvatar: "https://i.pravatar.cc/60?img=1",
      createdAt: "10 Sept 2026",
      likesCount: 24,
    },
    {
      id: "photo-1-2",
      communityId: "comm-1",
      url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=900&q=80",
      caption: "Outdoor trip ke Citatah 90. Cuaca cerah, batu kering, psyche tinggi seharian!",
      uploaderName: "Dewi Pratiwi",
      uploaderAvatar: "https://i.pravatar.cc/60?img=5",
      createdAt: "04 Sept 2026",
      likesCount: 38,
    },
    {
      id: "photo-1-3",
      communityId: "comm-1",
      url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=900&q=80",
      caption: "Route setter workshop: setting problem V5 baru untuk turnamen internal.",
      uploaderName: "Budi Santoso",
      uploaderAvatar: "https://i.pravatar.cc/60?img=3",
      createdAt: "28 Agu 2026",
      likesCount: 19,
    },
  ],
  "comm-2": [
    {
      id: "photo-2-1",
      communityId: "comm-2",
      url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=900&q=80",
      caption: "Belajar heel hook & toe hook yang presisi di overhang wall Crux Bandung.",
      uploaderName: "Rizky Fauzan",
      uploaderAvatar: "https://i.pravatar.cc/60?img=7",
      createdAt: "08 Sept 2026",
      likesCount: 31,
    },
    {
      id: "photo-2-2",
      communityId: "comm-2",
      url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&q=80",
      caption: "Squad gathering setelah sesi panjat. Siap-siap crag trip Harau bulan depan!",
      uploaderName: "Maya Sari",
      uploaderAvatar: "https://i.pravatar.cc/60?img=9",
      createdAt: "01 Sept 2026",
      likesCount: 42,
    },
  ],
  "comm-3": [
    {
      id: "photo-3-1",
      communityId: "comm-3",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80",
      caption: "Bouldering pinggir laut Pantai Siung. Sensasi suara ombak sambil menaklukkan tebing tajam.",
      uploaderName: "Arif Hidayat",
      uploaderAvatar: "https://i.pravatar.cc/60?img=11",
      createdAt: "09 Sept 2026",
      likesCount: 56,
    },
    {
      id: "photo-3-2",
      communityId: "comm-3",
      url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=900&q=80",
      caption: "Sunset send session di Siung. Golden hour pemanjat Jogja!",
      uploaderName: "Putri W.",
      uploaderAvatar: "https://i.pravatar.cc/60?img=13",
      createdAt: "02 Sept 2026",
      likesCount: 64,
    },
  ],
};

const PHOTOS_STORAGE_PREFIX = "climbinghub_community_photos_";
const REQUESTS_STORAGE_KEY = "climbinghub_community_requests";

export function getCommunityPhotos(communityId: string): CommunityPhoto[] {
  if (typeof window === "undefined") return DEFAULT_COMMUNITY_PHOTOS[communityId] || [];
  try {
    const raw = localStorage.getItem(PHOTOS_STORAGE_PREFIX + communityId);
    if (!raw) {
      return DEFAULT_COMMUNITY_PHOTOS[communityId] || [];
    }
    const parsed = JSON.parse(raw);
    const defaults = DEFAULT_COMMUNITY_PHOTOS[communityId] || [];
    return [...parsed, ...defaults];
  } catch {
    return DEFAULT_COMMUNITY_PHOTOS[communityId] || [];
  }
}

export function saveCommunityPhoto(
  communityId: string,
  photo: Omit<CommunityPhoto, "id" | "createdAt" | "communityId">
): CommunityPhoto {
  const newPhoto: CommunityPhoto = {
    ...photo,
    id: "user-photo-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    communityId,
    createdAt: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    likesCount: 1,
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PHOTOS_STORAGE_PREFIX + communityId);
      const existing: CommunityPhoto[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(PHOTOS_STORAGE_PREFIX + communityId, JSON.stringify([newPhoto, ...existing]));
      window.dispatchEvent(new CustomEvent("community-photo-updated", { detail: { communityId } }));
    } catch (e) {
      console.error("Error saving community photo", e);
    }
  }

  return newPhoto;
}

export function getCommunityJoinRequests(): Record<string, JoinRequest> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCommunityJoinStatus(communityId: string): "none" | "pending" | "approved" {
  const requests = getCommunityJoinRequests();
  const req = requests[communityId];
  if (!req) return "none";
  return req.status;
}

export function saveCommunityJoinRequest(
  communityId: string,
  data: { climberName: string; level: string; note?: string; igHandle?: string; autoApprove?: boolean }
): JoinRequest {
  const newReq: JoinRequest = {
    communityId,
    climberName: data.climberName,
    level: data.level,
    note: data.note,
    igHandle: data.igHandle,
    status: data.autoApprove ? "approved" : "pending",
    requestedAt: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getCommunityJoinRequests();
      existing[communityId] = newReq;
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent("community-request-updated", { detail: { communityId } }));
    } catch (e) {
      console.error("Error saving join request", e);
    }
  }

  return newReq;
}

export function cancelCommunityJoinRequest(communityId: string): void {
  if (typeof window !== "undefined") {
    try {
      const existing = getCommunityJoinRequests();
      delete existing[communityId];
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent("community-request-updated", { detail: { communityId } }));
    } catch (e) {
      console.error("Error cancelling join request", e);
    }
  }
}

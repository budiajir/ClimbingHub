"use client";

import React from "react";
import clsx from "clsx";

export type PictogramName =
  | "crag"
  | "problem"
  | "boulder"
  | "create"
  | "gym"
  | "community"
  | "profile-picture"
  | "menu"
  | "x"
  | "beta-book"
  | "beta-cards"
  | "like"
  | "liked"
  | "share-link"
  | "shoes"
  | "chalk-bag"
  | "carabiner"
  | "brush"
  | "crash-pad"
  | "cafe"
  | "locker"
  | "shower"
  | "toilet"
  | "praying-room"
  | "clean-water"
  | "free-refil"
  | "smoking-area"
  | "cloak-room"
  | "wall-over-hang"
  | "wall-roof"
  | "wall-slab"
  | "wall-vertical"
  | "view-mode-full-frame"
  | "view-mode-list"
  | "view-mode-slide"
  | "view-mode-thumbnail"
  | string;

interface PictogramProps {
  name: PictogramName;
  className?: string;
  size?: number;
  alt?: string;
}

const ALIASES: Record<string, string> = {
  slide: "view-mode-slide",
  "view-mode-slide": "view-mode-slide",
  thumbnail: "view-mode-thumbnail",
  grid: "view-mode-thumbnail",
  "view-mode-thumbnail": "view-mode-thumbnail",
  list: "view-mode-list",
  "view-mode-list": "view-mode-list",
  "full-frame": "view-mode-full-frame",
  "view-mode-full-frame": "view-mode-full-frame",
  "beta-cards": "beta-cards",
  "sent-cards": "beta-cards",
  "beta-book": "beta-book",
  problems: "problem",
  problem: "problem",
  boulders: "boulder",
  boulder: "boulder",
  crags: "crag",
  crag: "crag",
  gym: "gym",
  "climbing-gym": "gym",
  community: "community",
  communities: "community",
  create: "create",
  crerate: "create",
  profile: "profile-picture",
  "profile-picture": "profile-picture",
  account: "profile-picture",
};

export default function Pictogram({
  name,
  className,
  size = 24,
  alt,
}: PictogramProps) {
  // Normalize name to match slug, removing prefix or suffix
  let slug = name
    .toLowerCase()
    .replace(/\.png$/i, "")
    .replace(/^jalur[\.\-_]picto[\.\-_]26[\.\-_]v1[\.\-_]/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (ALIASES[slug]) {
    slug = ALIASES[slug];
  }

  const src = `/pictograms/${slug}.png`;

  return (
    <span
      role="img"
      aria-label={alt || name}
      className={clsx("inline-block flex-shrink-0 transition-all", className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        backgroundColor: "currentColor",
      }}
    />
  );
}

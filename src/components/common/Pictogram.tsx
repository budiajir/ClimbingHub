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

export default function Pictogram({
  name,
  className,
  size = 24,
  alt,
}: PictogramProps) {
  // Normalize name to match slug or exact name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

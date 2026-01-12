"use client";

import { useState } from "react";
import type { AudioTrendRow } from "@/lib/types";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  audio: AudioTrendRow;
  variant?: "icon" | "button";
  className?: string;
}

export function FavoriteButton({
  audio,
  variant = "icon",
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isInitialized } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const favorited = isInitialized && isFavorite(audio.id);

  const handleClick = () => {
    setIsAnimating(true);
    toggleFavorite(audio.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ${
          favorited
            ? "border-blaze/50 bg-blaze/10 text-blaze"
            : "border-black/10 bg-white text-black/70 hover:border-black/20"
        } ${className}`}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <span
          className={`inline-block transition-transform duration-300 ${isAnimating ? "scale-125" : "scale-100"}`}
        >
          {favorited ? "★ Saved" : "☆ Save"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full p-1.5 transition-all duration-200 ${
        favorited
          ? "bg-blaze/10 text-blaze"
          : "text-black/30 hover:bg-black/5 hover:text-black/60"
      } ${className}`}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 transition-all duration-300 ${isAnimating ? "scale-125" : "scale-100"} ${favorited ? "fill-current" : ""}`}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}

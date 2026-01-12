"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

interface ShareButtonProps {
  hashtags?: string[];
  url?: string;
  title?: string;
  variant?: "link" | "both";
  className?: string;
}

export function ShareButton({
  hashtags = [],
  url: externalUrl,
  title,
  variant = "link",
  className = "",
}: ShareButtonProps) {
  const pathname = usePathname();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = externalUrl || `${baseUrl}${pathname}`;

  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToastNotification("Link copied!");
    } catch {
      showToastNotification("Failed to copy link");
    }
  };

  const copyHashtags = async () => {
    try {
      const hashtagsText = hashtags
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
        .join(" ");
      await navigator.clipboard.writeText(hashtagsText);
      showToastNotification("Hashtags copied!");
    } catch {
      showToastNotification("Failed to copy hashtags");
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title ?? "Check out this trending audio on GramDominator",
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {variant === "both" && hashtags.length > 0 && (
        <button
          type="button"
          onClick={copyHashtags}
          className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/70 transition hover:border-black/20 hover:bg-black/5"
          aria-label="Copy hashtags"
        >
          Copy hashtags
        </button>
      )}
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/70 transition hover:border-black/20 hover:bg-black/5"
        aria-label="Copy link"
      >
        Copy link
      </button>

      {showToast && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-fade-in rounded-full bg-black/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

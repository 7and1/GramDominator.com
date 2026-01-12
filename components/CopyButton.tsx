"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      data-testid="copy-button"
      className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-black/70"
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
    >
      {copied ? "Copied" : "Copy all"}
    </button>
  );
}

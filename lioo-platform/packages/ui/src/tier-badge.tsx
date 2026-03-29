/**
 * packages/ui/src/tier-badge.tsx
 *
 * TierBadge — Komponen reusable untuk menampilkan Growth Stage tier merchant.
 * Digunakan di: Merchant Portal header, SSO wizard, dan Admin panel.
 *
 * Mapping "The Growth Stage":
 *   SEED    🌱 = #73796D / #E8EADF  (was: Starter)
 *   SPROUT  🌿 = #436831 / #BBEDA6  (was: Flex)
 *   BLOOM   🌸 = #2C4F1B / #C3EFAA  (was: Regular)
 *   FOREST  🌲 = #1A1C19 / #F3F4EF  (was: Enterprise)
 */

import * as React from "react";

export type SubscriptionTier = "SEED" | "SPROUT" | "BLOOM" | "FOREST";

const TIER_CONFIG: Record<
  SubscriptionTier,
  {
    emoji: string;
    label: string;
    tagline: string;
    color: string;
    bg: string;
    border: string;
    milestoneNext?: SubscriptionTier;
  }
> = {
  SEED: {
    emoji: "🌱",
    label: "Seed",
    tagline: "Benih pertama tumbuh dari tanah yang baik.",
    color: "#4B5244",
    bg: "#E8EADF",
    border: "#C3C9BA",
    milestoneNext: "SPROUT",
  },
  SPROUT: {
    emoji: "🌿",
    label: "Sprout",
    tagline: "Bayar saat tumbuh, bukan saat menunggu.",
    color: "#436831",
    bg: "#BBEDA6",
    border: "#A8D390",
    milestoneNext: "BLOOM",
  },
  BLOOM: {
    emoji: "🌸",
    label: "Bloom",
    tagline: "Saat akar kuat, bunga mekar penuh.",
    color: "#2C4F1B",
    bg: "#C3EFAA",
    border: "#8AC77A",
    milestoneNext: "FOREST",
  },
  FOREST: {
    emoji: "🌲",
    label: "Forest",
    tagline: "Ekosistem besar dimulai dari satu pohon.",
    color: "#1A1C19",
    bg: "#F3F4EF",
    border: "#C3C9BA",
  },
};

export interface TierBadgeProps {
  tier: SubscriptionTier;
  /** "pill" = compact badge | "card" = expanded card dengan tagline */
  variant?: "pill" | "card";
  /** Tampilkan panah upgrade ke tier berikutnya */
  showUpgradeHint?: boolean;
  className?: string;
}

export function TierBadge({
  tier,
  variant = "pill",
  showUpgradeHint = false,
  className = "",
}: TierBadgeProps) {
  const cfg = TIER_CONFIG[tier];
  const next = cfg.milestoneNext ? TIER_CONFIG[cfg.milestoneNext] : null;

  if (variant === "card") {
    return (
      <div
        className={`inline-flex flex-col gap-1 rounded-2xl px-4 py-3 ${className}`}
        style={{ backgroundColor: cfg.bg, border: `1.5px solid ${cfg.border}` }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "1.25rem" }}>{cfg.emoji}</span>
          <span
            className="font-extrabold text-sm tracking-tight"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-widest ml-1 opacity-60"
            style={{ color: cfg.color }}
          >
            Growth Tier
          </span>
        </div>
        <p
          className="text-[11px] italic leading-tight"
          style={{ color: cfg.color, opacity: 0.8 }}
        >
          &ldquo;{cfg.tagline}&rdquo;
        </p>
        {showUpgradeHint && next && (
          <div
            className="mt-1 flex items-center gap-1 text-[10px] font-semibold"
            style={{ color: cfg.color }}
          >
            <span>Upgrade ke {next.emoji} {next.label}</span>
            <span>→</span>
          </div>
        )}
      </div>
    );
  }

  // Default: "pill" variant
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${className}`}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1.5px solid ${cfg.border}`,
      }}
    >
      <span>{cfg.emoji}</span>
      {cfg.label}
      {showUpgradeHint && next && (
        <>
          <span className="opacity-40 mx-0.5">·</span>
          <span className="opacity-70">→ {next.emoji}</span>
        </>
      )}
    </span>
  );
}

/** Utilitas untuk mendapatkan config tier */
export function getTierConfig(tier: SubscriptionTier) {
  return TIER_CONFIG[tier];
}

/** Urutan upgrade tier */
export const TIER_ORDER: SubscriptionTier[] = ["SEED", "SPROUT", "BLOOM", "FOREST"];

/**
 * Cek apakah merchant bisa mengakses fitur berdasarkan minimal tier.
 * Contoh: isFeatureAllowed("SPROUT", merchantTier)
 */
export function isFeatureAllowed(
  requiredTier: SubscriptionTier,
  merchantTier: SubscriptionTier
): boolean {
  return TIER_ORDER.indexOf(merchantTier) >= TIER_ORDER.indexOf(requiredTier);
}

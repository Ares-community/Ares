"use client"

/**
 * SiteBackdrop — global background stack rendered at the layout level.
 *
 * Order from back to front:
 *   z-0  AmbientGradient   — the cohesive flowing color field
 *   z-1  ScrollMonolith    — the 3D centerpiece that follows scroll
 *   z-2  faint dot grid + global vignette + scan-lines
 *
 * All page content is positioned relative with z-10+ to sit above this stack.
 */

import dynamic from "next/dynamic"

const AmbientGradient = dynamic(
  () =>
    import("@/components/ui/ambient-gradient").then((m) => ({
      default: m.AmbientGradient,
    })),
  { ssr: false },
)

const ScrollMonolith = dynamic(
  () =>
    import("@/components/ui/scroll-monolith").then((m) => ({
      default: m.ScrollMonolith,
    })),
  { ssr: false },
)

export function SiteBackdrop() {
  return (
    <>
      {/* z-0 — single cohesive flowing color field */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AmbientGradient />
      </div>

      {/* z-1 — 3D monolith that follows scroll */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <ScrollMonolith />
      </div>

      {/* z-2 — dot grid + vignette + scan-lines (no blinking) */}
      <div className="fixed inset-0 z-[2] pointer-events-none">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 90%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.05), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.7), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.022) 0 1px, transparent 1px 3px)",
            mixBlendMode: "overlay",
          }}
        />
      </div>
    </>
  )
}

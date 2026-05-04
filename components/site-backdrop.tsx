"use client"

/**
 * SiteBackdrop — global background stack rendered at the layout level.
 *
 * Order from back to front:
 *   z-0  AmbientGradient   — the cohesive flowing color field
 *   z-1  ScrollMonolith    — the 3D centerpiece that follows scroll
 *   z-2  faint dot grid + global vignette + scan-lines
 *
 * The dot grid, vignette, and scan-lines parallax with the cursor and the
 * scroll position so the whole backdrop feels physically deeper than the
 * page content.
 *
 * All page content is positioned relative with z-10+ to sit above this stack.
 */

import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"

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
  const dotsRef = useRef<HTMLDivElement>(null)
  const vignetteRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mxT = 0
    let myT = 0
    let mx = 0
    let my = 0
    let scrollY = window.scrollY
    let raf: number | null = null

    const onMouse = (e: MouseEvent) => {
      mxT = (e.clientX / window.innerWidth - 0.5) * 2
      myT = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onScroll = () => {
      scrollY = window.scrollY
    }

    const tick = () => {
      mx += (mxT - mx) * 0.06
      my += (myT - my) * 0.06

      if (dotsRef.current) {
        const px = -mx * 22 + scrollY * 0.06
        const py = -my * 16 + scrollY * 0.03
        dotsRef.current.style.backgroundPosition = `${px}px ${py}px`
      }
      if (vignetteRef.current) {
        const px = -mx * 70
        const py = -my * 50 + scrollY * -0.04
        vignetteRef.current.style.transform = `translate3d(${px}px, ${py}px, 0)`
      }
      if (linesRef.current) {
        const px = -mx * 4
        const py = -my * 3 + scrollY * 0.18
        linesRef.current.style.backgroundPosition = `${px}px ${py}px`
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener("mousemove", onMouse)
    window.addEventListener("scroll", onScroll, { passive: true })
    tick()
    return () => {
      window.removeEventListener("mousemove", onMouse)
      window.removeEventListener("scroll", onScroll)
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [])

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

      {/* z-2 — dot grid + vignette + scan-lines (mouse + scroll parallax) */}
      <div className="fixed inset-0 z-[2] pointer-events-none">
        <div
          ref={dotsRef}
          className="absolute inset-0 opacity-50 will-change-[background-position]"
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
          ref={vignetteRef}
          className="absolute -inset-32 will-change-transform"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.05), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.7), transparent 60%)",
          }}
        />
        <div
          ref={linesRef}
          className="absolute inset-0 opacity-40 will-change-[background-position]"
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

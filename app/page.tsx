"use client"

import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useVelocity,
  useSpring,
} from "framer-motion"
import { useRef, useState } from "react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { GlassEffect } from "@/components/ui/liquid-glass"

/* ─────────────────────────────────────────────────────────
   HERO — 3D-centric, no photo, no blinking lights.
   The ScrollMonolith from SiteBackdrop carries the visual; the hero
   is a frosted-glass plaque sitting in front of it.
   ───────────────────────────────────────────────────────── */
function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress, scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0])
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const titleBlurPx = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0, 7])
  const titleFilter = useMotionTemplate`blur(${titleBlurPx}px)`
  const subY = useTransform(scrollYProgress, [0, 1], [0, -60])

  // velocity-driven skew on the title — when the user scrolls hard, the
  // headline tilts a few degrees, then springs back
  const rawVel = useVelocity(scrollY)
  const smoothVel = useSpring(rawVel, { damping: 60, stiffness: 350 })
  const titleSkew = useTransform(smoothVel, [-3500, 0, 3500], [-3, 0, 3], {
    clamp: true,
  })

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 pt-32 pb-24"
    >
      <motion.div
        style={{
          y: titleY,
          opacity: titleOpacity,
          scale: titleScale,
          skewY: titleSkew,
          filter: titleFilter,
        }}
        className="relative z-10 max-w-5xl mx-auto text-center will-change-transform"
      >
        <div className="mb-8 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.6em] uppercase text-white/40">
          <span className="h-px w-10 bg-white/15" />
          <span>Manifest · 001 · 2026</span>
          <span className="h-px w-10 bg-white/15" />
        </div>

        <h1 className="ares-headline font-display text-6xl md:text-8xl font-bold leading-[0.92] tracking-[-0.035em] mb-8">
          Power is everything
          <br />
          in the world of AI.
        </h1>

        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-white/45 mb-7">
          Three tiers · Engineered for absolute dominance
        </p>

        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
          Ares forges intelligence with weight — from the approachable to
          the impossible. A single architecture, three deliberate tiers,
          one unflinching mission.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <LiquidButton
            size="xl"
            className="rounded-full text-white border border-white/15 px-10 font-mono text-xs uppercase tracking-[0.4em]"
          >
            Enter the Arena
          </LiquidButton>
          <a
            href="#projects"
            className="rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-7 py-3 font-mono text-xs uppercase tracking-[0.4em] text-white/65 hover:text-white hover:border-white/20 transition-colors"
          >
            View Index ↓
          </a>
        </div>
      </motion.div>

      <motion.div
        style={{ y: subY }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5em] uppercase text-white/30"
      >
        ↓ Scroll · The core follows
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   MISSION MARQUEE — continuous scroll, no blink
   ───────────────────────────────────────────────────────── */
function MissionMarquee() {
  const items = [
    "POWER IS EVERYTHING",
    "BRO · PRO · SHOW",
    "ENGINEERED FOR DOMINANCE",
    "ARES INTELLIGENCE SYSTEMS",
    "THREE TIERS · ONE MISSION",
    "THE WEIGHT OF INTELLIGENCE",
  ]
  const loop = [...items, ...items]
  return (
    <div className="relative overflow-hidden border-y border-white/8 bg-black/30 py-5 backdrop-blur-md">
      <div className="ares-marquee flex w-max gap-12 whitespace-nowrap font-mono text-xs uppercase tracking-[0.5em] text-white/35">
        {loop.map((s, i) => (
          <span key={i} className="flex items-center gap-12">
            {s}
            <span className="inline-block h-1 w-1 rounded-full bg-white/30" />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   CORE / MANIFESTO PARALLAX — frosted glass plaque next to the
   3D core. Two scroll speeds for stacked layers.
   ───────────────────────────────────────────────────────── */
function CoreSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const leftY = useTransform(scrollYProgress, [0, 1], [80, -80])
  const rightY = useTransform(scrollYProgress, [0, 1], [-40, 40])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 1, 1, 0.4])

  return (
    <section
      ref={ref}
      className="relative py-40 px-4 overflow-hidden"
    >
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
      >
        <motion.div style={{ y: leftY }}>
          <div className="font-mono text-[10px] tracking-[0.7em] uppercase text-white/30 mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-white/15" />
            <span>Core · 00</span>
          </div>
          <h2 className="ares-headline font-display text-5xl md:text-7xl font-bold tracking-[-0.03em] leading-[0.92] mb-7">
            The weight
            <br /> of intelligence,
            <br /> rendered.
          </h2>
          <p className="text-base md:text-lg text-white/60 leading-relaxed mb-10 max-w-md">
            Every Ares system is forged from the same molten core: relentless
            reasoning, scaled gravity, deliberate restraint. Three tiers — one
            architecture of dominance.
          </p>

          <GlassEffect
            variant="default"
            className="rounded-2xl grid grid-cols-3 gap-px max-w-md font-mono"
          >
            <div className="p-5 text-[10px] uppercase tracking-[0.3em]">
              <div className="text-white/40 mb-1">Tiers</div>
              <div className="text-white text-xl font-display tracking-tight">03</div>
            </div>
            <div className="p-5 text-[10px] uppercase tracking-[0.3em] border-l border-white/8">
              <div className="text-white/40 mb-1">Mission</div>
              <div className="text-white text-xl font-display tracking-tight">Power</div>
            </div>
            <div className="p-5 text-[10px] uppercase tracking-[0.3em] border-l border-white/8">
              <div className="text-white/40 mb-1">Status</div>
              <div className="text-white text-xl font-display tracking-tight">Online</div>
            </div>
          </GlassEffect>
        </motion.div>

        <motion.div style={{ y: rightY }} className="relative h-[480px] flex items-center justify-center">
          {/* Just an HUD frame — the actual 3D core lives in SiteBackdrop and follows scroll naturally */}
          <div className="relative h-full w-full pointer-events-none font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
            <span className="absolute top-4 left-4">/ NODE.CORE</span>
            <span className="absolute top-4 right-4">↻ ROTATING</span>
            <span className="absolute bottom-4 left-4">∡ {"<"} 0.001ms</span>
            <span className="absolute bottom-4 right-4">↗ TRACKING</span>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-44 w-44 rounded-full border border-white/10" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-72 w-72 rounded-full border border-white/5" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   SERIES TYPES + DATA
   ───────────────────────────────────────────────────────── */
type Slot = { name: string; status: string; tone: "active" | "pending" }
type Series = {
  index: string
  code: string
  title: string
  tagline: string
  description: string
  meta: string
  badgeLabel: string
  accent: string
  slots: Slot[]
}

const SERIES: Series[] = [
  {
    index: "01",
    code: "SERIES.001",
    title: "BRO",
    tagline: "GENERAL · FRIENDLY · DEVASTATING",
    description:
      "The approachable face of Ares. General-purpose intelligence engineered to feel weightless in conversation, yet capable of carrying the heaviest workloads without strain. Built for everyone — calibrated for everything.",
    meta: "TIER · ACCESSIBLE",
    badgeLabel: "In Development",
    accent: "#ffffff",
    slots: [
      { name: "Buddy", status: "Active", tone: "active" },
      { name: "Slot 02", status: "Soon", tone: "pending" },
      { name: "Slot 03", status: "Soon", tone: "pending" },
    ],
  },
  {
    index: "02",
    code: "SERIES.002",
    title: "PRO",
    tagline: "PROFESSIONAL · INDUSTRIAL · RELENTLESS",
    description:
      "Super mega strong AI built for intense, professional-grade heavy lifting. Deep reasoning, long horizons, and an unflinching workload tolerance. For those who measure performance in tonnage, not tokens.",
    meta: "TIER · PROFESSIONAL",
    badgeLabel: "Coming Soon",
    accent: "#ffffff",
    slots: [
      { name: "Slot 01", status: "Soon", tone: "pending" },
      { name: "Slot 02", status: "Soon", tone: "pending" },
      { name: "Slot 03", status: "Soon", tone: "pending" },
    ],
  },
  {
    index: "03",
    code: "SERIES.003",
    title: "SHOW",
    tagline: "PINNACLE · THEORETICAL · UNCOMPROMISING",
    description:
      "Impossibly strong AI. The absolute pinnacle of what is theoretically possible. Not a product so much as a statement — pure, overwhelming intent rendered into computation. The maximum, demonstrated.",
    meta: "TIER · PINNACLE",
    badgeLabel: "Coming Soon",
    accent: "#ffffff",
    slots: [
      { name: "Slot 01", status: "Soon", tone: "pending" },
      { name: "Slot 02", status: "Soon", tone: "pending" },
      { name: "Slot 03", status: "Soon", tone: "pending" },
    ],
  },
]

/* ─────────────────────────────────────────────────────────
   VERTICAL SERIES CARD — tall frosted-glass, blackish chip
   ───────────────────────────────────────────────────────── */
function SeriesCard({ s, i }: { s: Series; i: number }) {
  const tiltRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const nx = x / r.width - 0.5 // -0.5 .. 0.5
    const ny = y / r.height - 0.5
    el.style.setProperty("--mx", `${x}px`)
    el.style.setProperty("--my", `${y}px`)
    el.style.setProperty("--rx", `${(-ny * 9).toFixed(2)}deg`)
    el.style.setProperty("--ry", `${(nx * 11).toFixed(2)}deg`)
  }

  const handleLeave = () => {
    setHover(false)
    const el = tiltRef.current
    if (!el) return
    el.style.setProperty("--rx", "0deg")
    el.style.setProperty("--ry", "0deg")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
      style={{ perspective: "1400px" }}
    >
      <div
        ref={tiltRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={handleLeave}
        onMouseMove={handleMove}
        className="h-full will-change-transform"
        style={{
          transform:
            "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(0)",
          transformStyle: "preserve-3d",
          transition: hover
            ? "transform 80ms linear"
            : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
      <GlassEffect
        variant="strong"
        className="group relative h-full min-h-[680px] rounded-3xl flex flex-col p-10"
      >
        <span className="ares-bracket-tl" />
        <span className="ares-bracket-tr" />
        <span className="ares-bracket-bl" />
        <span className="ares-bracket-br" />

        {/* HEADER ROW */}
        <div className="flex items-center justify-between mb-12">
          <span className="font-mono text-[10px] tracking-[0.5em] text-white/45 uppercase">
            {s.code}
          </span>
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/65 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/75 backdrop-blur-md"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.10), 0 0 12px rgba(0,0,0,0.4)",
            }}
          >
            <span className="inline-block h-1 w-3 rounded-full bg-white/55" />
            {s.badgeLabel}
          </span>
        </div>

        {/* BIG INDEX */}
        <div className="font-display text-[9rem] leading-[0.8] font-light tracking-[-0.04em] text-white/95 mb-6">
          {s.index}
        </div>

        {/* TITLE */}
        <h3 className="font-display text-6xl font-bold leading-[0.95] tracking-tight text-white mb-3">
          {s.title}
          <span className="block mt-1 font-light tracking-[0.4em] text-base text-white/35">
            /SERIES
          </span>
        </h3>

        {/* TAGLINE */}
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/55 mb-7">
          {s.tagline}
        </p>

        <div className="h-px w-full bg-white/12 mb-7" />

        <p className="text-[15px] leading-relaxed text-white/65 mb-8">
          {s.description}
        </p>

        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/35 mb-4">
          {s.meta}
        </p>

        {/* MODULES */}
        <div className="mt-auto flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/40 mb-1">
            // Modules
          </p>
          {s.slots.map((slot, k) => (
            <div
              key={k}
              className="flex items-center justify-between gap-3 rounded-md border border-white/8 bg-black/45 px-3 py-2 backdrop-blur-md"
            >
              <span
                className={
                  slot.tone === "active"
                    ? "font-display text-sm font-semibold text-white"
                    : "font-display text-sm font-medium text-white/35"
                }
              >
                {slot.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/55">
                {slot.status}
              </span>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-8 pt-5 border-t border-white/8 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.4em] text-white/30">
          <span>// {s.code}</span>
          <span className="group-hover:text-white transition-colors">↗ ENTER</span>
        </div>
      </GlassEffect>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   PROJECTS SECTION — vertical cards, parallax title
   ───────────────────────────────────────────────────────── */
function ProjectsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const titleY = useTransform(scrollYProgress, [0, 1], [120, -120])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 1, 1, 0.4])

  return (
    <section
      ref={ref}
      className="relative py-36 px-4 overflow-hidden"
    >
      <div className="relative z-10 max-w-[1320px] mx-auto">
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="text-center mb-24"
        >
          <div className="font-mono text-[10px] tracking-[0.7em] uppercase text-white/30 mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-white/15" />
            <span>Index · 03 Series</span>
            <span className="h-px w-10 bg-white/15" />
          </div>
          <h2 className="ares-headline font-display text-7xl md:text-9xl font-bold tracking-[-0.04em] leading-[0.85]">
            THE PROJECTS
          </h2>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.5em] text-white/40">
            Three tiers · One mission · Absolute dominance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERIES.map((s, i) => (
            <SeriesCard key={s.index} s={s} i={i} />
          ))}
        </div>

        <div className="mt-24 flex flex-col items-center gap-4">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <p className="font-mono text-[10px] uppercase tracking-[0.6em] text-white/25">
            // END.OF.INDEX
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer className="relative border-t border-white/5 py-28 text-center px-4 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.6em] text-white/30 mb-10">
          <span className="h-px w-10 bg-white/15" />
          <span>Ares · AI Systems</span>
          <span className="h-px w-10 bg-white/15" />
        </div>
        <h3 className="ares-headline font-display text-7xl md:text-[12rem] font-bold tracking-[0.1em] mb-8 leading-none">
          ARES
        </h3>
        <p className="font-mono text-white/40 text-xs tracking-[0.5em] uppercase mb-16">
          Power is everything.
        </p>
        <GlassEffect
          variant="subtle"
          className="rounded-2xl grid grid-cols-3 max-w-2xl mx-auto gap-px mb-16 font-mono text-[10px] uppercase tracking-[0.3em]"
        >
          <div className="p-5">
            <div className="text-white/30 mb-1">// Series</div>
            <div className="text-white text-base">03 Tiers</div>
          </div>
          <div className="p-5 border-l border-white/8">
            <div className="text-white/30 mb-1">// Status</div>
            <div className="text-white text-base">Online</div>
          </div>
          <div className="p-5 border-l border-white/8">
            <div className="text-white/30 mb-1">// Mission</div>
            <div className="text-white text-base">Dominance</div>
          </div>
        </GlassEffect>
        <div className="w-12 h-px bg-white/10 mx-auto mb-6" />
        <p className="font-mono text-[10px] text-white/20 tracking-[0.4em] uppercase">
          © 2026 Ares AI · All Rights Reserved
        </p>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <main className="relative">
      <div className="relative z-10">
        <Hero />
        <MissionMarquee />
        <CoreSection />
        <div id="projects">
          <ProjectsSection />
        </div>
        <SiteFooter />
      </div>
    </main>
  )
}

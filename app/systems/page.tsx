"use client"

/**
 * /systems — deep-dive page. Each tier expands into a full panel with
 * benchmark-style spec rows, frosted glass, and parallax columns.
 * Inherits the global SiteBackdrop (mesh gradient + scrolling monolith).
 */

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { GlassEffect } from "@/components/ui/liquid-glass"

type SpecRow = { label: string; value: string }
type Panel = {
  index: string
  code: string
  title: string
  tagline: string
  status: string
  body: string
  specs: SpecRow[]
}

const PANELS: Panel[] = [
  {
    index: "01",
    code: "SERIES.001 / BRO",
    title: "The General",
    tagline: "Approachable mass · everyday intelligence",
    status: "In Development",
    body: "BRO is the gateway. Calibrated for warmth, broad coverage, and conversational fluency, while sharing the full Ares core for when the surface needs to hold real weight. Friendly to the user. Devastating to the workload.",
    specs: [
      { label: "Audience", value: "General" },
      { label: "Latency", value: "Sub-second" },
      { label: "Context", value: "Long-form" },
      { label: "Tone", value: "Warm · Direct" },
      { label: "Module", value: "Buddy · Active" },
    ],
  },
  {
    index: "02",
    code: "SERIES.002 / PRO",
    title: "The Industrial",
    tagline: "Heavy lift · long horizon · relentless",
    status: "Coming Soon",
    body: "PRO is built for tonnage. Long-horizon planning, deep tool use, deterministic recall under load, and the kind of stamina that turns a multi-day project into a single uninterrupted session. Performance measured in throughput, not theatrics.",
    specs: [
      { label: "Audience", value: "Professional" },
      { label: "Reasoning", value: "Deep / Multi-step" },
      { label: "Tool Use", value: "Native" },
      { label: "Stamina", value: "Continuous" },
      { label: "Status", value: "Soon" },
    ],
  },
  {
    index: "03",
    code: "SERIES.003 / SHOW",
    title: "The Pinnacle",
    tagline: "Theoretical maximum · uncompromising",
    status: "Coming Soon",
    body: "SHOW is a statement. The absolute ceiling — engineered without compromise, tuned to demonstrate what the architecture is capable of when nothing is held back. Not a daily driver. A demonstration of ceiling.",
    specs: [
      { label: "Audience", value: "Demonstration" },
      { label: "Ceiling", value: "Theoretical max" },
      { label: "Compromise", value: "None" },
      { label: "Cadence", value: "Selective" },
      { label: "Status", value: "Soon" },
    ],
  },
]

function PanelCard({ p, i }: { p: Panel; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const yL = useTransform(scrollYProgress, [0, 1], [80, -80])
  const yR = useTransform(scrollYProgress, [0, 1], [-50, 50])
  const o = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 1, 1, 0.4])

  const flip = i % 2 === 1

  return (
    <section ref={ref} className="relative py-32 px-4">
      <motion.div
        style={{ opacity: o }}
        className="relative max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center"
      >
        {/* Big numeral / title block */}
        <motion.div
          style={{ y: flip ? yR : yL }}
          className={"md:col-span-7 " + (flip ? "md:order-2" : "")}
        >
          <div className="font-mono text-[10px] tracking-[0.7em] uppercase text-white/35 mb-4 flex items-center gap-3">
            <span className="h-px w-10 bg-white/15" />
            <span>{p.code}</span>
          </div>
          <div className="font-display text-[12rem] leading-[0.78] font-light tracking-[-0.05em] text-white/95 mb-6">
            {p.index}
          </div>
          <h2 className="ares-headline font-display text-5xl md:text-7xl font-bold tracking-[-0.03em] leading-[0.95] mb-3">
            {p.title}
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/55 mb-7">
            {p.tagline}
          </p>
          <p className="text-base md:text-lg leading-relaxed text-white/65 max-w-xl">
            {p.body}
          </p>
        </motion.div>

        {/* Spec sheet card */}
        <motion.div
          style={{ y: flip ? yL : yR }}
          className={"md:col-span-5 " + (flip ? "md:order-1" : "")}
        >
          <GlassEffect
            variant="strong"
            className="relative rounded-3xl p-8"
          >
            <span className="ares-bracket-tl" />
            <span className="ares-bracket-tr" />
            <span className="ares-bracket-bl" />
            <span className="ares-bracket-br" />

            <div className="flex items-center justify-between mb-7">
              <span className="font-mono text-[10px] tracking-[0.5em] text-white/45 uppercase">
                Spec Sheet
              </span>
              {/* blackish chip */}
              <span
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/65 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/75 backdrop-blur-md"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.10), 0 0 12px rgba(0,0,0,0.4)",
                }}
              >
                <span className="inline-block h-1 w-3 rounded-full bg-white/55" />
                {p.status}
              </span>
            </div>

            <div className="flex flex-col">
              {p.specs.map((sp, k) => (
                <div
                  key={k}
                  className="flex items-center justify-between py-4 border-t border-white/8 first:border-t-0 font-mono text-[11px] uppercase tracking-[0.3em]"
                >
                  <span className="text-white/45">{sp.label}</span>
                  <span className="text-white">{sp.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-5 border-t border-white/8 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.4em] text-white/30">
              <span>// {p.code.toLowerCase()}</span>
              <span>↗ ENTER</span>
            </div>
          </GlassEffect>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default function SystemsPage() {
  return (
    <main className="relative">
      <div className="relative z-10">
        {/* PAGE HEADER */}
        <section className="relative pt-44 pb-24 px-4 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.6em] uppercase text-white/40">
              <span className="h-px w-10 bg-white/15" />
              <span>Page · 02 · Systems</span>
              <span className="h-px w-10 bg-white/15" />
            </div>
            <h1 className="ares-headline font-display text-6xl md:text-8xl font-bold leading-[0.92] tracking-[-0.035em] mb-7">
              The Systems
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-white/45 mb-6">
              Three tiers, examined
            </p>
            <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Each Ares series is forged from the same architectural core,
              tuned for a different domain of intent. Below: the spec sheet.
            </p>
          </div>
        </section>

        {/* PANELS */}
        {PANELS.map((p, i) => (
          <PanelCard key={p.index} p={p} i={i} />
        ))}

        {/* CLOSER */}
        <section className="relative py-32 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent mb-6" />
            <p className="font-mono text-[10px] uppercase tracking-[0.6em] text-white/35 mb-10">
              // END.OF.SPEC
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white/90 mb-5">
              One core. Three weights. Absolute reach.
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Whether you arrive through BRO, lean on PRO, or marvel at SHOW,
              you are touching the same Ares.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

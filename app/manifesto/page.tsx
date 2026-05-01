"use client"

/**
 * /manifesto — text-driven, atmospheric. Scroll-driven parallax on big
 * statements. Inherits the global SiteBackdrop.
 */

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { GlassEffect } from "@/components/ui/liquid-glass"

const TENETS = [
  {
    n: "I.",
    title: "Power is everything",
    body: "Capability is not a feature — it is the entire premise. Every model, every system, every tier exists to extend the boundary of what intelligence can deliver, then to deliver it without hesitation.",
  },
  {
    n: "II.",
    title: "Three tiers, one core",
    body: "BRO, PRO, SHOW are not three different products. They are one architecture, calibrated three ways. The same molten core, weighed differently — accessible, professional, theoretical.",
  },
  {
    n: "III.",
    title: "Weight before noise",
    body: "We do not ship for spectacle. Every output earns its place by carrying weight — by reasoning further, holding longer, deciding cleaner. Spectacle is what the surface looks like once the weight is real.",
  },
  {
    n: "IV.",
    title: "Restraint is a feature",
    body: "The hardest thing a powerful model can do is stop. We design for restraint: do less, when less is correct; do everything, when everything is asked.",
  },
  {
    n: "V.",
    title: "Engineered for dominance",
    body: "Dominance is not domination — it is the unbothered confidence of a system that has seen the question, knows the shape of the answer, and is already three steps into delivering it.",
  },
]

function TenetBlock({
  t,
  i,
}: {
  t: { n: string; title: string; body: string }
  i: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])
  const o = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 1, 1, 0.5])
  const flip = i % 2 === 1

  return (
    <section ref={ref} className="relative py-28 px-4">
      <motion.div
        style={{ opacity: o, y }}
        className={
          "relative max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-start " +
          (flip ? "md:[&>*:first-child]:order-2" : "")
        }
      >
        <div className="md:col-span-3">
          <div className="font-mono text-[10px] tracking-[0.6em] uppercase text-white/35 mb-3">
            Tenet · {String(i + 1).padStart(2, "0")}
          </div>
          <div className="font-display text-7xl md:text-8xl font-light leading-none tracking-tight text-white/90">
            {t.n}
          </div>
        </div>

        <div className="md:col-span-9">
          <GlassEffect variant="default" className="rounded-3xl p-10 relative">
            <span className="ares-bracket-tl" />
            <span className="ares-bracket-tr" />
            <span className="ares-bracket-bl" />
            <span className="ares-bracket-br" />

            <h3 className="font-display text-3xl md:text-5xl font-bold leading-tight tracking-tight text-white mb-5">
              {t.title}
            </h3>
            <p className="text-base md:text-lg text-white/65 leading-relaxed max-w-2xl">
              {t.body}
            </p>
          </GlassEffect>
        </div>
      </motion.div>
    </section>
  )
}

export default function ManifestoPage() {
  return (
    <main className="relative">
      <div className="relative z-10">
        {/* HEADER */}
        <section className="relative pt-44 pb-20 px-4 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.6em] uppercase text-white/40">
              <span className="h-px w-10 bg-white/15" />
              <span>Page · 03 · Manifesto</span>
              <span className="h-px w-10 bg-white/15" />
            </div>
            <h1 className="ares-headline font-display text-6xl md:text-8xl font-bold leading-[0.92] tracking-[-0.035em] mb-7">
              The Manifesto
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-white/45 mb-7">
              Five tenets · One conviction
            </p>
            <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              The principles Ares is built on. We do not iterate on these — we
              ship from them.
            </p>
          </div>
        </section>

        {/* TENETS */}
        {TENETS.map((t, i) => (
          <TenetBlock key={t.n} t={t} i={i} />
        ))}

        {/* CLOSING STATEMENT */}
        <section className="relative py-40 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8" />
            <h2 className="ares-headline font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-8">
              Power is everything.
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.5em] text-white/45">
              Everything else is logistics.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

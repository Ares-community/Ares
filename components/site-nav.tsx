"use client"

/**
 * SiteNav — frosted-glass top navigation, blackish chip-style.
 * Single sleek pill, refined typography, no blinking indicators.
 */

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { href: "/", label: "Index" },
  { href: "/systems", label: "Systems" },
  { href: "/manifesto", label: "Manifesto" },
]

export function SiteNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2 py-1.5 backdrop-blur-2xl"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(255,255,255,0.02), 0 24px 48px -20px rgba(0,0,0,0.7)",
        }}
      >
        <Link
          href="/"
          className="px-4 py-1.5 font-display text-[11px] font-bold tracking-[0.45em] text-white"
        >
          ARES
        </Link>
        <span className="h-4 w-px bg-white/10" />
        {items.map((it) => {
          const active = pathname === it.href
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                "rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.35em] transition-colors " +
                (active
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:text-white hover:bg-white/[0.04]")
              }
            >
              {it.label}
            </Link>
          )
        })}
        <span className="h-4 w-px bg-white/10" />
        <span className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
          v1.0
        </span>
      </div>
    </nav>
  )
}

"use client"

/**
 * GlassEffect — true frosted glass.
 *
 * Designed to match the iOS-style "ground glass" reference: brighter white
 * tint, generous blur, a clean inner highlight at the top edge, and a soft
 * 1px ring that brightens at the top-left and dims toward the bottom-right.
 *
 * Variants:
 *   subtle  — quiet panels (sidebars, status strips)
 *   default — main cards
 *   strong  — hero / centerpiece glass
 */

import React from "react"
import { cn } from "@/lib/utils"

interface GlassEffectProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  href?: string
  target?: string
  variant?: "default" | "subtle" | "strong"
}

interface DockIcon {
  src: string
  alt: string
  onClick?: () => void
}

const variantStyles: Record<
  NonNullable<GlassEffectProps["variant"]>,
  { tint: string; blur: string; border: string; shadow: string }
> = {
  subtle: {
    tint: "linear-gradient(155deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
    blur: "blur(28px) saturate(160%)",
    border: "rgba(255,255,255,0.10)",
    shadow:
      "inset 0 1px 0 rgba(255,255,255,0.14), 0 24px 48px -24px rgba(0,0,0,0.55)",
  },
  default: {
    tint: "linear-gradient(155deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.07) 100%)",
    blur: "blur(40px) saturate(180%)",
    border: "rgba(255,255,255,0.14)",
    shadow:
      "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.04), 0 30px 60px -20px rgba(0,0,0,0.55), 0 12px 28px -10px rgba(0,0,0,0.4)",
  },
  strong: {
    tint: "linear-gradient(155deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.10) 100%)",
    blur: "blur(48px) saturate(200%)",
    border: "rgba(255,255,255,0.18)",
    shadow:
      "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 0 0 1px rgba(255,255,255,0.06), 0 50px 100px -30px rgba(0,0,0,0.7), 0 16px 36px -12px rgba(0,0,0,0.5)",
  },
}

const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target = "_blank",
  variant = "default",
}) => {
  const v = variantStyles[variant]
  const glassStyle: React.CSSProperties = {
    background: v.tint,
    backdropFilter: v.blur,
    WebkitBackdropFilter: v.blur,
    boxShadow: v.shadow,
    borderColor: v.border,
    ...style,
  }

  const content = (
    <div
      className={cn(
        "relative overflow-hidden border transition-[transform,border-color,box-shadow] duration-700 ease-out",
        className,
      )}
      style={glassStyle}
    >
      {/* directional 1px gradient ring — brighter at top-left, fades to bottom-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          padding: "1px",
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.05) 100%)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {/* top sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )

  return href ? (
    <a href={href} target={target} rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  )
}

const GlassDock: React.FC<{ icons: DockIcon[]; href?: string }> = ({
  icons,
  href,
}) => (
  <GlassEffect className="flex flex-row gap-4 rounded-3xl p-4" href={href}>
    {icons.map((icon, idx) => (
      <div
        key={idx}
        className="flex items-center justify-center w-12 h-12 cursor-pointer hover:scale-110 transition-transform duration-200"
        onClick={icon.onClick}
      >
        <img src={icon.src} alt={icon.alt} className="w-8 h-8 object-contain" />
      </div>
    ))}
  </GlassEffect>
)

export { GlassEffect, GlassDock }
export type { GlassEffectProps, DockIcon }

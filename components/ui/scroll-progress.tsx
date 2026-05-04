"use client"

/**
 * ScrollProgress — thin glowing bar pinned to the top of the viewport that
 * fills as the page scrolls. Spring-eased so fast scrolls feel alive.
 */

import { motion, useScroll, useSpring } from "framer-motion"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left pointer-events-none"
      style={{
        scaleX,
        background:
          "linear-gradient(to right, rgba(160,180,255,0.85), rgba(255,255,255,1) 50%, rgba(255,160,200,0.85))",
        boxShadow:
          "0 0 14px rgba(180,200,255,0.7), 0 0 4px rgba(255,255,255,0.95)",
      }}
    />
  )
}

"use client"

/**
 * AmbientGradient — fixed, full-viewport WebGL mesh gradient.
 *
 * One canvas, a single full-screen quad, and a fragment shader that builds
 * a slowly-drifting "blob" gradient. This is the single cohesive background
 * the entire site sits on top of. Replaces the old wavy-line shader.
 *
 * Tuned dark and cool: deep navy → indigo → cyan → violet, with a soft
 * black vignette so glass cards have something rich to blur into.
 */

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function AmbientGradient({
  className = "",
}: {
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{ raf: number | null; cleanup: (() => void) | null }>({
    raf: null,
    cleanup: null,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      iScroll: { value: 0 },
    }

    const vertexShader = /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `

    /**
     * Five soft "blobs" of color drift through the screen. Each blob has its
     * own period, amplitude, and orbit shape, so the field never repeats
     * visually on any short loop. Final composite is darkened with a
     * radial vignette so frosted glass reads cleanly on top.
     */
    const fragmentShader = /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform float iScroll;

      // smooth blob falloff
      float blob(vec2 p, vec2 c, float r) {
        float d = length(p - c);
        return smoothstep(r, 0.0, d);
      }

      void main() {
        vec2 uv = vUv;
        float aspect = iResolution.x / iResolution.y;
        vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

        float t = iTime * 0.06 + iScroll * 0.15;

        // ── color palette (rich but moody)
        vec3 cIndigo = vec3(0.16, 0.13, 0.45);
        vec3 cViolet = vec3(0.45, 0.18, 0.55);
        vec3 cCyan   = vec3(0.10, 0.45, 0.55);
        vec3 cTeal   = vec3(0.05, 0.30, 0.40);
        vec3 cMag    = vec3(0.55, 0.18, 0.40);

        // ── blob orbits
        vec2 b1 = vec2(cos(t * 1.10) * 0.55,         sin(t * 0.90) * 0.35);
        vec2 b2 = vec2(sin(t * 0.80) * 0.45 + 0.15,  cos(t * 1.30) * 0.40);
        vec2 b3 = vec2(cos(t * 0.60) * 0.60 - 0.20,  sin(t * 1.10) * 0.30 - 0.10);
        vec2 b4 = vec2(sin(t * 1.40) * 0.40 - 0.10,  cos(t * 0.70) * 0.45 + 0.15);
        vec2 b5 = vec2(cos(t * 0.50) * 0.70,         sin(t * 0.40) * 0.55);

        float r1 = 0.9, r2 = 0.85, r3 = 1.0, r4 = 0.8, r5 = 1.1;

        vec3 col = vec3(0.02, 0.02, 0.04); // base near-black
        col += cIndigo * blob(p, b1, r1) * 0.85;
        col += cViolet * blob(p, b2, r2) * 0.70;
        col += cCyan   * blob(p, b3, r3) * 0.65;
        col += cTeal   * blob(p, b4, r4) * 0.55;
        col += cMag    * blob(p, b5, r5) * 0.45;

        // soften / lift mid-tones
        col = pow(col, vec3(0.92));

        // strong radial vignette so corners stay deep and glass reads
        float dist = length(p);
        float vignette = smoothstep(1.10, 0.20, dist);
        col *= mix(0.35, 1.0, vignette);

        // very faint film grain to kill banding
        float grain = fract(sin(dot(uv * iResolution, vec2(12.9898, 78.233))) * 43758.5453);
        col += (grain - 0.5) * 0.012;

        gl_FragColor = vec4(col, 1.0);
      }
    `

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    })
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    let scrollTarget = 0
    let scrollEased = 0

    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      uniforms.iResolution.value.set(w, h)
    }
    onResize()
    window.addEventListener("resize", onResize)

    const onScroll = () => {
      const max = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      )
      scrollTarget = window.scrollY / max
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    const t0 = performance.now()
    const tick = () => {
      const t = (performance.now() - t0) / 1000
      uniforms.iTime.value = t
      scrollEased += (scrollTarget - scrollEased) * 0.04
      uniforms.iScroll.value = scrollEased
      renderer.render(scene, camera)
      stateRef.current.raf = requestAnimationFrame(tick)
    }
    tick()

    stateRef.current.cleanup = () => {
      if (stateRef.current.raf !== null) cancelAnimationFrame(stateRef.current.raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
    return () => {
      stateRef.current.cleanup?.()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 h-full w-full ${className}`}
      style={{ display: "block" }}
    />
  )
}

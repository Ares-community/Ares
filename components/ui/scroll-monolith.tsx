"use client"

/**
 * ScrollMonolith — fixed full-viewport three.js scene that follows scroll.
 *
 * A central wireframe icosahedron core, an inner solid shell, an outer
 * faint ring of edges, and a slow-drifting starfield. The whole rig
 * translates and rotates as the user scrolls, so the "object" feels like
 * a continuous companion — present on the hero, drifting through the
 * projects, and resting in the footer. Inspired by igloo.inc.
 *
 * Design rules:
 *   • No blinks, no on/off pulsing — only continuous easing.
 *   • All motion is scroll-driven plus a gentle baseline drift.
 *   • Lights are static; emissive geometry carries the glow.
 *   • Sits behind content (z-index handled by the parent wrapper).
 */

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface ScrollMonolithProps {
  className?: string
}

export function ScrollMonolith({ className = "" }: ScrollMonolithProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{ raf: number | null; cleanup: (() => void) | null }>({
    raf: null,
    cleanup: null,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── renderer / scene / camera
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200)
    camera.position.set(0, 0, 7)

    // ── group for the whole rig (so we can pan it as one)
    const rig = new THREE.Group()
    scene.add(rig)

    // Inner glowing solid — a faceted sphere with subtle emissive
    const innerGeo = new THREE.IcosahedronGeometry(1.25, 1)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x0e0e18,
      metalness: 0.4,
      roughness: 0.55,
      emissive: 0x2a2a55,
      emissiveIntensity: 0.35,
      flatShading: true,
    })
    const inner = new THREE.Mesh(innerGeo, innerMat)
    rig.add(inner)

    // Wireframe shell
    const wireGeo = new THREE.IcosahedronGeometry(1.55, 2)
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
    })
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(wireGeo),
      wireMat,
    )
    rig.add(wire)

    // Outer ring of edges (faint, larger)
    const haloGeo = new THREE.IcosahedronGeometry(2.4, 1)
    const haloMat = new THREE.LineBasicMaterial({
      color: 0x9ec0ff,
      transparent: true,
      opacity: 0.18,
    })
    const halo = new THREE.LineSegments(
      new THREE.EdgesGeometry(haloGeo),
      haloMat,
    )
    rig.add(halo)

    // Equatorial torus ring — adds a "satellite" to the core
    const ringGeo = new THREE.TorusGeometry(2.9, 0.005, 8, 200)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2.4
    rig.add(ring)

    // ── starfield — drifting, not blinking
    const starCount = 700
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3 + 0] = (Math.random() - 0.5) * 80
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 60
      starPositions[i * 3 + 2] = -10 - Math.random() * 50
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3))

    // Soft round point sprite
    const tex = document.createElement("canvas")
    tex.width = tex.height = 64
    const ctx = tex.getContext("2d")!
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, "rgba(255,255,255,1)")
    grad.addColorStop(0.4, "rgba(255,255,255,0.45)")
    grad.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
    const sprite = new THREE.CanvasTexture(tex)

    const starMat = new THREE.PointsMaterial({
      size: 0.18,
      map: sprite,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.55,
      color: 0xffffff,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // ── lights (static)
    const key = new THREE.DirectionalLight(0xa6c8ff, 1.1)
    key.position.set(4, 5, 6)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xff7fbf, 0.45)
    rim.position.set(-5, -3, -4)
    scene.add(rim)
    scene.add(new THREE.AmbientLight(0x202036, 0.65))

    // ── responsive sizing
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    onResize()
    window.addEventListener("resize", onResize)

    // ── scroll-driven motion
    let scrollTarget = 0
    let scrollEased = 0
    const onScroll = () => {
      const max = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      )
      scrollTarget = window.scrollY / max
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    // ── mouse parallax (very subtle)
    let mouseX = 0,
      mouseY = 0,
      mxT = 0,
      myT = 0
    const onMouse = (e: MouseEvent) => {
      mxT = (e.clientX / window.innerWidth - 0.5) * 2
      myT = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener("mousemove", onMouse)

    const t0 = performance.now()
    const tick = () => {
      const t = (performance.now() - t0) / 1000

      // ease scroll & mouse
      scrollEased += (scrollTarget - scrollEased) * 0.05
      mouseX += (mxT - mouseX) * 0.04
      mouseY += (myT - mouseY) * 0.04

      // The rig "follows" scroll — translates upward and pushes deeper
      // as the user descends, then settles in the lower-right of view.
      // We blend three position keyframes via the eased scroll value.
      const s = scrollEased
      const px = -1.4 + s * 3.6 + mouseX * 0.25
      const py = 1.2 - s * 3.0 - mouseY * 0.18
      const pz = 0 - s * 2.5
      rig.position.set(px, py, pz)

      // continuous rotation, accelerated slightly by scroll
      const rotSpeed = 0.18 + s * 0.4
      rig.rotation.y = t * 0.12 * rotSpeed + mouseX * 0.4
      rig.rotation.x = t * 0.07 * rotSpeed + mouseY * 0.25
      ring.rotation.z = t * 0.25

      // halo counter-rotates for parallax feel
      halo.rotation.y = -t * 0.05
      halo.rotation.x = t * 0.04

      // gentle breathing scale, no on/off blink
      const breath = 1 + Math.sin(t * 0.5) * 0.012
      inner.scale.setScalar(breath)
      wire.scale.setScalar(breath)

      // starfield slowly drifts down
      stars.position.y = -((t * 0.4) % 60) + 30
      stars.rotation.z = t * 0.005

      renderer.render(scene, camera)
      stateRef.current.raf = requestAnimationFrame(tick)
    }
    tick()

    stateRef.current.cleanup = () => {
      if (stateRef.current.raf !== null) cancelAnimationFrame(stateRef.current.raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("mousemove", onMouse)
      renderer.dispose()
      innerGeo.dispose(); innerMat.dispose()
      wireGeo.dispose(); wireMat.dispose()
      haloGeo.dispose(); haloMat.dispose()
      ringGeo.dispose(); ringMat.dispose()
      starGeo.dispose(); starMat.dispose()
      sprite.dispose()
    }
    return () => {
      stateRef.current.cleanup?.()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 h-full w-full pointer-events-none ${className}`}
      style={{ display: "block" }}
    />
  )
}

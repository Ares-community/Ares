"use client"

/**
 * ParticleField — three.js drifting particle cloud, slow flow + scroll parallax.
 * Used as a full-section atmospheric backdrop layer.
 */

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface ParticleFieldProps {
  className?: string
  count?: number
  /** How much the particles drift with vertical scroll */
  scrollFactor?: number
}

export function ParticleField({
  className = "",
  count = 1500,
  scrollFactor = 0.0006,
}: ParticleFieldProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 200)
    camera.position.z = 30

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Particle geometry
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 80
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40
      sizes[i] = Math.random() * 1.4 + 0.2
      speeds[i] = Math.random() * 0.5 + 0.2
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    // Soft round point sprite
    const canvasTex = document.createElement("canvas")
    canvasTex.width = canvasTex.height = 64
    const ctx = canvasTex.getContext("2d")!
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, "rgba(255,255,255,1)")
    grad.addColorStop(0.4, "rgba(255,255,255,0.5)")
    grad.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
    const sprite = new THREE.CanvasTexture(canvasTex)

    const material = new THREE.PointsMaterial({
      size: 0.18,
      map: sprite,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.55,
      color: 0xffffff,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let raf: number | null = null
    let scrollOffset = 0
    const t0 = performance.now()

    const onScroll = () => {
      scrollOffset = window.scrollY * scrollFactor
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(mount)

    const tick = () => {
      const t = (performance.now() - t0) / 1000
      const pos = geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < count; i++) {
        // very slow drift on Y, looping
        const idx = i * 3 + 1
        let y = positions[idx] + Math.sin(t * 0.05 * speeds[i] + i) * 0.01
        y += scrollOffset * speeds[i]
        // wrap softly
        if (y > 30) y = -30
        if (y < -30) y = 30
        pos.array[idx] = y
      }
      pos.needsUpdate = true

      points.rotation.y = t * 0.01
      camera.position.x = Math.sin(t * 0.03) * 1.2
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      if (raf !== null) cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      ro.disconnect()
      mount.removeChild(renderer.domElement)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      sprite.dispose()
    }
  }, [count, scrollFactor])

  return <div ref={mountRef} className={className} />
}

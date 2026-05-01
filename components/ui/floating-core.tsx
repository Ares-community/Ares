"use client"

/**
 * FloatingCore — three.js wireframe icosahedron with mouse-parallax,
 * inner glow, slow auto-rotation, and a halo. Used as a hero centerpiece.
 *
 * Design intent: a pristine, monumental object that feels like a
 * gravitational core. Pure white wires on a tint of cool light, with a
 * faint inner solid for depth and a soft halo ring to imply mass.
 */

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface FloatingCoreProps {
  className?: string
  /** Detail of the icosahedron (1–4). Higher = denser wireframe. */
  detail?: number
  /** Rotation speed multiplier */
  speed?: number
}

export function FloatingCore({
  className = "",
  detail = 2,
  speed = 1,
}: FloatingCoreProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{
    raf: number | null
    cleanup: (() => void) | null
  }>({ raf: null, cleanup: null })

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 5)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Inner solid for depth (very dark, slight reflection)
    const innerGeo = new THREE.IcosahedronGeometry(1.45, detail)
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x0a0a0a,
      shininess: 80,
      specular: 0xffffff,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    })
    const innerMesh = new THREE.Mesh(innerGeo, innerMat)
    scene.add(innerMesh)

    // ── Wireframe shell
    const wireGeo = new THREE.IcosahedronGeometry(1.6, detail)
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    })
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(wireGeo),
      wireMat,
    )
    scene.add(wire)

    // ── Outer halo — large faintly glowing sphere shell
    const haloGeo = new THREE.IcosahedronGeometry(2.3, 1)
    const haloMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
    })
    const halo = new THREE.LineSegments(
      new THREE.EdgesGeometry(haloGeo),
      haloMat,
    )
    scene.add(halo)

    // ── Lights — cool key + warm rim
    const key = new THREE.DirectionalLight(0xffffff, 0.9)
    key.position.set(5, 4, 6)
    scene.add(key)

    const rim = new THREE.DirectionalLight(0xff66aa, 0.3)
    rim.position.set(-5, -3, -4)
    scene.add(rim)

    const ambient = new THREE.AmbientLight(0x202030, 0.6)
    scene.add(ambient)

    // ── Animation state
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0
    const t0 = performance.now()

    const onMouseMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect()
      // Use viewport-centered mouse so halo tracks even when card is offscreen
      targetX = ((e.clientX - r.left - r.width / 2) / r.width) * 2
      targetY = ((e.clientY - r.top - r.height / 2) / r.height) * 2
    }
    window.addEventListener("mousemove", onMouseMove)

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

      // smooth mouse follow
      mouseX += (targetX - mouseX) * 0.04
      mouseY += (targetY - mouseY) * 0.04

      // auto-rotation
      const baseRotY = t * 0.15 * speed
      const baseRotX = t * 0.08 * speed

      innerMesh.rotation.y = baseRotY + mouseX * 0.4
      innerMesh.rotation.x = baseRotX + mouseY * 0.25
      wire.rotation.y = baseRotY * 1.05 + mouseX * 0.5
      wire.rotation.x = baseRotX * 1.1 + mouseY * 0.3
      halo.rotation.y = -baseRotY * 0.4 - mouseX * 0.3
      halo.rotation.x = baseRotX * 0.6 + mouseY * 0.15

      // gentle breathing scale
      const breath = 1 + Math.sin(t * 0.6) * 0.015
      innerMesh.scale.setScalar(breath)
      wire.scale.setScalar(breath)

      renderer.render(scene, camera)
      stateRef.current.raf = requestAnimationFrame(tick)
    }
    tick()

    stateRef.current.cleanup = () => {
      if (stateRef.current.raf !== null) cancelAnimationFrame(stateRef.current.raf)
      window.removeEventListener("mousemove", onMouseMove)
      ro.disconnect()
      mount.removeChild(renderer.domElement)
      renderer.dispose()
      innerGeo.dispose()
      wireGeo.dispose()
      haloGeo.dispose()
      innerMat.dispose()
      wireMat.dispose()
      haloMat.dispose()
    }
    return () => {
      stateRef.current.cleanup?.()
    }
  }, [detail, speed])

  return <div ref={mountRef} className={className} />
}

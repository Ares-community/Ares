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
 * When scroll reaches the end, the rig detonates: every face of the inner
 * icosahedron becomes an independent shard flying outward with random
 * spin, a bright burst expands at the core, the screen flashes white,
 * then the page navigates to `redirectUrl`.
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
  redirectUrl?: string
}

export function ScrollMonolith({
  className = "",
  redirectUrl = "https://ayaan-agrawal.netlify.app/",
}: ScrollMonolithProps) {
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
    onScroll()

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

    // ── explosion state
    let exploding = false
    let explodeStart = 0
    let redirected = false
    type Shard = {
      mesh: THREE.Mesh
      mat: THREE.MeshStandardMaterial
      vel: THREE.Vector3
      spin: THREE.Vector3
    }
    const shards: Shard[] = []
    let burst: THREE.Mesh | null = null
    let burstMat: THREE.MeshBasicMaterial | null = null
    let shockwave: THREE.Mesh | null = null
    let shockwaveMat: THREE.MeshBasicMaterial | null = null
    const frozenPos = new THREE.Vector3()
    const frozenRot = new THREE.Euler()

    const detonate = () => {
      if (exploding) return
      exploding = true
      explodeStart = performance.now()

      frozenPos.copy(rig.position)
      frozenRot.copy(rig.rotation)

      // Hide originals — shards take their place
      inner.visible = false
      wire.visible = false
      halo.visible = false
      ring.visible = false

      // Build shards from inner icosahedron faces
      const posAttr = innerGeo.attributes.position as THREE.BufferAttribute
      const indexAttr = innerGeo.index
      const triCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3
      const innerScale = 1.25 // matches the geometry radius / inner mesh

      for (let i = 0; i < triCount; i++) {
        const ia = indexAttr ? indexAttr.getX(i * 3 + 0) : i * 3 + 0
        const ib = indexAttr ? indexAttr.getX(i * 3 + 1) : i * 3 + 1
        const ic = indexAttr ? indexAttr.getX(i * 3 + 2) : i * 3 + 2

        const pa = new THREE.Vector3().fromBufferAttribute(posAttr, ia)
        const pb = new THREE.Vector3().fromBufferAttribute(posAttr, ib)
        const pc = new THREE.Vector3().fromBufferAttribute(posAttr, ic)
        const center = pa.clone().add(pb).add(pc).divideScalar(3)

        const triGeo = new THREE.BufferGeometry()
        triGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array([
              pa.x - center.x, pa.y - center.y, pa.z - center.z,
              pb.x - center.x, pb.y - center.y, pb.z - center.z,
              pc.x - center.x, pc.y - center.y, pc.z - center.z,
            ]),
            3,
          ),
        )
        triGeo.computeVertexNormals()

        const triMat = new THREE.MeshStandardMaterial({
          color: 0xc0cfff,
          emissive: 0x4a6ad4,
          emissiveIntensity: 1.6,
          metalness: 0.55,
          roughness: 0.4,
          transparent: true,
          opacity: 1,
          side: THREE.DoubleSide,
          flatShading: true,
        })

        const triMesh = new THREE.Mesh(triGeo, triMat)
        triMesh.position.copy(center)
        rig.add(triMesh)

        const dir = center.clone().normalize().add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
          ),
        ).normalize()

        const speed = 3.2 + Math.random() * 4.2
        shards.push({
          mesh: triMesh,
          mat: triMat,
          vel: dir.multiplyScalar(speed),
          spin: new THREE.Vector3(
            (Math.random() - 0.5) * 14,
            (Math.random() - 0.5) * 14,
            (Math.random() - 0.5) * 14,
          ),
        })
      }
      void innerScale

      // Central blinding burst
      const burstGeo = new THREE.SphereGeometry(0.35, 32, 32)
      burstMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      burst = new THREE.Mesh(burstGeo, burstMat)
      rig.add(burst)

      // Expanding shockwave ring
      const shockGeo = new THREE.RingGeometry(0.3, 0.42, 64)
      shockwaveMat = new THREE.MeshBasicMaterial({
        color: 0xb0c8ff,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      shockwave = new THREE.Mesh(shockGeo, shockwaveMat)
      // Face the camera
      shockwave.lookAt(camera.position.clone().sub(rig.position))
      rig.add(shockwave)

      // Navigate immediately — the in-canvas burst keeps playing during
      // the browser's natural fetch+parse latency for the destination.
      if (!redirected) {
        redirected = true
        window.location.href = redirectUrl
      }
    }

    const t0 = performance.now()
    let prev = t0
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      const t = (now - t0) / 1000

      if (!exploding) {
        // ease scroll & mouse
        scrollEased += (scrollTarget - scrollEased) * 0.05
        mouseX += (mxT - mouseX) * 0.04
        mouseY += (myT - mouseY) * 0.04

        const s = scrollEased
        const px = -1.4 + s * 3.6 + mouseX * 0.25
        const py = 1.2 - s * 3.0 - mouseY * 0.18
        const pz = 0 - s * 2.5
        rig.position.set(px, py, pz)

        const rotSpeed = 0.18 + s * 0.4
        rig.rotation.y = t * 0.12 * rotSpeed + mouseX * 0.4
        rig.rotation.x = t * 0.07 * rotSpeed + mouseY * 0.25
        ring.rotation.z = t * 0.25

        halo.rotation.y = -t * 0.05
        halo.rotation.x = t * 0.04

        const breath = 1 + Math.sin(t * 0.5) * 0.012
        inner.scale.setScalar(breath)
        wire.scale.setScalar(breath)

        // Trigger explosion when the rig has completed its scroll journey
        if (scrollTarget > 0.985) detonate()
      } else {
        // Freeze the rig at its detonation pose so shards fly from the
        // exact spot the user last saw the shape.
        rig.position.copy(frozenPos)
        rig.rotation.copy(frozenRot)

        const elapsed = (now - explodeStart) / 1000

        for (const s of shards) {
          s.mesh.position.x += s.vel.x * dt
          s.mesh.position.y += s.vel.y * dt
          s.mesh.position.z += s.vel.z * dt
          s.vel.multiplyScalar(0.985)
          s.mesh.rotation.x += s.spin.x * dt
          s.mesh.rotation.y += s.spin.y * dt
          s.mesh.rotation.z += s.spin.z * dt
          const k = Math.max(0, 1 - elapsed / 1.5)
          s.mat.opacity = k
          s.mat.emissiveIntensity = 1.6 * k
        }

        if (burst && burstMat) {
          const sc = 1 + elapsed * 22
          burst.scale.setScalar(sc)
          burstMat.opacity = Math.max(0, 1 - elapsed / 0.45)
        }

        if (shockwave && shockwaveMat) {
          const sc = 1 + elapsed * 14
          shockwave.scale.setScalar(sc)
          shockwaveMat.opacity = Math.max(0, 0.9 - elapsed / 0.7)
        }
      }

      // starfield slowly drifts down (continues during explosion)
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
      for (const s of shards) {
        s.mesh.geometry.dispose()
        s.mat.dispose()
      }
      if (burst) burst.geometry.dispose()
      burstMat?.dispose()
      if (shockwave) shockwave.geometry.dispose()
      shockwaveMat?.dispose()
    }
    return () => {
      stateRef.current.cleanup?.()
    }
  }, [redirectUrl])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 h-full w-full pointer-events-none ${className}`}
      style={{ display: "block" }}
    />
  )
}

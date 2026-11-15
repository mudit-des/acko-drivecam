import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { asset } from '../asset'
import { Accordion, AccordionItem } from '@acko/accordion'
import { Button } from '@acko/button'
import { TextInput } from '@acko/text-input'
import { Typography } from '@acko/typography'
import { CircleCheck } from 'lucide-react'

// Sizes and weights measured from the approved reference page (mobile, then md+).
const H_HERO = 'text-[32px]! leading-[38px]! tracking-[-0.96px]! font-medium! md:text-[44px]! md:leading-[48px]! xl:text-[52px]! xl:leading-[56px]! xl:tracking-[-1.2px]!'
const H_XL = 'text-[32px]! leading-[40px]! tracking-[-0.96px]! font-medium! md:text-[48px]! md:leading-[60px]!'
const H_LG = 'text-[28px]! leading-[35px]! tracking-[-0.6px]! font-medium! md:text-[40px]! md:leading-[50px]!'
const H_CARD = 'text-[20px]! leading-[28px]! tracking-[-0.1px]! font-medium!'
// Section headlines share one size (the statement is the only larger one).
const H_SECTION = 'text-[32px]! leading-[1.12]! tracking-[-0.03em]! font-light! md:text-[44px]! xl:text-[52px]!'
const LIGHT = 'font-normal! md:font-light!'

const numbers = [
  { to: 1440, suffix: 'p', label: 'QUAD HD VIDEO' },
  { to: 156, suffix: '°', label: 'WIDE-ANGLE VIEW' },
  { to: 512, suffix: 'GB', label: 'MAX STORAGE' },
]

const faqs = [
  { q: 'What is ACKO DriveCam?', a: 'DriveCam is ACKO’s dashcam. It records every drive to your microSD card and locks the footage the moment it senses an impact. It comes with ACKO car insurance.' },
  { q: 'Do I pay extra for DriveCam?', a: 'No. DriveCam comes with the insurance. You only need to buy a microSD card separately, and you can optionally pay a small fee for professional installation.' },
  { q: 'When does it launch?', a: 'DriveCam with ACKO car insurance is launching soon and will open to eligible customers in phases. Check your eligibility above, and we will message you the moment it goes live.' },
  { q: 'How does early access work?', a: 'Enter your car’s registration number, mobile number and pincode. We check whether your car is eligible and message you the moment DriveCam is ready for it.' },
  { q: 'Can ACKO or anyone else see my footage?', a: 'No. Recordings stay on your microSD card and under your control. ACKO cannot access them. You share a clip only if you choose to.' },
  { q: 'Does it include a microSD card?', a: 'No. DriveCam records non-stop, so it needs a high-endurance microSD card (Class 10, U3, V30, up to 512GB). Our DriveCam page lists recommended cards.' },
  { q: 'Why might my car not be eligible yet?', a: 'DriveCam is launching for the first time, so we are making it available to more customers gradually. If your car is not eligible today, we will save your details and message you first when it opens up.' },
  { q: 'What does DriveCam record?', a: 'DriveCam records in 1440p Quad HD with a 156° wide-angle view and clear low-light and night recording. A built-in collision sensor locks the footage automatically when it detects an impact. It supports microSD cards up to 512GB.' },
  { q: 'How do I install DriveCam?', a: 'Once your policy is issued, DriveCam is shipped by Ekart and usually arrives in 48 to 72 hours. You can track it in the ACKO app. After delivery, tap Set Up in the app. Installing it yourself takes about 15 minutes, or you can book Ready Assist to have it professionally installed for a small fee.' },
  { q: 'Can I turn off the camera or microphone?', a: 'Yes. You can switch off both the dashcam and its microphone manually at any time. You can also browse, overwrite or delete videos on the microSD card whenever you like.' },
  { q: 'Does DriveCam need the internet?', a: 'No. DriveCam records to the microSD card without the internet. Your phone connects to it over Wi-Fi, so you can browse, clip and download videos of up to 10 minutes in the ACKO app. You need to be within Wi-Fi range of the camera to control it.' },
  { q: 'What happens to DriveCam if I do not renew my policy?', a: 'DriveCam keeps recording and the footage on your microSD card stays accessible. App access remains available only while you have an active ACKO policy.' },
  { q: 'Is DriveCam covered if it is damaged in an accident?', a: 'No. The insurance policy covers vehicle-related damage only, so DriveCam is not repaired or replaced under the policy. The device itself carries a 1-year warranty, excluding normal wear and tear.' },
  { q: 'How do I get help with DriveCam?', a: 'Write to hello@acko.com or call 1800-2662-256.' },
]

function AckoLogo({ textFill = '#28205f' }) {
  return (
    <svg viewBox="0 0 527.58 126.62" role="img" aria-label="ACKO" className="block h-24 w-[100px] shrink-0">
      <path fill={textFill} d="M225.37,21.1h22.24l35.44,84.42h-24.74l-6.07-14.97h-32.11l-5.95,14.97h-24.26l35.44-84.42ZM245.59,72.47l-9.28-23.83-9.39,23.83h18.67Z" />
      <path fill={textFill} d="M277.56,63.55v-.24c0-24.26,18.67-43.29,43.88-43.29,17.01,0,27.95,7.14,35.32,17.36l-17.36,13.44c-4.76-5.95-10.23-9.75-18.2-9.75-11.65,0-19.86,9.87-19.86,22v.24c0,12.49,8.21,22.24,19.86,22.24,8.68,0,13.8-4.04,18.79-10.11l17.36,12.37c-7.85,10.82-18.43,18.79-36.87,18.79-23.78,0-42.93-18.2-42.93-43.05Z" />
      <path fill={textFill} d="M364.6,21.1h23.07v34.25l28.66-34.25h27.35l-31.51,36.3,32.59,48.12h-27.71l-20.93-31.35-8.44,9.53v21.83h-23.07V21.1Z" />
      <path fill={textFill} d="M437.91,63.55v-.24c0-23.9,19.27-43.29,44.95-43.29s44.72,19.15,44.72,43.05v.24c0,23.91-19.27,43.29-44.95,43.29s-44.72-19.15-44.72-43.05ZM504.03,63.55v-.24c0-12.01-8.68-22.48-21.41-22.48s-21.05,10.23-21.05,22.24v.24c0,12.01,8.68,22.48,21.29,22.48s21.17-10.23,21.17-22.24Z" />
      <path fill="#4e29bb" d="M168.83,44.06v38.35c0,2.94-1.37,5.49-4.14,7.25-34.68,22-60.94,31.24-70.12,33.81-12.67,3.55-19.38,3.18-20.48,3.1-23.13-1.62-62.1-32.45-62.1-32.45,0,0,31.79,7.52,105.26-26.34,13.77-6.35,29.15-13.2,47.02-21.22,0,0,3.9-1.63,4.56-2.5Z" />
      <path fill="#926ff3" d="M166.79,42.99c.44-.27,1.03-.64,1.23-1.37.18-.66.1-1.48-.27-2.07-.68-1.08-1.81-1.8-3.06-2.59C130.01,14.97,103.75,5.72,94.56,3.15,81.89-.4,75.18-.03,74.09.05,50.96,1.67,11.99,32.5,11.99,32.5c0,0,31.79-7.52,105.26,26.34,2.36,1.09,4.78,2.19,7.24,3.32l40.13-18.02s1.48-.71,2.17-1.14Z" />
      <path fill="#b59cf5" d="M49.22,63.28c.04-8.18,1.1-16.37,3.04-24.46,0,0,.26-1.01.26-1.01-14.47-3.3-25.13-3.99-31.54-3.99-5.29,0-8.09.46-9.05.66-1.72.37-2.94,1.69-3.81,2.81C2.96,43.94,0,53.41,0,63.28H0c0,9.87,2.96,19.34,8.13,25.98.87,1.11,2.08,2.44,3.81,2.81.96.2,3.76.66,9.05.66,6.4,0,17.07-.69,31.54-3.99,0,0-.26-1.01-.26-1.01-1.94-8.09-3-16.28-3.04-24.46Z" />
    </svg>
  )
}

function Eyebrow({ children, onDark }) {
  return <Typography textStyle="label-md-semibold" className={onDark ? 'text-text-static-light/70!' : 'text-text-brand-default!'}>{children}</Typography>
}

const clamp = (n) => Math.min(1, Math.max(0, n))
const seg = (p, from, to) => clamp((p - from) / (to - from))

const introLines = [
  [{ w: 'Introducing', light: true }, { w: 'the', light: true }],
  [{ w: 'ACKO' }, { w: 'DriveCam.' }],
]

const INTRO_SIZE = 'text-[44px]! leading-[46px]! tracking-[-1.8px]! md:text-[88px]! md:leading-[90px]! md:tracking-[-3.5px]! xl:text-[120px]! xl:leading-[120px]! xl:tracking-[-5px]!'

const FRAME_COUNT = 172
const frameSrc = (i) => asset(`/drivecam/frames/hero-alpha/f${String(i + 1).padStart(4, '0')}.webp`)
const FRAMES_BEHIND = 24
const FRAMES_AHEAD = 80
const ease = (t) => t * t * (3 - 2 * t)
const sm = (p, from, to) => ease(seg(p, from, to))

// Static mode: the Figma export (automation) and reduced motion get finished layouts with no animation.
const isStaticMode = () => typeof window !== 'undefined' && (navigator.webdriver || window.matchMedia('(prefers-reduced-motion: reduce)').matches)

// One shared scroll driver for every scroll-linked section below the film. It keeps a single eased scroll value
// and tells each registered scene where it is, so sections move forwards and backwards with the page.
const docTopOf = (el) => {
  let y = 0
  let node = el
  while (node) {
    y += node.offsetTop
    node = node.offsetParent
  }
  return y
}
const scenes = new Set()
const driver = { y: 0, target: 0, raf: 0, ro: null }
const measureScene = (scene) => {
  scene.docTop = docTopOf(scene.el)
  scene.h = scene.el.offsetHeight
}
const runScenes = () => {
  const vh = window.innerHeight
  scenes.forEach((scene) => scene.apply(scene.docTop - driver.y, scene.h, vh))
}
const driverTick = () => {
  driver.raf = 0
  const diff = driver.target - driver.y
  if (Math.abs(diff) < 0.4) driver.y = driver.target
  else driver.y += diff * 0.2
  runScenes()
  if (driver.y !== driver.target) driver.raf = window.requestAnimationFrame(driverTick)
}
const onDriverScroll = () => {
  driver.target = window.scrollY
  if (!driver.raf) driver.raf = window.requestAnimationFrame(driverTick)
}
const onDriverResize = () => {
  scenes.forEach(measureScene)
  onDriverScroll()
  runScenes()
}
function registerScene(el, apply) {
  const scene = { el, apply, docTop: 0, h: 0 }
  scenes.add(scene)
  measureScene(scene)
  if (scenes.size === 1) {
    driver.y = window.scrollY
    driver.target = window.scrollY
    window.addEventListener('scroll', onDriverScroll, { passive: true })
    window.addEventListener('resize', onDriverResize)
    driver.ro = new ResizeObserver(() => {
      scenes.forEach(measureScene)
      runScenes()
    })
    driver.ro.observe(document.body)
  }
  apply(scene.docTop - driver.y, scene.h, window.innerHeight)
  return () => {
    scenes.delete(scene)
    if (scenes.size === 0) {
      window.cancelAnimationFrame(driver.raf)
      driver.raf = 0
      window.removeEventListener('scroll', onDriverScroll)
      window.removeEventListener('resize', onDriverResize)
      if (driver.ro) driver.ro.disconnect()
    }
  }
}

function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [shown, setShown] = useState(isStaticMode)
  useEffect(() => {
    if (shown) return undefined
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true)
        observer.disconnect()
      }
    }, { threshold })
    observer.observe(el)
    return () => observer.disconnect()
  }, [shown, threshold])
  return [ref, shown]
}

// Rises and fades in once, the first time it scrolls into view.
function Reveal({ children, className = '', delay = 0, distance = 28 }) {
  const [ref, shown] = useInView(0.15)
  return (
    <div
      ref={ref}
      className={`${className} transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none`}
      style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : `translateY(${distance}px)`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

const NUMBER_SIZE = 'text-[48px]! leading-[1]! tracking-[-0.045em]! font-medium! tabular-nums md:text-[84px]! xl:text-[108px]!'

// Counts up from 0 each time it scrolls into view and resets when it leaves. Static mode shows the final value.
function CountUp({ to, suffix, delay = 0 }) {
  const ref = useRef(null)
  const staticMode = isStaticMode()
  useEffect(() => {
    const el = ref.current
    if (staticMode || !el) return undefined
    let raf = 0
    let timer = 0
    const run = () => {
      let t0 = 0
      const step = (now) => {
        if (!t0) t0 = now
        const p = Math.min(1, (now - t0) / 1400)
        el.textContent = `${Math.round(to * (1 - (1 - p) ** 3))}${suffix}`
        if (p < 1) raf = window.requestAnimationFrame(step)
      }
      raf = window.requestAnimationFrame(step)
    }
    const observer = new IntersectionObserver(([entry]) => {
      window.cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      if (entry.isIntersecting) timer = window.setTimeout(run, delay)
      else el.textContent = `0${suffix}`
    }, { threshold: 0.6 })
    el.textContent = `0${suffix}`
    observer.observe(el)
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(raf)
      window.clearTimeout(timer)
    }
  }, [to, suffix, delay, staticMode])
  return <span ref={ref}>{`${to}${suffix}`}</span>
}

function Ambassador({ label, className, delay, image }) {
  const [ref, shown] = useInView(0.1)
  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className={`${className} transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none`}
      style={{ backgroundImage: image ? `url(${image})` : undefined, opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(14%)', transitionDelay: `${delay}ms` }}
    />
  )
}

// A feature row that is exactly one screen tall, with no pinning and no extra scrolling. The media column fills the row's
// full height. The square device clip fills it and is cropped at the sides; the landscape phone clips are shown whole
// (fitted to the column) so the phone frame is never cut. The copy sits on the other side. Its entrance follows scroll position as the row arrives: the media fades and settles, then
// the label, headline and copy rise. The video is a normal video that plays once by itself when the row is mostly in
// view, and is not tied to scroll. The white in all three clips is removed with a multiply blend against the band colour
// (the media box carries the band colour so the blend always has something to mix with).
// Opening: black intro words, then the DriveCam film plays frame by frame as you scroll (forwards and backwards).
// Smoothness: scroll position is eased, neighbouring frames are cross-faded (so 15 fps reads as continuous), and
// all drawing happens straight on the canvas and layer styles, not through React renders. Frames near the current
// position stay decoded; the rest are fetched in idle time so a fast scroll never waits on the network.
function FilmIntro() {
  const trackRef = useRef(null)
  const canvasRef = useRef(null)
  const filmRef = useRef(null)
  const filmBoxRef = useRef(null)
  const backdropRef = useRef(null)
  const introTextRef = useRef(null)
  const cueRef = useRef(null)
  const haloRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [staticMode] = useState(isStaticMode)

  useEffect(() => {
    if (staticMode) return undefined
    const cache = new Map()
    const last = { i0: -1, a: -1, center: -999 }
    let shown = 0
    let target = 0
    let raf = 0
    let cancelled = false

    const loaded = (i) => {
      const img = cache.get(i)
      return img && img.complete && img.naturalWidth ? img : null
    }
    const nearest = (i) => {
      for (let d = 0; d <= 40; d += 1) {
        const behind = loaded(i - d)
        if (behind) return behind
        const ahead = loaded(i + d)
        if (ahead) return ahead
      }
      return null
    }
    const ensure = (i) => {
      if (i < 0 || i >= FRAME_COUNT || cache.has(i)) return
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        last.i0 = -1
        drawFrame(shown)
      }
      img.src = frameSrc(i)
      cache.set(i, img)
    }

    const drawFrame = (p) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const pos = seg(p, 0.2, 0.92) * (FRAME_COUNT - 1)
      const i0 = Math.min(FRAME_COUNT - 2, Math.floor(pos))
      const a = pos - i0
      if (Math.abs(i0 - last.center) > 6) {
        last.center = i0
        for (let i = i0; i <= i0 + FRAMES_AHEAD; i += 1) ensure(i)
        for (let i = i0 - 1; i >= i0 - FRAMES_BEHIND; i -= 1) ensure(i)
        cache.forEach((img, key) => {
          if (key < i0 - FRAMES_BEHIND - 8 || key > i0 + FRAMES_AHEAD + 8) {
            img.onload = null
            img.src = ''
            cache.delete(key)
          }
        })
      }
      if (i0 === last.i0 && Math.abs(a - last.a) < 0.015) return
      const base = nearest(i0)
      if (!base) return
      last.i0 = i0
      last.a = a
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height)
      const top = loaded(i0 + 1)
      if (top && a > 0.02) {
        ctx.globalAlpha = a
        ctx.drawImage(top, 0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1
      }
    }

    const apply = (p) => {
      const lift = sm(p, 0.01, 0.17)
      if (introTextRef.current) {
        introTextRef.current.style.opacity = String(1 - sm(p, 0.01, 0.13))
        introTextRef.current.style.transform = `translateY(${-lift * 70}px) scale(${1 - lift * 0.08})`
      }
      if (backdropRef.current) backdropRef.current.style.opacity = String(1 - sm(p, 0.06, 0.24))
      // Near the end the camera shrinks away and drifts up until it is gone, as if the page is taking over.
      const away = sm(p, 0.5, 0.76)
      if (filmRef.current) filmRef.current.style.opacity = String(sm(p, 0.06, 0.24) * (1 - away))
      if (filmBoxRef.current) filmBoxRef.current.style.transform = `scale(${(0.94 + 0.06 * sm(p, 0.06, 0.32)) * (1 - 0.97 * away)})`
      if (cueRef.current) cueRef.current.style.opacity = String(1 - sm(p, 0, 0.06))
      if (haloRef.current) haloRef.current.style.opacity = String(sm(p, 0.04, 0.2) * (1 - sm(p, 0.36, 0.56)))
      drawFrame(p)
    }

    const tick = () => {
      raf = 0
      const diff = target - shown
      if (Math.abs(diff) < 0.0002) {
        shown = target
        apply(shown)
        return
      }
      shown += diff * 0.12
      apply(shown)
      raf = window.requestAnimationFrame(tick)
    }
    const measure = (instant) => {
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const max = rect.height - window.innerHeight
      target = max > 0 ? clamp(-rect.top / max) : 1
      if (instant) {
        shown = target
        apply(shown)
      }
      if (!raf) raf = window.requestAnimationFrame(tick)
    }
    const onScroll = () => measure(false)

    // Hold the intro words until the brand font is ready, so they never flash in a fallback font first.
    const reveal = () => { if (!cancelled) setMounted(true) }
    const fontsReady = document.fonts && document.fonts.load
      ? Promise.all([document.fonts.load('300 48px "Euclid Circular B"'), document.fonts.load('600 48px "Euclid Circular B"')])
      : Promise.resolve()
    const t = window.setTimeout(reveal, 2500)
    fontsReady.then(() => { window.clearTimeout(t); window.setTimeout(reveal, 60) }, reveal)
    for (let i = 0; i <= FRAMES_AHEAD; i += 1) ensure(i)
    measure(true)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    // Warm the browser cache with every frame (about 5 MB) once the page is idle, unless data saver is on.
    const warm = async () => {
      if (navigator.connection && navigator.connection.saveData) return
      for (let i = FRAMES_AHEAD; i < FRAME_COUNT && !cancelled; i += 6) {
        await Promise.all(Array.from({ length: 6 }, (_, k) => (i + k < FRAME_COUNT ? fetch(frameSrc(i + k)).catch(() => null) : null)))
        await new Promise((resolve) => window.setTimeout(resolve, 40))
      }
    }
    const warmTimer = window.setTimeout(warm, 1200)

    return () => {
      cancelled = true
      window.clearTimeout(t)
      window.clearTimeout(warmTimer)
      window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cache.forEach((img) => { img.onload = null; img.src = '' })
      cache.clear()
    }
  }, [staticMode])

  if (staticMode) {
    return (
      <section id="drivecam-intro" aria-label="Introduction" data-figma-id="drivecam-intro" className="flex w-full flex-col items-center">
        <div className="flex w-full flex-col items-center justify-center bg-surface-page-static-black px-20 py-96 md:py-160">
          <h1 className="flex flex-col items-center text-center">
            {introLines.map((line, li) => (
              <span key={li} className="flex flex-wrap justify-center gap-x-12 xl:gap-x-24">
                {line.map(({ w, light }) => (
                  <Typography key={w} textStyle="display-2xl" as="span" color="static" className={`${INTRO_SIZE} ${light ? 'font-light!' : 'font-semibold!'}`}>{w}</Typography>
                ))}
              </span>
            ))}
          </h1>
        </div>
        <div className="flex w-full flex-col items-center bg-surface-page-static-white px-20 py-48">
          <div role="img" aria-label="DriveCam" className="flex aspect-square w-[min(86vw,560px)] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${asset('/drivecam/frames/hero/f0172.jpg')})` }} />
        </div>
      </section>
    )
  }

  return (
    <section
      id="drivecam-intro"
      aria-label="Introduction"
      data-figma-id="drivecam-intro"
      ref={trackRef}
      className="relative flex h-[320svh] w-full flex-col items-center md:h-[400svh]"
    >
      <div className={`sticky top-0 flex h-svh w-full flex-col items-center overflow-hidden ${IS_AUTOMATION ? 'bg-surface-page-static-white' : 'bg-surface-page-static-black'}`}>
        {!IS_AUTOMATION && (
          <>
            <div ref={haloRef} aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(46% 38% at 50% 50%, #ffffff1f 0%, #ffffff00 100%)' }} />
          </>
        )}
        <div ref={filmRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0">
          <div
            ref={filmBoxRef}
            role="img"
            aria-label="DriveCam film, plays as you scroll"
            className="relative flex aspect-square w-[min(86vw,70svh,560px)] overflow-hidden"
          >
            <canvas ref={canvasRef} width={720} height={720} className="absolute inset-0 size-full" />
          </div>
        </div>


        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-20">
          <div ref={backdropRef} className="absolute inset-0 bg-surface-page-static-black" />
          <div ref={introTextRef} className="relative flex flex-col items-center gap-24">
            <h1 className="flex flex-col items-center text-center">
              {introLines.map((line, li) => (
                <span key={li} className="flex flex-wrap justify-center gap-x-12 xl:gap-x-24">
                  {line.map(({ w, light }, wi) => {
                    const order = li * 2 + wi
                    return (
                      <span
                        key={w}
                        className={`inline-block transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
                        style={{ transitionDelay: `${order * 160}ms` }}
                      >
                        <Typography textStyle="display-2xl" as="span" color="static" className={`${INTRO_SIZE} ${light ? 'font-light!' : 'font-semibold!'}`}>{w}</Typography>
                      </span>
                    )
                  })}
                </span>
              ))}
            </h1>
          </div>
          <div ref={cueRef} className="absolute inset-x-0 bottom-32 flex flex-col items-center gap-8">
            <Typography textStyle="label-md-medium" className="text-text-static-light/60!">Scroll</Typography>
            <div className="h-32 w-1 bg-surface-static-white/40" />
          </div>
        </div>
      </div>
    </section>
  )
}

const statementWords = [
  ...'Everyone remembers an accident differently.'.split(' ').map((w) => ({ w, accent: false })),
  ...'DriveCam remembers it as it happened.'.split(' ').map((w) => ({ w, accent: true })),
]

// The statement lights up word by word as you scroll through it, then the line underneath fades up.
function Statement() {
  const sectionRef = useRef(null)
  const wordRefs = useRef([])
  const subRef = useRef(null)
  const [staticMode] = useState(isStaticMode)

  useLayoutEffect(() => {
    if (staticMode) return undefined
    const section = sectionRef.current
    if (!section) return undefined
    const count = statementWords.length
    return registerScene(section, (top, h, vh) => {
      const p = clamp((vh * 0.78 - top) / (vh * 0.6))
      wordRefs.current.forEach((el, i) => {
        if (!el) return
        const start = (i / count) * 0.72
        el.style.opacity = String(0.14 + 0.86 * ease(seg(p, start, start + 0.28)))
      })
      if (subRef.current) {
        const t = ease(seg(p, 0.82, 1))
        subRef.current.style.opacity = String(t)
        subRef.current.style.transform = t >= 1 ? 'none' : `translateY(${(1 - t) * 20}px)`
      }
    })
  }, [staticMode])

  return (
    <section
      ref={sectionRef}
      aria-label="Everyone remembers an accident differently"
      data-figma-id="drivecam-statement"
      className="relative z-20 flex w-full flex-col items-center bg-surface-page-static-black px-20 py-72 md:px-56 md:py-[140px] -mt-[59svh] md:-mt-[81svh]"
    >
      <div className="flex w-full max-w-[1000px] flex-col items-center gap-24 md:gap-32">
        <Typography textStyle="display-xl" as="h2" color="static" className="text-center! text-[34px]! leading-[1.14]! tracking-[-0.03em]! font-light! md:text-[60px]! xl:text-[76px]!">
          {statementWords.map(({ w, accent }, i) => (
            <span key={`${w}-${i}`} ref={(el) => { wordRefs.current[i] = el }} className={accent ? 'text-[#a58cf7]!' : undefined}>{w}{i < statementWords.length - 1 ? ' ' : ''}</span>
          ))}
        </Typography>
        <div ref={subRef} className="flex w-full max-w-[560px] justify-center">
          <Typography textStyle="body-lg-regular" className="text-center! text-[#b4aad6]!">
            Wrong challan. Road rage. The other driver’s story. Now you have proof, not arguments.
          </Typography>
        </div>
      </div>
    </section>
  )
}

// "See it in action": the road film, as a normal video on loop. It plays muted while it's on screen and pauses when
// you scroll away (picking up where it left off when you come back). Nothing is tied to the scroll position.
function ActionFilm() {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const [staticMode] = useState(isStaticMode)

  useEffect(() => {
    if (staticMode || IS_AUTOMATION) return undefined
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return undefined
    const play = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.4) video.play().catch(() => {})
      else if (entry.intersectionRatio < 0.15) video.pause()
    }, { threshold: [0, 0.15, 0.4] })
    // Start fetching the video a screen or so before it is reached.
    const warm = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Skip if playback already started: calling load() then would cancel it.
        if (video.paused && video.readyState === 0) {
          video.preload = 'auto'
          video.load()
        }
        warm.disconnect()
      }
    }, { rootMargin: '150% 0px' })
    warm.observe(section)
    play.observe(section)
    return () => {
      play.disconnect()
      warm.disconnect()
    }
  }, [staticMode])

  return (
    <section ref={sectionRef} aria-label="See it in action" data-figma-id="drivecam-action" className="flex w-full justify-center bg-surface-page-static-black">
      {IS_AUTOMATION ? (
        <div role="img" aria-label="DriveCam in action" className="flex aspect-[2/1] w-full max-w-[1600px] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${asset('/drivecam/in-action-poster.webp')})` }} />
      ) : (
        <video
          ref={videoRef}
          src={asset('/drivecam/in-action.mp4')}
          poster={asset('/drivecam/in-action-poster.webp')}
          muted
          loop
          playsInline
          preload="none"
          controls={staticMode}
          aria-label="DriveCam in action"
          className="aspect-[4/3] w-full max-w-[1600px] object-cover md:aspect-[2/1]"
        />
      )}
    </section>
  )
}

const IS_AUTOMATION = typeof navigator !== 'undefined' && Boolean(navigator.webdriver)
const C_OFF = '#f7f6f2'
const C_LAV = '#ede9f3'
const C_BEIGE = '#f0ece6'
const C_CHAR = '#252225'

// Soft seam: the top of a band fades in from the colour of the band above it (a background, so it sits behind the content).
// Skipped for the Figma export (gradients don't map).
const fadeStyle = (from) => (IS_AUTOMATION ? undefined : { backgroundImage: `linear-gradient(to bottom, ${from} 0%, ${from}00 220px)` })

const hotspots = [
  { n: 1, x: 42, y: 62, side: 'left', title: 'Quad HD, wide-angle, night vision', text: '1440p video with a 156° field of view, clear even after dark.' },
  { n: 2, x: 47.5, y: 41, side: 'left', title: 'Flips 360°', text: 'Turn the camera to record the cabin as well as the road.' },
  { n: 3, x: 65.5, y: 69, side: 'right', title: 'Up to 512GB, yours alone', text: 'Stored on your microSD card, not our servers. ACKO can’t access it.' },
  { n: 4, x: 66.7, y: 54, side: 'right', title: 'You’re in control', text: 'Switch off the camera or the microphone any time.' },
]

// Stock photos from Unsplash (free licence), as placeholders until we have our own.
const insuranceBenefits = [
  { image: '/drivecam/benefits/claims-manager.webp', title: 'Relationship manager', text: 'A dedicated claims manager. You make one call, and they stay with you until your car is back.' },
  { image: '/drivecam/benefits/pickup.webp', title: 'Convenience when needed', text: 'Pickup and drop, wherever you are.' },
  { image: '/drivecam/benefits/garage.webp', title: 'A trusted network of garages', text: 'Handpicked and monitored by ACKO. A 53-point quality check and a 1-year warranty on the work.' },
  { image: '/drivecam/benefits/invoice.webp', title: '100% transparency', text: 'Photos and invoices for every part replaced, on your phone.' },
]

const behaviours = [
  { title: 'Always recording', text: 'It starts when your car does. Nothing to press, nothing to remember.' },
  { title: 'Locks on impact', text: 'The instant it senses a collision, the footage is protected from being recorded over.' },
  { title: 'No internet needed', text: 'It records without the internet. Connect your phone over Wi-Fi to browse, clip and download videos in the ACKO app.' },
]

// Everything the camera does, in one dark section: the camera with numbered pins, the three ticking numbers, and a
// short list for the things that have no spot to point at. Hover or tap a pin (or its label) to light up both.
function LookCloser() {
  const [active, setActive] = useState(0)
  const callout = ({ n, title, text }) => (
    <button
      key={n}
      type="button"
      onMouseEnter={() => setActive(n)}
      onFocus={() => setActive(n)}
      onMouseLeave={() => setActive(0)}
      onBlur={() => setActive(0)}
      onClick={() => setActive(active === n ? 0 : n)}
      aria-label={`${n}. ${title}`}
      className="flex w-full cursor-pointer items-start gap-16 text-left"
    >
      <span className={`flex size-28 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${active === n ? 'bg-white' : 'bg-[#a58cf7]'}`}>
        <Typography textStyle="label-sm-semibold" className="text-[#171717]!">{n}</Typography>
      </span>
      <span className="flex flex-col gap-4">
        <Typography textStyle="label-lg-semibold" color="static" className={`transition-opacity duration-200 ${active && active !== n ? 'opacity-50' : ''}`}>{title}</Typography>
        <Typography textStyle="body-md-regular" className={`text-[#b4aad6]! transition-opacity duration-200 ${active && active !== n ? 'opacity-50' : ''}`}>{text}</Typography>
      </span>
    </button>
  )
  return (
    <section id="drivecam-features" aria-label="Features" data-figma-id="drivecam-features" className="flex w-full flex-col items-center bg-surface-page-static-black">
      <div className="flex w-full max-w-[1200px] flex-col gap-56 px-20 py-72 md:gap-[88px] md:px-56 md:py-[120px]">
        <Reveal className="flex flex-col items-center">
          <Typography textStyle="display-xl" as="h2" color="static" className={`text-center! ${H_SECTION}`}>Everything it does, <span className="text-[#a58cf7]!">up close.</span></Typography>
        </Reveal>

        <div className="flex flex-col items-center gap-40 md:flex-row md:gap-24">
          <div className="order-2 flex w-full flex-col gap-32 md:order-1 md:min-w-0 md:flex-1">{hotspots.filter((h) => h.side === 'left').map(callout)}</div>
          <div
            className="relative order-1 flex aspect-square w-[min(86vw,520px)] shrink-0 bg-contain bg-center bg-no-repeat md:order-2"
            role="img"
            aria-label="The DriveCam, with four points to look at"
            style={{ backgroundImage: IS_AUTOMATION ? `url(${asset('/drivecam/frames/hero-alpha/f0172.webp')})` : `url(${asset('/drivecam/frames/hero-alpha/f0172.webp')}), radial-gradient(48% 40% at 50% 56%, #ffffff1a 0%, #ffffff00 100%)` }}
          >
            {hotspots.map(({ n, x, y, title }) => (
              <button
                key={n}
                type="button"
                aria-label={`Point ${n}: ${title}`}
                onMouseEnter={() => setActive(n)}
                onFocus={() => setActive(n)}
                onMouseLeave={() => setActive(0)}
                onBlur={() => setActive(0)}
                onClick={() => setActive(active === n ? 0 : n)}
                className="absolute flex size-44 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <span className={`flex size-28 items-center justify-center rounded-full shadow-[0_0_0_6px_rgba(165,140,247,0.28)] transition-[background-color,transform] duration-200 ${active === n ? 'scale-125 bg-white' : 'bg-[#a58cf7]'}`}>
                  <Typography textStyle="label-sm-semibold" className="text-[#171717]!">{n}</Typography>
                </span>
              </button>
            ))}
          </div>
          <div className="order-3 flex w-full flex-col gap-32 md:min-w-0 md:flex-1">{hotspots.filter((h) => h.side === 'right').map(callout)}</div>
        </div>

        <div className="flex flex-col gap-32 md:flex-row">
          {numbers.map(({ to, suffix, label }, i) => (
            <Reveal key={label} delay={i * 120} className="flex min-w-0 flex-1 flex-col gap-16 pt-16">
              <div className="h-1 w-full bg-surface-static-white/20" />
              <div className="flex flex-col gap-12">
                <Typography textStyle="display-2xl" as="p" color="static" className={NUMBER_SIZE}><CountUp to={to} suffix={suffix} delay={i * 140} /></Typography>
                <Typography textStyle="label-md-semibold" className="text-[#b4aad6]!">{label}</Typography>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="flex flex-col gap-24 md:flex-row md:gap-32">
          {behaviours.map(({ title, text }, i) => (
            <Reveal key={title} delay={i * 110} className="flex min-w-0 flex-1 flex-col gap-8 border-t border-surface-static-white/20 pt-20">
              <Typography textStyle="heading-lg" as="h3" color="static" className={H_CARD}>{title}</Typography>
              <Typography textStyle="body-md-regular" className="text-[#b4aad6]!">{text}</Typography>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function DriveCamRevealPage() {
  const [form, setForm] = useState({ reg: '', mobile: '', pincode: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showBar, setShowBar] = useState(false)
  const [allFaqs, setAllFaqs] = useState(false)

  // Slim "Get early access" bar: shown once the opening film has finished, hidden while the form itself is on screen.
  useEffect(() => {
    if (navigator.webdriver) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const intro = document.getElementById('drivecam-intro')
      const form = document.getElementById('drivecam-early-access')
      if (!intro || !form) return
      const vh = window.innerHeight
      const formBox = form.getBoundingClientRect()
      const formOnScreen = formBox.top < vh * 0.9 && formBox.bottom > vh * 0.1
      setShowBar(intro.getBoundingClientRect().bottom < vh * 0.4 && !formOnScreen)
    }
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (form.reg.replace(/\s/g, '').length < 6) next.reg = 'Enter your car’s registration number, like KA01AB1234.'
    if (!/^\d{10}$/.test(form.mobile)) next.mobile = 'Enter a 10-digit mobile number.'
    if (!/^\d{6}$/.test(form.pincode)) next.pincode = 'Enter a 6-digit pincode.'
    setErrors(next)
    if (Object.keys(next).length === 0) setSubmitted(true)
  }

  const go = (id) => document.getElementById(id).scrollIntoView({ block: 'start' })

  return (
    <main aria-label="ACKO DriveCam" data-figma-id="drivecam-home" className="flex min-h-screen w-full flex-col items-center bg-[#f7f6f2]">
      <FilmIntro />

      <Statement />

      <ActionFilm />

      <LookCloser />

      <section id="drivecam-hero" aria-label="DriveCam with ACKO car insurance" data-figma-id="drivecam-hero" className="flex w-full flex-col items-center bg-[#f0ece6]">
        <div className="flex w-full max-w-[1200px] flex-col-reverse items-center gap-32 px-20 pt-[96px] md:px-56 md:pt-[120px] lg:flex-row lg:items-end lg:gap-56">
          <Ambassador image={asset('/drivecam/ambassador-right.webp')} label="Ambassador showing the DriveCam" delay={0} className="flex h-[380px] w-[194px] shrink-0 bg-contain bg-bottom bg-no-repeat md:h-[480px] md:w-[245px] lg:h-[600px] lg:w-[307px] xl:h-[680px] xl:w-[347px]" />
          <div className="flex w-full min-w-0 flex-col items-start gap-20 md:gap-24 lg:flex-1 lg:pb-[120px]">
            <Reveal className="flex">
              <Typography textStyle="display-xl" as="h2" className={`text-text-static-dark! ${H_SECTION}`}>
                An industry-first premium insurance plan <span className="text-text-brand-default!">with a dashcam.</span>
              </Typography>
            </Reveal>
            <Reveal delay={120} className="flex">
              <Typography textStyle="body-lg-regular" color="secondary" className="max-w-[480px]">
                Proof settles the argument. It doesn’t fix the car. So we built DriveCam into your car insurance.
              </Typography>
            </Reveal>
            <Reveal delay={280} className="flex">
              <Button variant="primary" size="lg" onClick={() => go('drivecam-early-access')}>Get early access</Button>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="drivecam-benefits" aria-label="What the insurance adds" data-figma-id="drivecam-benefits" className="flex w-full flex-col items-center bg-[#f7f6f2]">
        <div className="flex w-full max-w-[1200px] flex-col items-center gap-32 px-20 py-72 md:gap-48 md:px-56 md:py-[120px]">
          <Reveal className="flex">
            <Typography textStyle="display-xl" as="h3" className={`text-center! text-text-static-dark! ${H_SECTION}`}>
              Exclusive <span className="text-text-brand-default!">Platinum benefits.</span>
            </Typography>
          </Reveal>
          {/* Four in a row from md up. On phones the cards pin one over the next as you scroll. */}
          <div className="flex w-full flex-col gap-16 md:flex-row">
            {insuranceBenefits.map(({ image, title, text }, i) => (
              <div
                key={title}
                className={`flex min-w-0 flex-col overflow-hidden rounded-3xl bg-surface-card-default shadow-xs md:flex-1 ${IS_AUTOMATION ? '' : 'sticky md:static'}`}
                style={IS_AUTOMATION ? undefined : { top: 96 + i * 14 }}
              >
                <div aria-hidden="true" className="flex h-[160px] w-full bg-cover bg-center md:h-[180px]" style={{ backgroundImage: `url(${asset(image)})` }} />
                <div className="flex flex-col gap-8 px-24 pb-24 pt-20">
                  <Typography textStyle="heading-lg" as="h4" className={`text-text-static-dark! ${H_CARD}`}>{title}</Typography>
                  <Typography textStyle="body-md-regular" className="text-text-static-dark/70!">{text}</Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="drivecam-early-access" aria-label="Early access" data-figma-id="drivecam-early-access" className="relative flex w-full flex-col items-center bg-[#ede9f3]">
        <div className="flex w-full max-w-[1200px] flex-col items-center gap-40 px-20 pt-56 md:px-56 md:pt-96 lg:flex-row lg:items-end lg:gap-56">
          <div className="flex w-full min-w-0 flex-col gap-32 pb-16 md:gap-40 lg:flex-1 lg:pb-96">
          <div className="flex flex-col gap-16">
            <Typography textStyle="display-xl" as="h2" className={`text-text-static-dark! ${H_SECTION}`}>Be first to get <span className="text-text-brand-default!">DriveCam.</span></Typography>
            <Typography textStyle="body-lg-regular" color="secondary" className="max-w-[480px]">
              We’re opening in phases, eligible cars first. Tell us about your car and we’ll message you when it’s ready.
            </Typography>
          </div>

          {submitted ? (
            <div role="status" aria-label="Early access request submitted" className="flex w-full max-w-[560px] flex-col items-start gap-16 rounded-3xl bg-surface-card-default p-24 md:p-32">
              <CircleCheck className="size-32 text-text-brand-default" aria-hidden="true" />
              <Typography textStyle="heading-lg" as="h3">You’re on the list</Typography>
              <Typography textStyle="body-md-regular" color="secondary">We’ll message you when access opens.</Typography>
            </div>
          ) : (
            <form aria-label="Join DriveCam early access" onSubmit={submit} noValidate className="flex w-full max-w-[560px] flex-col gap-20 rounded-3xl bg-surface-card-default p-24 md:p-32">
              <TextInput label="Car registration number" inputType="registrationNumber" placeholder="KA01AB1234" value={form.reg} onChange={set('reg')} errorText={errors.reg} required />
              <TextInput label="Mobile number" inputType="phone" placeholder="10 digits" value={form.mobile} onChange={set('mobile')} errorText={errors.mobile} required />
              <TextInput label="Pincode" inputType="pincode" placeholder="6 digits" value={form.pincode} onChange={set('pincode')} errorText={errors.pincode} required />
              <Button variant="primary" size="lg" type="submit" fullWidth>Join early access</Button>
              <Typography textStyle="body-sm-regular" color="secondary" className="text-center!">No payment needed. By clicking Join early access, you agree to the Terms and Conditions.</Typography>
            </form>
          )}
          </div>
          <Ambassador image={asset('/drivecam/ambassador-left.webp')} label="Ambassador holding the DriveCam" delay={0} className="flex h-[380px] w-[260px] shrink-0 bg-contain bg-bottom bg-no-repeat md:h-[480px] md:w-[328px] lg:h-[600px] lg:w-[410px] xl:h-[680px] xl:w-[465px]" />
        </div>
      </section>

      <section id="drivecam-faqs" aria-label="Frequently asked questions" data-figma-id="drivecam-faqs" className="relative flex w-full flex-col items-center bg-[#f7f6f2]">
        <div className="flex w-full max-w-[1200px] flex-col items-center gap-32 px-20 py-56 md:gap-48 md:px-56 md:py-96">
          <div className="flex flex-col items-center gap-12">
            <Typography textStyle="display-xl" as="h2" className={`text-center! text-text-static-dark! ${H_SECTION}`}>Questions, <span className="text-text-brand-default!">answered.</span></Typography>
          </div>
          <div className="flex w-full max-w-[760px] flex-col">
            <Accordion type="single" size="md" defaultValue="faq-0">
              {faqs.slice(0, allFaqs ? faqs.length : 6).map(({ q, a }, i) => (
                <AccordionItem key={q} value={`faq-${i}`} title={q}>{a}</AccordionItem>
              ))}
            </Accordion>
            <div className="flex justify-center pt-24">
              <Button variant="secondary" size="md" onClick={() => setAllFaqs((v) => !v)}>{allFaqs ? 'Fewer questions' : 'More questions'}</Button>
            </div>
          </div>
        </div>
      </section>

      <footer aria-label="ACKO footer" data-figma-id="drivecam-footer" className="relative flex w-full flex-col items-center bg-surface-page-static-black">
        <div className="flex w-full max-w-[1200px] flex-col gap-48 px-20 pb-32 pt-72 md:gap-64 md:px-56 md:pt-[120px]">
          <h2 className="flex flex-row flex-wrap items-baseline gap-x-12 pb-24 md:gap-x-16 md:pb-48 xl:gap-x-20">
            <Typography textStyle="display-2xl" as="span" className="text-[36px]! leading-[1]! tracking-[-0.05em]! font-light! text-[#928b9f]! md:text-[56px]! xl:text-[72px]!">Building the protection destination</Typography>
            <Typography textStyle="display-2xl" as="span" className="text-[36px]! leading-[1.05]! tracking-[-0.05em]! font-semibold! text-[#928b9f]! md:text-[56px]! xl:text-[72px]!">for your car.</Typography>
          </h2>
          <div className="h-1 w-full bg-surface-static-white/15" />
          <div className="flex items-center justify-between gap-16">
            <AckoLogo textFill="#ffffff" />
            {/* Small links, like the Clinic's footer. */}
            <nav aria-label="Footer links" className="flex flex-wrap items-center justify-end gap-x-24 gap-y-8">
              {[['Features', 'drivecam-features'], ['Platinum benefits', 'drivecam-benefits'], ['Early access', 'drivecam-early-access'], ['FAQs', 'drivecam-faqs']].map(([label, id]) => (
                <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="flex">
                  <Typography textStyle="label-sm-regular" className="text-[#c0b7dd]!">{label}</Typography>
                </a>
              ))}
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex cursor-pointer">
                <Typography textStyle="label-sm-regular" className="text-[#c0b7dd]!">Back to top ↑</Typography>
              </button>
            </nav>
          </div>
        </div>
      </footer>
      {!navigator.webdriver && (
      <div aria-hidden={!showBar} className="pointer-events-none fixed inset-x-0 top-12 z-30 flex justify-center px-12">
        <div className={`pointer-events-auto flex w-full max-w-[640px] items-center justify-between gap-12 rounded-full bg-surface-card-default py-8 pl-20 pr-8 shadow-m transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${showBar ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-24 opacity-0'}`}>
          <div className="flex min-w-0 items-center gap-12">
            <Link to="/acko" aria-label="ACKO home" tabIndex={showBar ? 0 : -1} className="flex"><AckoLogo /></Link>
            <div className="hidden pl-12 md:flex">
              <Typography textStyle="label-md-medium" color="secondary">DriveCam · Launching soon</Typography>
            </div>
          </div>
          <Button variant="primary" size="sm" tabIndex={showBar ? 0 : -1} onClick={() => go('drivecam-early-access')}>Get early access</Button>
        </div>
      </div>
      )}
    </main>
  )
}

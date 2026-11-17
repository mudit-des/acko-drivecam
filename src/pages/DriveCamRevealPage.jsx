import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { asset } from '../asset'
import { Accordion, AccordionItem } from '@acko/accordion'
import { Button } from '@acko/button'
import { TextInput } from '@acko/text-input'
import { Typography } from '@acko/typography'
import { CircleCheck, Headset, ReceiptIndianRupee, Truck, Wrench } from 'lucide-react'

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

const INTRO_SUB = 'Our premium car insurance now paired with a dashcam'
const INTRO_SUB_SIZE = 'text-[17px]! leading-[1.4]! font-light! antialiased md:text-[22px]! xl:text-[24px]!'

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
      if (cueRef.current) cueRef.current.style.opacity = String(1 - sm(p, 0.8, 0.9))
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
          <Typography textStyle="body-lg-regular" as="p" className={`max-w-[300px] pt-24 text-center! text-text-static-light/60! md:max-w-none ${INTRO_SUB_SIZE}`}>{INTRO_SUB}</Typography>
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
      className="relative flex h-[320svh] w-full flex-col items-center bg-surface-page-static-black md:h-[400svh]"
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
            <span
              className={`inline-block transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
              style={{ transitionDelay: '640ms' }}
            >
              <Typography textStyle="body-lg-regular" as="p" className={`max-w-[300px] text-center! text-text-static-light/60! md:max-w-none ${INTRO_SUB_SIZE}`}>{INTRO_SUB}</Typography>
            </span>
          </div>
          <div ref={cueRef} className="absolute inset-x-0 bottom-32 flex flex-col items-center gap-8">
            <Typography textStyle="label-md-medium" className="text-text-static-light/60!">Scroll</Typography>
            <div className="h-32 w-1 animate-pulse bg-surface-static-white/40 motion-reduce:animate-none" />
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

const bridgeWords = [
  ...'Proof settles the argument.'.split(' ').map((w) => ({ w, accent: false })),
  ...'It doesn’t fix the car.'.split(' ').map((w) => ({ w, accent: true })),
]

// Bridge into insurance: closes the product half on the problem, lighting up word by word like the opening statement.
// The section after it answers: "So we built DriveCam into your car insurance."
function Bridge() {
  const sectionRef = useRef(null)
  const wordRefs = useRef([])
  const [staticMode] = useState(isStaticMode)
  useLayoutEffect(() => {
    if (staticMode) return undefined
    const section = sectionRef.current
    if (!section) return undefined
    const count = bridgeWords.length
    return registerScene(section, (top, h, vh) => {
      const p = clamp((vh * 0.95 - top) / (vh * 0.6))
      wordRefs.current.forEach((el, i) => {
        if (!el) return
        const start = (i / count) * 0.72
        el.style.opacity = String(0.28 + 0.72 * ease(seg(p, start, start + 0.28)))
      })
    })
  }, [staticMode])
  return (
    <section ref={sectionRef} aria-label="Proof settles the argument" data-figma-id="drivecam-bridge" className="relative z-20 flex w-full flex-col items-center bg-surface-page-static-black px-20 pb-[96px] pt-24 md:px-56 md:pb-[160px] md:pt-40">
      <Typography textStyle="display-xl" as="h2" color="static" className="max-w-[1000px] text-center! text-[34px]! leading-[1.14]! tracking-[-0.03em]! font-light! md:text-[60px]! xl:text-[76px]!">
        {bridgeWords.map(({ w, accent }, i) => (
          <span key={`${w}-${i}`} ref={(el) => { wordRefs.current[i] = el }} className={accent ? 'text-[#a58cf7]!' : undefined}>{w}{i < bridgeWords.length - 1 ? ' ' : ''}</span>
        ))}
      </Typography>
    </section>
  )
}

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
      const p = clamp((vh * 0.95 - top) / (vh * 0.6))
      wordRefs.current.forEach((el, i) => {
        if (!el) return
        const start = (i / count) * 0.72
        el.style.opacity = String(0.28 + 0.72 * ease(seg(p, start, start + 0.28)))
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
      className="relative z-20 flex w-full flex-col items-center bg-surface-page-static-black px-20 pb-72 pt-40 md:px-56 md:pb-[140px] md:pt-72 -mt-[75svh] md:-mt-[100svh]"
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
    <section ref={sectionRef} aria-label="See it in action" data-figma-id="drivecam-action" className="relative z-20 flex w-full justify-center bg-surface-page-static-black">
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
// ACKO design-system surfaces: Grey 50 (surfacePagePrimary), Purple 100 (brandPrimary100), Grey 150 (surfacePageSecondary).
const C_OFF = '#fafafa'
const C_LAV = '#f2ebff'
const C_BEIGE = '#efeff0'
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
  { Icon: Headset, image: '/drivecam/benefits/claims-manager.webp', title: 'Relationship manager', text: 'A dedicated claims manager. You make one call, and they stay with you until your car is back.' },
  { Icon: Truck, image: '/drivecam/benefits/pickup.webp', title: 'Convenience when needed', text: 'Pickup and drop, wherever you are.' },
  { Icon: Wrench, image: '/drivecam/benefits/garage.webp', title: 'A trusted network of garages', text: 'Handpicked and monitored by ACKO. A 53-point quality check and a 1-year warranty on the work.' },
  { Icon: ReceiptIndianRupee, image: '/drivecam/benefits/invoice.webp', title: '100% transparency', text: 'Photos and invoices for every part replaced, on your phone.' },
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
    <section id="drivecam-features" aria-label="Features" data-figma-id="drivecam-features" className="relative z-20 flex w-full flex-col items-center bg-surface-page-static-black">
      <div className="flex w-full max-w-[1200px] flex-col gap-56 px-20 py-72 md:gap-[88px] md:px-56 md:py-[120px]">
        <Reveal className="flex flex-col items-center">
          <Typography textStyle="display-xl" as="h2" color="static" className={`text-center! ${H_SECTION}`}>Meet your <span className="text-[#a58cf7]!">DriveCam</span></Typography>
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

// Primary and secondary buttons on this page are black instead of brand purple. The design-system Button has no black variant, so
// its own colour tokens are pointed at the static black greys here (hover a touch lighter, pressed a touch darker).
const BLACK_BUTTONS = {
  '--buttonFillPrimaryDefault': '#141414',
  '--buttonFillPrimaryHover': '#1e1e1f',
  '--buttonFillPrimaryActive': '#0a0a0a',
  '--buttonFillPrimaryText': '#ffffff',
  '--buttonBorderDefaultGradientTop': '#3a3a3c',
  '--buttonBorderDefaultGradientBottom': 'transparent',
  // Secondary: black outline and label on a clear fill.
  '--buttonFillSecondaryText': '#141414',
  '--buttonFillSecondaryDefault': 'transparent',
  '--buttonFillSecondaryHover': 'rgba(20, 20, 20, 0.06)',
  '--buttonFillSecondaryActive': 'rgba(20, 20, 20, 0.12)',
  '--buttonBorderSecondaryDefault': '#141414',
}

// The footer reads as a road at night: the sentence sits on a dashed lane line, and a low dark car is parked on it at
// the right, facing the text, its headlight throwing a soft beam that lights up the dashes ahead. Car, beam and lit
// stretch drive in from the right (towards the text) the first time the footer comes into view (already in place with
// reduced motion).
const ROAD_DASHES = 'repeating-linear-gradient(to right, rgba(255,255,255,0.22) 0 18px, transparent 18px 32px)'
const ROAD_DASHES_LIT = 'repeating-linear-gradient(to right, rgba(255,255,255,0.8) 0 18px, transparent 18px 32px)'

function FooterRoad() {
  const ref = useRef(null)
  const [shown, setShown] = useState(() => isStaticMode())
  useEffect(() => {
    if (shown || !ref.current) return undefined
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true)
        io.disconnect()
      }
    }, { threshold: 0.6 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [shown])
  const glide = { opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateX(220px)', transition: 'opacity 1.2s ease-out, transform 2s cubic-bezier(0.22, 1, 0.36, 1)' }
  // The sentence is lit by the headlight: dim on the left, bright nearest the car. It starts all dim and brightens as
  // the car arrives (the gradient is twice as wide as the text and slides from its dim half to its lit half).
  const lit = {
    backgroundImage: 'linear-gradient(to right, #4a4652 0%, #4a4652 50%, #8e889b 74%, #f3f0fb 100%)',
    backgroundSize: '200% 100%',
    backgroundPosition: shown ? '100% 0' : '0% 0',
    transition: 'background-position 1.8s ease-out',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
  }

  return (
    <div ref={ref} className="flex flex-col gap-10">
      <div className="relative flex items-end justify-between gap-24">
        <Typography textStyle="body-lg-regular" as="p" className={`relative z-10 min-w-0 pr-[112px] text-[24px]! md:pr-0 leading-[1.15]! tracking-[-0.02em]! font-light! md:text-[30px]! xl:text-[34px]! xl:whitespace-nowrap ${IS_AUTOMATION ? 'text-[#a39daf]!' : 'text-transparent!'}`}>
          <span className="inline" style={IS_AUTOMATION ? undefined : lit}>
            Building the <span className="font-semibold!">protection destination</span> for your car
          </span>
        </Typography>
        <div role="img" aria-label="A car driving towards the text with its headlight on" className="absolute bottom-0 right-0 flex h-[42px] w-[260px] shrink-0 md:relative md:h-[52px] md:w-[340px]" style={glide}>
          {!IS_AUTOMATION && (
            <div aria-hidden="true" className="absolute bottom-[-9px] right-[99px] flex h-[36px] w-[calc(100%-99px)] md:right-[125px] md:h-[44px] md:w-[calc(100%-125px)]" style={{ filter: 'blur(9px)' }}>
              <div
                className="absolute inset-0 flex"
                style={{ backgroundImage: 'linear-gradient(to left, rgba(242,244,255,0.6), rgba(216,208,255,0.2) 45%, rgba(165,140,247,0))', clipPath: 'polygon(100% 39%, 100% 66%, 0 100%, 0 0)' }}
              />
            </div>
          )}
          {/* A rim-lit Range Rover Evoque-style SUV facing left, drawn as a silhouette in the dark: a near-black body
              shaped only by light catching the bonnet, roof and spoiler, barely-there wheels, a slim swept LED headlight
              with soft bloom and a red tail light glowing behind. Blur and gradients fall back to solid shapes for Figma. */}
          <svg viewBox="0 0 108 46" aria-hidden="true" overflow="visible" className="absolute bottom-[-14px] right-0 h-[46px] w-[108px] md:bottom-[-15px] md:h-[58px] md:w-[136px]">
            {!IS_AUTOMATION && (
              <defs>
                <linearGradient id="footer-car-rim" x1="8" y1="0" x2="98" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ffffff" stopOpacity=".35" />
                  <stop offset=".3" stopColor="#ffffff" stopOpacity=".9" />
                  <stop offset=".55" stopColor="#e6e2f2" stopOpacity=".75" />
                  <stop offset=".85" stopColor="#cfc8e8" stopOpacity=".35" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity=".05" />
                </linearGradient>
                <linearGradient id="footer-car-shoulder" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ffffff" stopOpacity=".2" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <filter id="footer-car-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".7" /></filter>
                <filter id="footer-car-bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" /></filter>
                <filter id="footer-car-glow" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="3.2" /></filter>
                <filter id="footer-car-haze" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="7" /></filter>
              </defs>
            )}
            {!IS_AUTOMATION && <ellipse cx="54" cy="13" rx="38" ry="8" fill="#ffffff" opacity=".07" filter="url(#footer-car-haze)" />}
            {!IS_AUTOMATION && <ellipse cx="100.5" cy="20" rx="5" ry="3.6" fill="#ff2a44" opacity=".45" filter="url(#footer-car-glow)" />}
            <path d="M8.2 36.2C7.4 34.8 7.1 32.6 7.2 30.2L7.5 25.3C7.6 23.9 8.1 22.9 8.9 22.3 9.3 21 9.8 20.6 10.3 20.3L21.4 18.6 31.1 17C32.4 16.8 33.4 16.3 34.4 15.5L45.4 10.2C46.6 9.4 48.4 8.6 50.6 8.4L85.3 8.6C88.6 8.8 91.2 9.4 93 10.4L89.8 11.7C91.8 12.6 93.6 13.9 94.8 15.6 96 16.2 97 16.8 97.6 17.7 98.6 21 99.1 24.6 99.2 28.1L99.2 33.9C99.2 34.8 98.4 35.3 97.1 35.3L93.1 35.6A9.7 9.7 0 0 0 73.9 35.6L73.6 36.4H34.3L34 35.6A9.7 9.7 0 0 0 14.8 35.6Z" fill="#040405" />
            <circle cx="24.4" cy="34.4" r="7.7" fill="#020202" />
            <circle cx="83.5" cy="34.4" r="7.7" fill="#020202" />
            <path d="M19.4 28.6A7.7 7.7 0 0 1 29.4 28.6M78.5 28.6A7.7 7.7 0 0 1 88.5 28.6" fill="none" stroke="#ffffff" strokeOpacity=".06" strokeWidth=".5" />
            {!IS_AUTOMATION && <path d="M8.9 22.3C9.3 21 9.8 20.6 10.3 20.3L21.4 18.6 31.1 17C32.4 16.8 33.4 16.3 34.4 15.5L45.4 10.2C46.6 9.4 48.4 8.6 50.6 8.4L85.3 8.6C88.6 8.8 91.2 9.4 93 10.4" fill="none" stroke="url(#footer-car-rim)" strokeWidth="1.6" opacity=".7" filter="url(#footer-car-bloom)" />}
            <path d="M8.9 22.3C9.3 21 9.8 20.6 10.3 20.3L21.4 18.6 31.1 17C32.4 16.8 33.4 16.3 34.4 15.5L45.4 10.2C46.6 9.4 48.4 8.6 50.6 8.4L85.3 8.6C88.6 8.8 91.2 9.4 93 10.4" fill="none" stroke={IS_AUTOMATION ? '#8e889b' : 'url(#footer-car-rim)'} strokeWidth=".5" />
            <path d="M94.8 15.6C96 16.2 97 16.8 97.6 17.7" fill="none" stroke="#ffffff" strokeOpacity=".12" strokeWidth=".4" />
            {!IS_AUTOMATION && <path d="M14 22.4L94 17.4" stroke="url(#footer-car-shoulder)" strokeWidth=".7" filter="url(#footer-car-soft)" />}
            <path d="M40.8 16.9C41.4 15.4 42.6 14.6 44.2 14.5L45 17 41.6 17.6Z" fill="#060607" stroke="#ffffff" strokeOpacity=".35" strokeWidth=".3" />
            {!IS_AUTOMATION && <path d="M8.4 23.2L19.4 21.4 19.6 22.2 8.8 24.8Z" fill="#ffffff" opacity=".9" filter="url(#footer-car-bloom)" />}
            <path d="M8.4 23.2L19.4 21.4 19.6 22.2 8.8 24.8Z" fill="#f6f8ff" />
            <path d="M8.4 31.2L13.6 30.4" stroke="#ffffff" strokeOpacity=".12" strokeWidth=".5" strokeLinecap="round" />
            {!IS_AUTOMATION && <path d="M91.6 19L97.8 18.4 98.2 20.6 92.4 21.2Z" fill="#ff3550" filter="url(#footer-car-soft)" />}
            <path d="M91.6 19L97.8 18.4 98.2 20.6 92.4 21.2Z" fill="#ff5c70" />
          </svg>
        </div>
      </div>
      <div aria-hidden="true" className={`relative flex h-2 w-full ${IS_AUTOMATION ? 'bg-surface-static-white/30' : ''}`} style={IS_AUTOMATION ? undefined : { backgroundImage: ROAD_DASHES }}>
        {!IS_AUTOMATION && (
          <>
            {/* The road carries on past the content column to both edges of the screen. The left stretch runs its
                dashes leftwards from the column edge so the spacing stays continuous where they meet. */}
            <div className="absolute right-full top-0 flex h-2" style={{ width: 'calc((100vw - 100%) / 2 + 2px)', backgroundImage: 'repeating-linear-gradient(to left, transparent 0 14px, rgba(255,255,255,0.22) 14px 32px)' }} />
            <div className="absolute left-full top-0 flex h-2" style={{ width: 'calc((100vw - 100%) / 2 + 2px)', backgroundImage: ROAD_DASHES }} />
            {/* The stretch of road under the beam: same dashes, brighter, fading out away from the car. */}
            <div className="absolute inset-0 flex" style={{ ...glide, backgroundImage: ROAD_DASHES_LIT, WebkitMaskImage: 'linear-gradient(to left, transparent 96px, #000 112px, transparent 400px)', maskImage: 'linear-gradient(to left, transparent 96px, #000 112px, transparent 400px)' }} />
            <div className="absolute right-[104px] top-[-6px] flex h-[14px] w-[170px] rounded-full md:right-[130px]" style={{ ...glide, backgroundImage: 'radial-gradient(closest-side, rgba(220,212,255,0.22), rgba(165,140,247,0))' }} />
          </>
        )}
      </div>
    </div>
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
    <main aria-label="ACKO DriveCam" data-figma-id="drivecam-home" className="flex min-h-screen w-full flex-col items-center bg-surface-page-primary" style={BLACK_BUTTONS}>
      <FilmIntro />

      <Statement />

      <ActionFilm />

      <LookCloser />

      <Bridge />

      <section id="drivecam-hero" aria-label="DriveCam with ACKO car insurance" data-figma-id="drivecam-hero" className="relative flex w-full flex-col items-center bg-surface-page-secondary">
        {/* Curved edge into the benefits below (side-by-side layout only): flat along the section's bottom under the
            ambassador, so the line meets his legs exactly, then rising and softening into a blend on the right. */}
        {!IS_AUTOMATION && (
          <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 hidden h-[200px] overflow-hidden lg:left-[419px] lg:flex xl:left-[calc(max((100%_-_1200px)/2,_0px)_+_459px)]">
            <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="h-full w-full">
              {/* Three translucent bands of the next section's colour, all meeting the crisp line under the ambassador. */}
              <path d="M0 200 C 380 200, 950 70, 1440 0 L1440 200 Z" fill="#f2ebff" fillOpacity="0.3" />
              <path d="M0 200 C 400 200, 980 105, 1440 55 L1440 200 Z" fill="#f2ebff" fillOpacity="0.55" />
              <path d="M0 200 C 420 200, 1000 140, 1440 110 L1440 200 Z" fill="#f2ebff" />
            </svg>
          </div>
        )}
        <div className="relative z-10 flex w-full max-w-[1200px] flex-col-reverse items-center gap-32 px-20 pt-[96px] md:px-56 md:pt-[120px] lg:flex-row lg:items-end lg:gap-56">
          <Ambassador image={asset('/drivecam/ambassador-right-drivecam.webp')} label="Ambassador showing the DriveCam" delay={0} className="flex h-[380px] w-[194px] shrink-0 bg-contain bg-bottom bg-no-repeat md:h-[480px] md:w-[245px] lg:h-[600px] lg:w-[307px] xl:h-[680px] xl:w-[347px]" />
          <div className="flex w-full min-w-0 flex-col items-start gap-20 md:gap-24 lg:flex-1 lg:pb-[120px]">
            <Reveal className="flex">
              <Typography textStyle="display-xl" as="h2" className={`text-text-static-dark! ${H_SECTION}`}>
                So we built DriveCam into <span className="text-text-brand-default!">your car insurance.</span>
              </Typography>
            </Reveal>
            <Reveal delay={120} className="flex">
              <Typography textStyle="body-lg-regular" color="secondary" className="max-w-[480px]">
                An industry-first premium insurance plan with a dashcam.
              </Typography>
            </Reveal>
            {/* Exclusive benefits, two by two, each with an icon. */}
            <div id="drivecam-benefits" aria-label="Exclusive benefits" className="flex w-full flex-col gap-20 pt-24 md:flex-row md:flex-wrap md:gap-x-32 md:gap-y-28 md:pt-40">
              {insuranceBenefits.map(({ Icon, title, text }, i) => (
                <Reveal key={title} delay={360 + i * 90} className="flex min-w-0 items-start gap-14 md:w-[calc(50%-16px)]">
                  <span aria-hidden="true" className="flex size-40 shrink-0 items-center justify-center rounded-full bg-white/70 text-text-brand-default">
                    <Icon className="size-20" strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-4">
                    <Typography textStyle="label-lg-semibold" as="h3" className="text-text-static-dark!">{title}</Typography>
                    <Typography textStyle="body-sm-regular" className="text-text-static-dark/70!">{text}</Typography>
                  </span>
                </Reveal>
              ))}
            </div>
            <Reveal delay={720} className="flex pt-16 md:pt-24">
              <Button variant="primary" size="lg" onClick={() => go('drivecam-early-access')}>Get early access</Button>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="drivecam-early-access" aria-label="Early access" data-figma-id="drivecam-early-access" className="relative flex w-full flex-col items-center bg-brand-primary100">
        {/* Mirror of the curve above: crisp along the bottom under the ambassador (right), rising and blending softly
            into the FAQ section towards the left. Side-by-side layout only. */}
        {!IS_AUTOMATION && (
          <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 hidden h-[200px] overflow-hidden lg:right-[466px] lg:flex xl:right-[calc(max((100%_-_1200px)/2,_0px)_+_521px)]">
            <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="h-full w-full">
              <path d="M1440 200 C 1060 200, 490 70, 0 0 L0 200 Z" fill="#fafafa" fillOpacity="0.3" />
              <path d="M1440 200 C 1040 200, 460 105, 0 55 L0 200 Z" fill="#fafafa" fillOpacity="0.55" />
              <path d="M1440 200 C 1020 200, 440 140, 0 110 L0 200 Z" fill="#fafafa" />
            </svg>
          </div>
        )}
        <div className="relative z-10 flex w-full max-w-[1200px] flex-col items-center gap-40 px-20 pt-56 md:px-56 md:pt-96 lg:flex-row lg:items-end lg:gap-56">
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
              <Button variant="primary" size="lg" type="submit" fullWidth>Get early access</Button>
              <Typography textStyle="body-sm-regular" color="secondary" className="text-center!">No payment needed. By clicking here, you agree to the Terms and Conditions.</Typography>
            </form>
          )}
          </div>
          <Ambassador image={asset('/drivecam/ambassador-left-drivecam.webp')} label="Ambassador holding the DriveCam" delay={0} className="flex h-[380px] w-[260px] shrink-0 bg-contain bg-bottom bg-no-repeat md:h-[480px] md:w-[328px] lg:h-[600px] lg:w-[410px] xl:h-[680px] xl:w-[465px]" />
        </div>
      </section>

      <section id="drivecam-faqs" aria-label="Frequently asked questions" data-figma-id="drivecam-faqs" className="relative flex w-full flex-col items-center bg-surface-page-primary">
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

      <footer aria-label="ACKO footer" data-figma-id="drivecam-footer" className="relative flex w-full flex-col items-center overflow-hidden bg-surface-page-static-black">
        {/* Logo and links first; the road, sentence and car close the page at the very bottom. */}
        <div className="flex w-full max-w-[1200px] flex-col gap-64 px-20 pb-48 pt-48 md:gap-[88px] md:px-56 md:pb-64 md:pt-64">
          <div className="flex flex-col items-start gap-24 md:flex-row md:items-center md:justify-between md:gap-16">
            <AckoLogo textFill="#ffffff" />
            {/* Small links, like the Clinic's footer. */}
            <nav aria-label="Footer links" className="flex flex-wrap items-center gap-x-24 gap-y-12 md:justify-end">
              {[['Features', 'drivecam-features'], ['Benefits', 'drivecam-hero'], ['Early access', 'drivecam-early-access'], ['FAQs', 'drivecam-faqs']].map(([label, id]) => (
                <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="flex">
                  <Typography textStyle="label-sm-regular" className="text-[#c0b7dd]!">{label}</Typography>
                </a>
              ))}
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex cursor-pointer">
                <Typography textStyle="label-sm-regular" className="text-[#c0b7dd]!">Back to top ↑</Typography>
              </button>
            </nav>
          </div>
          <FooterRoad />
        </div>
      </footer>
      {!navigator.webdriver && (
      <div aria-hidden={!showBar} className="pointer-events-none fixed inset-x-0 top-12 z-30 flex justify-center px-12">
        <div className={`pointer-events-auto flex w-full max-w-[640px] items-center justify-between gap-12 rounded-full bg-surface-card-default py-8 pl-20 pr-8 shadow-m transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${showBar ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-24 opacity-0'}`}>
          <div className="flex min-w-0 items-center gap-12">
            <Link to="/acko" aria-label="ACKO home" tabIndex={showBar ? 0 : -1} className="flex"><AckoLogo /></Link>
            <div className="hidden pl-12 md:flex">
              <Typography textStyle="label-md-medium" color="secondary">DriveCam · Comes with ACKO car insurance</Typography>
            </div>
          </div>
          <Button variant="primary" size="sm" tabIndex={showBar ? 0 : -1} onClick={() => go('drivecam-early-access')}>Get early access</Button>
        </div>
      </div>
      )}
    </main>
  )
}

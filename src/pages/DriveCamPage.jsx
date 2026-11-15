import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { asset } from '../asset'
import { Accordion, AccordionItem } from '@acko/accordion'
import { Button } from '@acko/button'
import { Checkbox } from '@acko/checkbox'
import { TextInput } from '@acko/text-input'
import { Typography } from '@acko/typography'
import { CircleCheck } from 'lucide-react'

// Sizes and weights measured from the approved reference page (mobile, then md+).
const H_HERO = 'text-[32px]! leading-[38px]! tracking-[-0.96px]! font-medium! md:text-[44px]! md:leading-[48px]! xl:text-[52px]! xl:leading-[56px]! xl:tracking-[-1.2px]!'
const H_XL = 'text-[32px]! leading-[40px]! tracking-[-0.96px]! font-medium! md:text-[48px]! md:leading-[60px]!'
const H_LG = 'text-[28px]! leading-[35px]! tracking-[-0.6px]! font-medium! md:text-[40px]! md:leading-[50px]!'
const H_CARD = 'text-[20px]! leading-[28px]! tracking-[-0.1px]! font-medium!'
const LIGHT = 'font-normal! md:font-light!'

const chips = ['1440p Quad HD', '156° wide-angle', 'Up to 512GB', 'Night vision']

const stats = [
  { value: '1440p', label: 'QUAD HD VIDEO' },
  { value: '156°', label: 'WIDE-ANGLE VIEW' },
  { value: '512GB', label: 'MAX STORAGE' },
  { value: 'Night', label: 'LOW-LIGHT RECORDING' },
]

const videoCards = [
  { src: asset('/drivecam/night.mp4'), title: 'Clear after dark', description: 'Low-light recording keeps the detail long after sunset.' },
  { src: asset('/drivecam/quad-hd.mp4'), title: 'Quad HD recording', description: '1440p Quad HD with a 156° wide-angle view.' },
  { src: asset('/drivecam/camera-360.mp4'), title: 'Flips 360°', description: 'Flip the camera 360° to record the cabin as well as the road.' },
]

const benefits = [
  { title: 'Always recording', description: 'It starts when your car does. Nothing to press, nothing to remember.' },
  { title: 'Locks on impact', description: 'The instant it senses a collision, the footage is protected from being recorded over.' },
  { title: 'Your footage, yours alone', description: 'Stored on your microSD card, not our servers. ACKO can’t access it.' },
]

const faqs = [
  { q: 'What is ACKO DriveCam?', a: 'DriveCam is ACKO’s dashcam. It records every drive to your microSD card and locks the footage the moment it senses an impact. It comes with ACKO car insurance.' },
  { q: 'When does it launch?', a: 'DriveCam with ACKO car insurance is launching soon and will open to eligible customers in phases. Check your eligibility above, and we will message you the moment it goes live.' },
  { q: 'How does the launch offer work?', a: 'Enter your car’s registration number, mobile number and pincode. If your car is eligible, we reserve a launch coupon worth up to ₹1,000 for you. You can use it to buy ACKO car insurance with DriveCam included once DriveCam launches. The coupon applies to the insurance and not to DriveCam on its own, and it is subject to offer terms.' },
  { q: 'Why might my car not be eligible yet?', a: 'DriveCam is launching for the first time, so we are making it available to more customers gradually. If your car is not eligible today, we will save your details and message you first when it opens up.' },
  { q: 'Do I pay extra for DriveCam?', a: 'No. DriveCam comes with the insurance. You only need to buy a microSD card separately, and you can optionally pay a small fee for professional installation.' },
  { q: 'What does DriveCam record?', a: 'DriveCam records in 1440p Quad HD with a 156° wide-angle view and clear low-light and night recording. A built-in collision sensor locks the footage automatically when it detects an impact. It supports microSD cards up to 512GB.' },
  { q: 'Does it include a microSD card?', a: 'No. DriveCam records non-stop, so it needs a high-endurance microSD card (Class 10, U3, V30, up to 512GB). Our DriveCam page lists recommended cards.' },
  { q: 'How do I install DriveCam?', a: 'Once your policy is issued, DriveCam is shipped by Ekart and usually arrives in 48 to 72 hours. You can track it in the ACKO app. After delivery, tap Set Up in the app. Installing it yourself takes about 15 minutes, or you can book Ready Assist to have it professionally installed for a small fee.' },
  { q: 'Can ACKO or anyone else see my footage?', a: 'No. Recordings stay on your microSD card and under your control. ACKO cannot access them. You share a clip only if you choose to.' },
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

// Videos load only in real browsers. The Figma export runs under automation and gets a clean white frame instead.
// Each clip plays once when it scrolls into view, stops on its last frame, and replays the next time it comes into view.
function ScrollVideo({ src, label, className = '' }) {
  const ref = useRef(null)
  const [live] = useState(() => typeof navigator !== 'undefined' && !navigator.webdriver)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const video = ref.current
    if (!video || reduced) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.currentTime = 0
          video.play().catch(() => {})
        } else {
          video.pause()
          video.currentTime = 0
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [live, reduced])

  return (
    <div role="img" aria-label={label} className={`relative flex aspect-square w-full overflow-hidden rounded-3xl bg-surface-static-white ${className}`}>
      {live && <video ref={ref} src={src} controls={reduced} muted playsInline preload="auto" className="absolute inset-0 size-full object-cover" />}
    </div>
  )
}

function Eyebrow({ children, onDark }) {
  return <Typography textStyle="label-md-semibold" className={onDark ? 'text-text-static-light/70!' : 'text-text-brand-default!'}>{children}</Typography>
}

export default function DriveCamPage() {
  const [form, setForm] = useState({ reg: '', mobile: '', pincode: '', consent: false })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (form.reg.replace(/\s/g, '').length < 6) next.reg = 'Enter your car’s registration number, like KA01AB1234.'
    if (!/^\d{10}$/.test(form.mobile)) next.mobile = 'Enter a 10-digit mobile number.'
    if (!/^\d{6}$/.test(form.pincode)) next.pincode = 'Enter a 6-digit pincode.'
    if (!form.consent) next.consent = true
    setErrors(next)
    if (Object.keys(next).length === 0) setSubmitted(true)
  }

  const go = (id) => document.getElementById(id).scrollIntoView({ block: 'start' })

  return (
    <main aria-label="ACKO DriveCam" data-figma-id="drivecam-home" className="flex min-h-screen w-full flex-col items-center bg-surface-page-secondary">
      <div className="sticky top-12 z-20 flex w-full max-w-[1200px] flex-col items-center px-12 pt-12 md:px-24">
        <header aria-label="Main navigation" data-figma-id="drivecam-header" className={`flex w-full items-center justify-between gap-16 rounded-full bg-surface-card-default py-12 pl-20 pr-12 shadow-s transition-[max-width] duration-300 ease-out motion-reduce:transition-none ${compact ? 'max-w-[340px]' : 'max-w-full'}`}>
          <div className="flex items-center gap-24">
            <Link to="/acko" aria-label="ACKO home" className="flex"><AckoLogo /></Link>
            {!compact && <a href="#drivecam-hero" className="hidden md:flex"><Typography textStyle="label-lg-medium">DriveCam</Typography></a>}
            {!compact && <a href="#drivecam-features" className="hidden md:flex"><Typography textStyle="label-lg-medium">Features</Typography></a>}
            {!compact && <a href="#drivecam-faqs" className="hidden md:flex"><Typography textStyle="label-lg-medium">FAQs</Typography></a>}
          </div>
          <Button variant="primary" size="sm" onClick={() => go('drivecam-early-access')}>Get early access</Button>
        </header>
      </div>

      <section id="drivecam-hero" aria-label="Hero" data-figma-id="drivecam-hero" className="relative flex w-full max-w-[1200px] flex-col items-center px-20 pt-40 lg:min-h-[640px] lg:justify-center lg:px-0 lg:pt-72 xl:min-h-[700px]">
        <div className="relative z-10 flex min-w-0 flex-col items-center gap-20 pb-32 text-center! lg:w-[380px] lg:pb-72 xl:w-[440px] xl:gap-24">
          <div className="flex rounded-full bg-surface-page-static-black px-14 py-6">
            <Typography textStyle="label-md-medium" color="static">Introducing the ACKO DriveCam.</Typography>
          </div>
          <Typography textStyle="display-xl" as="h1" className={`text-center! ${H_HERO}`}>
            An <span className={LIGHT}>industry first</span> premium insurance plan with a dashcam.
          </Typography>
          <Typography textStyle="body-lg-regular" color="secondary" className="max-w-[420px] text-center!">
            ACKO’s most premium insurance plan now with a dashcam.
          </Typography>
          <div aria-label="Key specs" className="flex flex-wrap justify-center gap-8">
            {chips.map((chip) => (
              <div key={chip} className="flex rounded-full border border-border-default-medium px-14 py-6"><Typography textStyle="label-md-medium">{chip}</Typography></div>
            ))}
          </div>
          <Button variant="primary" size="lg" onClick={() => go('drivecam-early-access')}>Get early access</Button>
        </div>

        <div aria-label="DriveCam ambassadors" data-figma-id="drivecam-ambassadors" className="pointer-events-none relative flex h-[260px] w-full shrink-0 lg:absolute lg:inset-0 lg:h-auto">
          <div role="img" aria-label="Ambassador holding the DriveCam" className="absolute bottom-0 left-0 z-0 flex h-[260px] w-[178px] bg-contain bg-bottom bg-no-repeat lg:left-16 lg:h-[440px] lg:w-[301px] xl:left-0 xl:h-[560px] xl:w-[384px]" style={{ backgroundImage: `url(${asset('/drivecam/ambassador-left.webp')})` }}>
          </div>
          <div role="img" aria-label="Second ambassador showing the DriveCam" className="absolute bottom-0 right-0 z-10 flex h-[260px] w-[133px] bg-contain bg-bottom bg-no-repeat lg:right-16 lg:h-[440px] lg:w-[225px] xl:right-0 xl:h-[560px] xl:w-[286px]" style={{ backgroundImage: `url(${asset('/drivecam/ambassador-right.webp')})` }}>
          </div>
        </div>
      </section>

      <section aria-label="Why DriveCam" data-figma-id="drivecam-why" className="flex w-full flex-col items-center bg-surface-page-static-black">
        <div className="h-48 w-1 bg-surface-static-white/25 md:h-64" />
        <div className="flex w-full max-w-[1000px] flex-col items-center gap-24 px-20 py-48 md:gap-32 md:px-24 md:py-72">
          <Typography textStyle="label-md-semibold" as="h2" className="text-center! text-text-static-light/60!">WHY YOU ASK?</Typography>
          <Typography textStyle="display-xl" as="p" className="text-center! text-text-static-light/50! text-[28px]! leading-[35px]! tracking-[-0.6px]! font-normal! md:text-[44px]! md:leading-[54px]!">Insurance helps after an accident.</Typography>
          <Typography textStyle="display-xl" as="p" color="static" className={`text-center! ${H_XL}`}>We built DriveCam for everything before it.</Typography>
        </div>
        <div className="h-48 w-1 bg-surface-static-white/25 md:h-64" />
      </section>

      <section id="drivecam-features" aria-label="Meet the DriveCam" data-figma-id="drivecam-features" className="flex w-full flex-col items-center bg-surface-page-static-white">
        <div className="flex w-full max-w-[1200px] flex-col gap-40 px-20 py-56 md:gap-56 md:px-56 md:py-96">
          <div className="flex flex-col gap-12">
            <Eyebrow>01 / THE DEVICE</Eyebrow>
            <Typography textStyle="display-xl" as="h2" className={`text-text-static-dark! ${H_XL}`}>Meet the DriveCam.</Typography>
          </div>

          <div className="flex flex-col gap-24 md:flex-row md:items-stretch md:gap-48">
            <ScrollVideo src={asset('/drivecam/hero.mp4')} label="DriveCam product film" className="md:w-[520px] md:shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              {stats.map(({ value, label }) => (
                <div key={label} className="flex flex-col gap-16 pt-16">
                  <div className="h-1 w-full bg-surface-static-black/15" />
                  <div className="flex flex-col gap-4">
                    <Typography textStyle="display-xl" as="p" className={`text-text-static-dark! ${H_XL}`}>{value}</Typography>
                    <Typography textStyle="label-md-medium" className="text-text-static-dark/70!">{label}</Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-32 md:flex-row md:gap-16">
            {videoCards.map(({ src, title, description }) => (
              <div key={title} className="flex min-w-0 flex-1 flex-col gap-16">
                <ScrollVideo src={src} label={`${title} video`} />
                <div className="flex flex-col gap-4">
                  <Typography textStyle="heading-lg" as="h3" className={`text-text-static-dark! ${H_CARD}`}>{title}</Typography>
                  <Typography textStyle="body-md-regular" className="text-text-static-dark/70!">{description}</Typography>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:gap-32">
            {benefits.map(({ title, description }) => (
              <div key={title} className="flex min-w-0 flex-1 flex-col gap-16 pt-16">
                <div className="h-1 w-full bg-surface-static-black/15" />
                <div className="flex flex-col gap-4 pb-16">
                  <Typography textStyle="heading-lg" as="h3" className={`text-text-static-dark! ${H_CARD}`}>{title}</Typography>
                  <Typography textStyle="body-md-regular" className="text-text-static-dark/70!">{description}</Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="drivecam-early-access" aria-label="Early access" data-figma-id="drivecam-early-access" className="flex w-full flex-col items-center bg-surface-page-primary">
        <div className="flex w-full max-w-[1200px] flex-col gap-40 px-20 py-56 md:flex-row md:items-start md:gap-72 md:px-56 md:py-96">
          <div className="flex min-w-0 flex-1 flex-col gap-16">
            <Eyebrow>EARLY ACCESS</Eyebrow>
            <Typography textStyle="display-xl" as="h2" className={H_XL}>Be first to get <span className={LIGHT}>DriveCam.</span></Typography>
            <Typography textStyle="body-lg-regular" color="secondary" className="max-w-[360px]">
              Join the list. We’ll invite customers in phases.
            </Typography>
          </div>

          {submitted ? (
            <div role="status" aria-label="Early access request submitted" className="flex min-w-0 flex-1 flex-col items-start gap-16 rounded-3xl bg-surface-card-default p-24 md:p-32">
              <CircleCheck className="size-32 text-text-brand-default" aria-hidden="true" />
              <Typography textStyle="heading-lg" as="h3">You’re on the list</Typography>
              <Typography textStyle="body-md-regular" color="secondary">We’ll message you when access opens.</Typography>
            </div>
          ) : (
            <form aria-label="Join DriveCam early access" onSubmit={submit} noValidate className="flex min-w-0 flex-1 flex-col gap-20 rounded-3xl bg-surface-card-default p-24 md:p-32">
              <TextInput label="Car registration number" inputType="registrationNumber" placeholder="KA01AB1234" value={form.reg} onChange={set('reg')} errorText={errors.reg} required />
              <TextInput label="Mobile number" inputType="phone" placeholder="10 digits" value={form.mobile} onChange={set('mobile')} errorText={errors.mobile} required />
              <TextInput label="Pincode" inputType="pincode" placeholder="6 digits" value={form.pincode} onChange={set('pincode')} errorText={errors.pincode} required />
              <Checkbox
                size="sm"
                checked={form.consent}
                error={Boolean(errors.consent)}
                onChange={(checked) => setForm((f) => ({ ...f, consent: checked }))}
                label="I agree to ACKO contacting me about DriveCam and ACKO car insurance by call, SMS, WhatsApp and email, even if my number is on DND, and I accept the Privacy Policy."
              />
              <Button variant="primary" size="lg" type="submit" fullWidth>Join early access</Button>
              <Typography textStyle="body-sm-regular" color="secondary" className="text-center!">No payment needed.</Typography>
            </form>
          )}
        </div>
      </section>

      <section id="drivecam-faqs" aria-label="Frequently asked questions" data-figma-id="drivecam-faqs" className="flex w-full flex-col items-center bg-surface-page-secondary">
        <div className="flex w-full max-w-[1200px] flex-col gap-32 px-20 py-56 md:flex-row md:gap-72 md:px-56 md:py-96">
          <div className="flex flex-col gap-12 md:w-[300px] md:shrink-0">
            <Eyebrow>FAQS</Eyebrow>
            <Typography textStyle="display-xl" as="h2" className={H_XL}>Questions, answered.</Typography>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <Accordion type="single" size="md" defaultValue="faq-0">
              {faqs.map(({ q, a }, i) => (
                <AccordionItem key={q} value={`faq-${i}`} title={q}>{a}</AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <footer aria-label="ACKO footer" data-figma-id="drivecam-footer" className="flex w-full flex-col items-center bg-surface-page-static-black">
        <div className="flex w-full max-w-[1200px] flex-col gap-24 px-20 py-40 md:px-56">
          <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
            <AckoLogo textFill="#ffffff" />
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-24">
              <a href="#drivecam-hero" className="flex"><Typography textStyle="label-md-medium" color="static">Car insurance</Typography></a>
              <a href="#drivecam-hero" className="flex"><Typography textStyle="label-md-medium" color="static">DriveCam</Typography></a>
              <a href="#drivecam-faqs" className="flex"><Typography textStyle="label-md-medium" color="static">Contact us</Typography></a>
              <a href="#drivecam-faqs" className="flex"><Typography textStyle="label-md-medium" color="static">Privacy policy</Typography></a>
              <a href="#drivecam-faqs" className="flex"><Typography textStyle="label-md-medium" color="static">Terms &amp; conditions</Typography></a>
            </nav>
          </div>
          <div className="h-1 w-full bg-surface-static-white/15" />
          <div className="flex flex-col gap-8">
            <Typography textStyle="body-sm-regular" className="text-text-static-light/70!">
              Insurance is the subject matter of solicitation. ACKO General Insurance Limited. [IRDAI registration number and CIN to be added by Legal]. DriveCam with ACKO car insurance is available to eligible customers, in phases. DriveCam is not covered under the insurance policy. DriveCam app features are available while you have an active ACKO policy. Images are for illustration only.
            </Typography>
            <Typography textStyle="body-sm-regular" className="text-text-static-light/70!">
              Coverage, benefits and exclusions are as per the policy wording. Please read the policy document carefully before buying.
            </Typography>
          </div>
        </div>
      </footer>
    </main>
  )
}

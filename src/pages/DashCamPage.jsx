import { Link } from 'react-router-dom'
import { Button } from '@acko/button'
import { Card } from '@acko/card'
import { Typography } from '@acko/typography'
import { ArrowDown, CircleCheck, FileCheck, Moon, RefreshCw, ShieldCheck, Smartphone, Video, Zap } from 'lucide-react'

const features = [
  { Icon: Video, title: 'Clear Full HD video', description: 'Records the road ahead in sharp detail, so plates and signals are easy to read.' },
  { Icon: Moon, title: 'Sees at night', description: 'Built to capture clear footage in low light, on dim streets and at dusk.' },
  { Icon: RefreshCw, title: 'Records on a loop', description: 'Old footage is replaced automatically, so you never have to clear space.' },
  { Icon: Zap, title: 'Saves what matters', description: 'A sudden jolt locks the clip, so footage from an incident is never overwritten.' },
  { Icon: Smartphone, title: 'Watch on your phone', description: 'View and share clips from the ACKO app. No cables or memory card readers.' },
  { Icon: FileCheck, title: 'Backup for your claim', description: 'Show exactly what happened with video, so a claim has facts behind it.' },
]

const steps = [
  { number: '1', title: 'Order your dash cam', description: 'Add it to your car insurance or buy it on its own.' },
  { number: '2', title: 'Get it installed', description: 'Fit it yourself in minutes, or book a visit from our team.' },
  { number: '3', title: 'Drive with backup', description: 'It records every trip. Open the app any time to watch a clip.' },
]

const faqs = [
  { q: 'Do I need ACKO insurance to buy it?', a: 'No. You can buy the dash cam on its own. It works with any car.' },
  { q: 'Will it drain my car battery?', a: 'No. It records while the car is on and stops when you switch off.' },
  { q: 'What if I need footage for a claim?', a: 'Open the app, pick the clip and share it with us. It becomes part of your claim.' },
]

export default function DashCamPage() {
  const goToFeatures = () => {
    document.getElementById('dashcam-features').scrollIntoView({ block: 'start' })
  }

  return (
    <main aria-label="ACKO dash cam" data-figma-id="dashcam-home" className="flex min-h-screen w-full flex-col items-center bg-surface-page-primary">
      <header aria-label="Main navigation" data-figma-id="dashcam-header" className="flex w-full max-w-[1200px] items-center justify-between gap-16 px-20 py-20 md:px-40">
        <Link to="/acko" aria-label="ACKO home" className="flex items-center gap-8">
          <ShieldCheck className="size-28 text-text-brand-default" aria-hidden="true" />
          <Typography textStyle="heading-lg" as="span" className="text-text-brand-default!">ACKO</Typography>
        </Link>
        <nav aria-label="Dash cam navigation" className="flex items-center gap-32">
          <a href="#dashcam-how" className="hidden md:flex"><Typography textStyle="label-md-semibold">How it works</Typography></a>
          <a href="#dashcam-faq" className="hidden md:flex"><Typography textStyle="label-md-semibold">FAQs</Typography></a>
          <Button variant="secondary" size="sm" onClick={goToFeatures}>See features</Button>
        </nav>
      </header>

      <div className="flex w-full max-w-[1200px] flex-col gap-48 px-20 pb-32 md:gap-64 md:px-40 md:pb-40">
        <section aria-label="Hero" data-figma-id="dashcam-hero" className="flex flex-col gap-32 rounded-3xl bg-surface-brand-strong p-24 md:flex-row md:items-center md:gap-48 md:p-48">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-24">
            <Typography textStyle="label-sm-semibold" color="static">ACKO DASH CAM</Typography>
            <Typography textStyle="display-md" as="h1" color="static">See what happened. Every drive.</Typography>
            <Typography textStyle="body-lg-regular" color="static">A dash cam that records the road, saves important moments, and gives you proof when you need it.</Typography>
            <div className="flex flex-col items-start gap-12 sm:flex-row sm:items-center">
              <Button variant="primary-on-dark" size="md">Buy dash cam</Button>
              <Button variant="secondary-on-dark" size="md" iconRight={<ArrowDown />} onClick={goToFeatures}>See features</Button>
            </div>
          </div>
          <div aria-label="Dash cam highlights" data-figma-id="dashcam-hero-cards" className="flex min-w-0 flex-col gap-12 md:w-[340px]">
            <div className="flex items-center gap-16 rounded-2xl bg-surface-card-default p-20">
              <div className="flex size-56 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle"><Video className="size-28 text-text-brand-default" aria-hidden="true" /></div>
              <div className="flex flex-1 flex-col gap-4"><Typography textStyle="label-lg-semibold">Full HD recording</Typography><Typography textStyle="body-sm-regular" color="secondary">Day and night.</Typography></div>
            </div>
            <div className="flex gap-12">
              <div className="flex min-w-0 flex-1 flex-col gap-16 rounded-2xl bg-surface-card-default p-20">
                <Zap className="size-32 text-text-brand-default" aria-hidden="true" />
                <Typography textStyle="label-lg-semibold">Auto-save</Typography>
                <Typography textStyle="body-sm-regular" color="secondary">Locks clips on impact.</Typography>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-16 rounded-2xl bg-surface-card-default p-20">
                <Smartphone className="size-32 text-text-brand-default" aria-hidden="true" />
                <Typography textStyle="label-lg-semibold">In the app</Typography>
                <Typography textStyle="body-sm-regular" color="secondary">Watch and share.</Typography>
              </div>
            </div>
          </div>
        </section>

        <section id="dashcam-features" aria-label="Features" data-figma-id="dashcam-features" className="flex flex-col gap-24">
          <div className="flex flex-col gap-8">
            <Typography textStyle="label-sm-semibold" className="text-text-brand-default!">WHY GET ONE</Typography>
            <Typography textStyle="heading-xl" as="h2">Proof, when you need it</Typography>
            <Typography textStyle="body-md-regular" color="secondary">Everything you need from a dash cam, and nothing you don’t.</Typography>
          </div>
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-16 lg:flex-row">
              {features.slice(0, 3).map(({ Icon, title, description }) => (
                <Card key={title} variant="secondary" className="flex min-w-0 flex-col items-start gap-16 p-24 lg:flex-1">
                  <div className="flex size-48 items-center justify-center rounded-xl bg-surface-brand-subtle"><Icon className="size-24 text-text-brand-default" aria-hidden="true" /></div>
                  <div className="flex flex-col gap-8"><Typography textStyle="heading-md" as="h3">{title}</Typography><Typography textStyle="body-sm-regular" color="secondary">{description}</Typography></div>
                </Card>
              ))}
            </div>
            <div className="flex flex-col gap-16 lg:flex-row">
              {features.slice(3).map(({ Icon, title, description }) => (
                <Card key={title} variant="secondary" className="flex min-w-0 flex-col items-start gap-16 p-24 lg:flex-1">
                  <div className="flex size-48 items-center justify-center rounded-xl bg-surface-brand-subtle"><Icon className="size-24 text-text-brand-default" aria-hidden="true" /></div>
                  <div className="flex flex-col gap-8"><Typography textStyle="heading-md" as="h3">{title}</Typography><Typography textStyle="body-sm-regular" color="secondary">{description}</Typography></div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="dashcam-how" aria-label="How it works" data-figma-id="dashcam-how" className="flex flex-col gap-32 rounded-3xl bg-surface-page-secondary p-24 md:p-40">
          <div className="flex flex-col gap-8">
            <Typography textStyle="label-sm-semibold" className="text-text-brand-default!">HOW IT WORKS</Typography>
            <Typography textStyle="heading-xl" as="h2">Up and running in three steps</Typography>
          </div>
          <div className="flex flex-col gap-32 md:flex-row">
            {steps.map(({ number, title, description }) => (
              <div key={number} className="flex min-w-0 flex-1 flex-col gap-12">
                <div className="flex size-40 items-center justify-center rounded-full bg-surface-brand-strong"><Typography textStyle="label-lg-semibold" color="static">{number}</Typography></div>
                <Typography textStyle="heading-md" as="h3">{title}</Typography>
                <Typography textStyle="body-md-regular" color="secondary">{description}</Typography>
              </div>
            ))}
          </div>
        </section>

        <section id="dashcam-faq" aria-label="Frequently asked questions" data-figma-id="dashcam-faq" className="flex flex-col gap-24">
          <div className="flex flex-col gap-8">
            <Typography textStyle="label-sm-semibold" className="text-text-brand-default!">FAQS</Typography>
            <Typography textStyle="heading-xl" as="h2">Questions? Answered.</Typography>
          </div>
          <div className="flex flex-col gap-16 md:flex-row">
            {faqs.map(({ q, a }) => (
              <div key={q} className="flex min-w-0 flex-1 flex-col gap-8">
                <div className="flex items-start gap-8"><CircleCheck className="size-20 shrink-0 text-text-brand-default" aria-hidden="true" /><Typography textStyle="label-lg-semibold" as="h3">{q}</Typography></div>
                <Typography textStyle="body-md-regular" color="secondary">{a}</Typography>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Buy dash cam" data-figma-id="dashcam-final-cta" className="flex flex-col items-start gap-24 rounded-3xl bg-surface-brand-subtle p-24 md:flex-row md:items-center md:justify-between md:p-40">
          <div className="flex min-w-0 flex-1 flex-col gap-8"><Typography textStyle="heading-xl" as="h2">Drive with proof on your side.</Typography><Typography textStyle="body-md-regular" color="secondary">Get the ACKO dash cam and know exactly what happened on the road.</Typography></div>
          <Button variant="primary" size="md">Buy dash cam</Button>
        </section>

        <footer aria-label="ACKO footer" className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4"><Typography textStyle="heading-md" as="span" className="text-text-brand-default!">ACKO</Typography><Typography textStyle="body-sm-regular" color="secondary">Life is yours. Live it.</Typography></div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-24">
            <a href="#dashcam-features" className="flex"><Typography textStyle="label-sm-medium">Features</Typography></a>
            <a href="#dashcam-how" className="flex"><Typography textStyle="label-sm-medium">How it works</Typography></a>
            <Link to="/acko" className="flex"><Typography textStyle="label-sm-medium">ACKO home</Typography></Link>
          </nav>
        </footer>
      </div>
    </main>
  )
}

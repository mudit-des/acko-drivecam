import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@acko/button'
import { Card } from '@acko/card'
import { Typography } from '@acko/typography'
import { ArrowDown, ArrowUpRight, Bike, Car, Heart, Plane, ShieldCheck, Sparkles, CircleCheck, MessageCircle, SlidersHorizontal } from 'lucide-react'

const products = [
  { id: 'car', name: 'Car insurance', caption: 'For every road ahead.', Icon: Car, detail: 'Your daily commute. Your next road trip. Explore insurance for the car that takes you there.' },
  { id: 'bike', name: 'Bike insurance', caption: 'Keep your everyday moving.', Icon: Bike, detail: 'From quick errands to weekend rides, start exploring insurance for your two-wheeler.' },
  { id: 'health', name: 'Health insurance', caption: 'Put your people first.', Icon: Heart, detail: 'Take the next step towards health cover for you and your family. Explore our health insurance page.' },
  { id: 'travel', name: 'Travel insurance', caption: 'More exploring. Less worrying.', Icon: Plane, detail: 'A new city. A new adventure. Start exploring insurance for your next trip.' },
]

const benefits = [
  { Icon: SlidersHorizontal, title: 'Your life. Your choice.', description: 'Start with what matters to you. Explore cover for your health, your wheels, or your next adventure.' },
  { Icon: MessageCircle, title: 'Keep it understandable.', description: 'A little clarity goes a long way. Make room for the details, and for your questions.' },
  { Icon: Sparkles, title: 'Make room for living.', description: 'Insurance is one part of the picture. The people, places, and plans you love are the rest.' },
]

export default function AckoLandingPage() {
  const [expanded, setExpanded] = useState(null)
  const explore = () => {
    document.getElementById('acko-products').scrollIntoView({ block: 'start' })
    document.getElementById('acko-products-title').focus({ preventScroll: true })
  }

  return (
    <main aria-label="ACKO insurance homepage" data-figma-id="acko-home" className="flex min-h-screen w-full flex-col items-center bg-surface-page-primary">
      <header aria-label="Main navigation" data-figma-id="acko-header" className="flex w-full max-w-[1200px] items-center justify-between gap-16 px-20 py-20 md:px-40">
        <Link to="/acko" aria-label="ACKO home" className="flex items-center gap-8">
          <ShieldCheck className="size-28 text-text-brand-default" aria-hidden="true" />
          <Typography textStyle="heading-lg" as="span" className="text-text-brand-default!">ACKO</Typography>
        </Link>
        <nav aria-label="Explore ACKO" className="flex items-center gap-32">
          <a href="#acko-benefits" className="hidden md:flex"><Typography textStyle="label-md-semibold">Why ACKO</Typography></a>
          <Button variant="secondary" size="sm" onClick={explore}>Explore insurance</Button>
        </nav>
      </header>

      <div className="flex w-full max-w-[1200px] flex-col gap-48 px-20 pb-32 md:gap-64 md:px-40 md:pb-40">
        <section aria-label="Life happens. ACKO has your back." data-figma-id="acko-hero" className="flex flex-col gap-32 rounded-3xl bg-surface-brand-strong p-24 md:flex-row md:items-center md:gap-48 md:p-48">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-24">
            <div className="flex items-center gap-8">
              <Sparkles className="size-16 text-text-static-light" aria-hidden="true" />
              <Typography textStyle="label-sm-semibold" color="static">A LITTLE COVER. A LOT OF POSSIBILITY.</Typography>
            </div>
            <Typography textStyle="display-md" as="h1" color="static">Life happens. Live it fully.</Typography>
            <Typography textStyle="body-lg-regular" color="static">For the people you love, the roads you take, and everything that comes next. Find your kind of cover with ACKO.</Typography>
            <Button variant="primary-on-dark" size="md" iconRight={<ArrowDown />} onClick={explore}>Find your cover</Button>
          </div>
          <div aria-label="Cover for every part of life" data-figma-id="acko-hero-cards" className="flex min-w-0 flex-col gap-12 md:w-[340px]">
            <div className="flex items-center gap-16 rounded-2xl bg-surface-card-default p-20">
              <div className="flex size-56 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle"><Heart className="size-28 text-text-brand-default" aria-hidden="true" /></div>
              <div className="flex flex-1 flex-col gap-4"><Typography textStyle="label-lg-semibold">Your people</Typography><Typography textStyle="body-sm-regular" color="secondary">The heart of your world.</Typography></div>
            </div>
            <div className="flex gap-12">
              <div className="flex min-w-0 flex-1 flex-col gap-16 rounded-2xl bg-surface-card-default p-20">
                <Car className="size-32 text-text-brand-default" aria-hidden="true" />
                <Typography textStyle="label-lg-semibold">Your everyday</Typography>
                <Typography textStyle="body-sm-regular" color="secondary">Go your own way.</Typography>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-16 rounded-2xl bg-surface-card-default p-20">
                <Plane className="size-32 text-text-brand-default" aria-hidden="true" />
                <Typography textStyle="label-lg-semibold">Your next chapter</Typography>
                <Typography textStyle="body-sm-regular" color="secondary">Make new memories.</Typography>
              </div>
            </div>
            <div className="flex items-center justify-center gap-8 py-4"><CircleCheck className="size-16 text-text-static-light" aria-hidden="true" /><Typography textStyle="label-sm-medium" color="static">Big plans begin with a little peace of mind.</Typography></div>
          </div>
        </section>

        <section id="acko-products" aria-label="Find your insurance" data-figma-id="acko-products" className="flex flex-col gap-24">
          <div className="flex flex-col gap-8">
            <Typography textStyle="label-sm-semibold" className="text-text-brand-default!">COVER FOR YOUR KIND OF LIFE</Typography>
            <Typography id="acko-products-title" tabIndex={-1} textStyle="heading-xl" as="h2">What matters to you?</Typography>
            <Typography textStyle="body-md-regular" color="secondary">Pick a place to start. We’ll take it from there.</Typography>
          </div>
          <div className="flex flex-col gap-16 lg:flex-row">
            {products.map(({ id, name, caption, Icon, detail }) => (
              <Card key={id} variant="secondary" data-figma-id={`acko-product-${id}`} className="flex min-w-0 flex-col items-start gap-20 p-24 lg:flex-1">
                <div className="flex size-48 items-center justify-center rounded-xl bg-surface-brand-subtle"><Icon className="size-24 text-text-brand-default" aria-hidden="true" /></div>
                <div className="flex flex-1 flex-col gap-8"><Typography textStyle="heading-md" as="h3">{name}</Typography><Typography textStyle="body-sm-regular" color="secondary">{caption}</Typography></div>
                <Button variant="secondary" size="sm" aria-label={`${expanded === id ? 'Close' : 'Explore'} ${name.toLowerCase()}`} aria-expanded={expanded === id} aria-controls={`acko-detail-${id}`} onClick={() => setExpanded(expanded === id ? null : id)}>{expanded === id ? 'Close details' : 'Explore'}</Button>
                <div id={`acko-detail-${id}`} className={expanded === id ? 'flex flex-col gap-12' : 'hidden'}>
                  <Typography textStyle="body-sm-regular" color="secondary">{detail}</Typography>
                  {id === 'health' && <Link to="/health-insurance" className="flex items-center gap-8 text-text-brand-default"><Typography textStyle="label-sm-semibold" className="text-text-brand-default!">Explore health cover</Typography><ArrowUpRight className="size-16" aria-hidden="true" /></Link>}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="acko-benefits" aria-label="Why ACKO" data-figma-id="acko-benefits" className="flex flex-col gap-32 rounded-3xl bg-surface-page-secondary p-24 md:p-40">
          <div className="flex flex-col gap-8"><Typography textStyle="label-sm-semibold" className="text-text-brand-default!">THE ACKO WAY</Typography><Typography textStyle="heading-xl" as="h2">Less complicated. More you.</Typography></div>
          <div className="flex flex-col gap-32 md:flex-row">
            {benefits.map(({ Icon, title, description }) => (
              <div key={title} className="flex min-w-0 flex-1 flex-col gap-12">
                <Icon className="size-24 text-text-brand-default" aria-hidden="true" />
                <Typography textStyle="heading-md" as="h3">{title}</Typography>
                <Typography textStyle="body-md-regular" color="secondary">{description}</Typography>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Start exploring cover" data-figma-id="acko-final-cta" className="flex flex-col items-start gap-24 rounded-3xl bg-surface-brand-subtle p-24 md:flex-row md:items-center md:justify-between md:p-40">
          <div className="flex min-w-0 flex-1 flex-col gap-8"><Typography textStyle="heading-xl" as="h2">Your next chapter starts here.</Typography><Typography textStyle="body-md-regular" color="secondary">Let’s find a little cover for your big plans.</Typography></div>
          <Button variant="primary" size="md" onClick={explore}>Explore insurance</Button>
        </section>

        <footer aria-label="ACKO footer" className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4"><Typography textStyle="heading-md" as="span" className="text-text-brand-default!">ACKO</Typography><Typography textStyle="body-sm-regular" color="secondary">Life is yours. Live it.</Typography></div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-24">
            <a href="#acko-products" className="flex"><Typography textStyle="label-sm-medium">Explore insurance</Typography></a>
            <a href="#acko-benefits" className="flex"><Typography textStyle="label-sm-medium">Why ACKO</Typography></a>
            <Link to="/health-insurance" className="flex"><Typography textStyle="label-sm-medium">Health insurance</Typography></Link>
          </nav>
        </footer>
      </div>
    </main>
  )
}

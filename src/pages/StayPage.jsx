import { useState } from 'react'
import { Accordion, AccordionItem } from '@acko/accordion'
import { Avatar } from '@acko/avatar'
import { Badge, CounterBadge } from '@acko/badge'
import { Breadcrumb } from '@acko/breadcrumb'
import { Button } from '@acko/button'
import { DateInput } from '@acko/calendar'
import { Card } from '@acko/card'
import { Checkbox } from '@acko/checkbox'
import { Chip } from '@acko/chip'
import { Dropdown } from '@acko/dropdown'
import { RadioGroup } from '@acko/radio'
import { Separator } from '@acko/separator'
import { Textarea } from '@acko/textarea'
import { Typography } from '@acko/typography'
import {
  Award,
  Bath,
  BedDouble,
  Car,
  Clock,
  Coffee,
  DoorOpen,
  Dumbbell,
  Images,
  KeyRound,
  MapPin,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  TreePalm,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Wifi,
} from 'lucide-react'

// Fixed dates, prices and reviews keep the Figma export deterministic.
const CHECK_IN = new Date(2026, 10, 14)
const CHECK_OUT = new Date(2026, 10, 17)
const EARLIEST = new Date(2026, 10, 1)
const NIGHTS = 3
const AIRPORT_PICKUP = 1200

const gallery = [
  { id: 'pool', label: 'Courtyard pool', Icon: Sun, tone: 'bg-solid-blue-100 text-solid-blue-700' },
  { id: 'bedroom', label: 'Garden suite', Icon: BedDouble, tone: 'bg-solid-purple-100 text-solid-purple-700' },
  { id: 'bath', label: 'Open-air bath', Icon: Bath, tone: 'bg-solid-amber-100 text-solid-amber-700' },
  { id: 'dining', label: 'Breakfast verandah', Icon: UtensilsCrossed, tone: 'bg-solid-orange-100 text-solid-orange-700' },
  { id: 'garden', label: 'Palm garden', Icon: TreePalm, tone: 'bg-solid-grey-150 text-solid-grey-700' },
]

const highlights = [
  { Icon: Award, title: 'Priya is a Superhost', detail: 'Rated 4.9 or higher by guests for 6 years' },
  { Icon: KeyRound, title: 'Self check-in', detail: 'Collect the keys from the lockbox after 2 pm' },
  { Icon: Sparkles, title: 'Spotless last 30 stays', detail: 'Every recent guest rated cleanliness 5 stars' },
]

const amenities = [
  { label: 'Fast Wi-Fi · 150 Mbps', Icon: Wifi },
  { label: 'Air conditioning', Icon: Snowflake },
  { label: 'Free parking on site', Icon: Car },
  { label: 'Breakfast included', Icon: Coffee },
  { label: 'Smart TV with Netflix', Icon: Tv },
  { label: 'Washing machine', Icon: WashingMachine },
  { label: 'Shared pool', Icon: Sun },
  { label: 'Small gym', Icon: Dumbbell },
  { label: 'Private entrance', Icon: DoorOpen },
]

const rooms = [
  { value: 'garden', label: 'Garden suite · ₹8,400 a night', description: '1 king bed, open-air bath, opens onto the palm garden. Sleeps 2.' },
  { value: 'loft', label: 'Courtyard loft · ₹10,900 a night', description: '1 king bed and 1 sofa bed, mezzanine reading nook. Sleeps 3.' },
  { value: 'family', label: 'Family villa · ₹15,600 a night', description: '2 bedrooms, kitchenette, private plunge pool. Sleeps 5.' },
]
const roomRates = { garden: 8400, loft: 10900, family: 15600 }

const guestOptions = [
  { value: '1', label: '1 guest' },
  { value: '2', label: '2 guests' },
  { value: '3', label: '3 guests' },
  { value: '4', label: '4 guests' },
  { value: '5', label: '5 guests' },
]

const ratingBreakdown = [
  { label: 'Cleanliness', score: 4.9 },
  { label: 'Accuracy', score: 4.8 },
  { label: 'Check-in', score: 4.9 },
  { label: 'Communication', score: 5.0 },
  { label: 'Location', score: 4.6 },
  { label: 'Value', score: 4.7 },
]

const reviewTopics = [
  { label: 'Breakfast', count: 64 },
  { label: 'Pool', count: 41 },
  { label: 'Quiet', count: 37 },
  { label: 'Host', count: 88 },
  { label: 'Beaches nearby', count: 29 },
]

const reviews = [
  { initials: 'AM', name: 'Aditi Menon', meta: 'Mumbai · October 2026', stay: '4 nights', text: 'The courtyard is magical in the evening, with the lamps lit around the pool. Priya left a hand-drawn map of the best cafés in Assagao and every single one was worth it. Breakfast on the verandah was the highlight of the trip.' },
  { initials: 'JR', name: 'James Rodrigues', meta: 'London · September 2026', stay: '1 week', text: 'Quiet, green and beautifully kept. The garden suite bath is open to the sky, which felt special during the light monsoon showers. Wi-Fi was fast enough for video calls every morning, so I could work from the verandah.' },
  { initials: 'SK', name: 'Sneha Kulkarni', meta: 'Pune · September 2026', stay: '3 nights', text: 'We came for a long weekend and wished we had stayed longer. Anjuna and Vagator are a short scooter ride away, but the house itself is so calm we spent most afternoons by the pool with a book.' },
  { initials: 'DV', name: 'Daniel Vaz', meta: 'Bengaluru · August 2026', stay: '5 nights', text: 'Check-in was effortless and Priya answered every message within minutes. The family villa was spotless and the plunge pool kept the kids busy. Only note: the lane is narrow, so a small car is easier.' },
]

const policies = [
  { value: 'checkin', title: 'Check-in and check-out', body: 'Check-in after 2 pm with self check-in from a lockbox. Check-out before 11 am. Early check-in on request, subject to availability.' },
  { value: 'cancellation', title: 'Free cancellation before 7 Nov', body: 'Cancel before 7 Nov 2026 for a full refund. After that, the first night is non-refundable; the rest is refunded if you cancel at least 24 hours before check-in.' },
  { value: 'rules', title: 'House rules', body: 'No parties or events. Quiet hours from 10 pm to 7 am. Pets are welcome in the family villa with a ₹1,500 cleaning fee.' },
  { value: 'safety', title: 'Safety and property', body: 'Smoke alarm, carbon monoxide alarm and first-aid kit in every room. The shared pool has no lifeguard and no fence.' },
]

const similarStays = [
  { id: 's1', name: 'Casa Azul, Siolim', price: '₹7,200', rating: '4.91', tone: 'bg-solid-blue-100 text-solid-blue-700', Icon: Sun, badge: 'Guest favourite' },
  { id: 's2', name: 'The Mango Tree Villa', price: '₹12,500', rating: '4.86', tone: 'bg-solid-amber-100 text-solid-amber-700', Icon: TreePalm, badge: 'New' },
  { id: 's3', name: 'Laterite Loft, Anjuna', price: '₹6,100', rating: '4.78', tone: 'bg-solid-orange-100 text-solid-orange-700', Icon: BedDouble, badge: 'Rare find' },
  { id: 's4', name: 'Monsoon House, Parra', price: '₹9,800', rating: '4.93', tone: 'bg-solid-purple-100 text-solid-purple-700', Icon: Bath, badge: 'Guest favourite' },
  { id: 's5', name: 'Saligao Garden Cottage', price: '₹5,400', rating: '4.74', tone: 'bg-solid-grey-150 text-solid-grey-700', Icon: Coffee, badge: 'Breakfast' },
]
const badgeColor = { 'Guest favourite': 'purple', New: 'green', 'Rare find': 'orange', Breakfast: 'blue' }

const rupees = (amount) => `₹${Math.round(amount).toLocaleString('en-IN')}`

function Section({ title, children, action }) {
  return (
    <section aria-label={title} className="flex flex-col gap-16">
      <div className="flex items-center justify-between gap-12">
        <Typography textStyle="heading-lg" as="h2">{title}</Typography>
        {action}
      </div>
      {children}
    </section>
  )
}

function PhotoTile({ photo, className = '' }) {
  const { Icon } = photo
  return (
    <div aria-label={photo.label} className={`flex flex-col items-center justify-center gap-8 rounded-2xl ${photo.tone} ${className}`}>
      <Icon className="size-32" aria-hidden="true" />
      <Typography textStyle="label-sm-medium" className="text-current!">{photo.label}</Typography>
    </div>
  )
}

function PriceRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-12">
      <Typography textStyle={strong ? 'label-md-semibold' : 'body-sm-regular'} color={strong ? 'primary' : 'secondary'}>{label}</Typography>
      <Typography textStyle={strong ? 'heading-sm' : 'label-md-semibold'}>{value}</Typography>
    </div>
  )
}

function StayPage() {
  const [checkIn, setCheckIn] = useState(CHECK_IN)
  const [checkOut, setCheckOut] = useState(CHECK_OUT)
  const [guests, setGuests] = useState('2')
  const [room, setRoom] = useState('garden')
  const [pickup, setPickup] = useState(true)
  const [topic, setTopic] = useState('Host')

  const nightly = roomRates[room]
  const stayCost = nightly * NIGHTS
  const cleaning = 900
  const serviceFee = Math.round(stayCost * 0.08)
  const taxes = Math.round((stayCost + cleaning) * 0.12)
  const total = stayCost + cleaning + serviceFee + taxes + (pickup ? AIRPORT_PICKUP : 0)

  const reserveButton = <Button variant="primary" size="lg" fullWidth>Reserve</Button>

  return (
    <main aria-label="The Courtyard House" data-figma-id="stay" className="flex min-h-screen w-full flex-col items-center bg-surface-page-primary">
      <div className="flex w-full max-w-[480px] flex-col gap-32 px-16 pt-16 pb-32 lg:max-w-[1200px] lg:px-40 lg:pt-24 lg:pb-48">
        <header aria-label="Header" data-figma-id="stay-header" className="flex flex-col gap-12">
          {/* At most 3 items: the Figma Breadcrumb has only two parent links. */}
          <Breadcrumb
            size="sm"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Goa stays', href: '/' },
              { label: 'The Courtyard House' },
            ]}
          />
          <Typography textStyle="heading-xl" as="h1">The Courtyard House — garden suites in Assagao</Typography>
          <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
            <div className="flex items-center gap-4">
              <Star className="size-16 text-text-primary" aria-hidden="true" />
              <Typography textStyle="label-md-semibold">4.82</Typography>
              <Typography textStyle="body-sm-regular" color="secondary">· 312 reviews</Typography>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="size-16 text-text-secondary" aria-hidden="true" />
              <Typography textStyle="body-sm-regular" color="secondary">Assagao, North Goa</Typography>
            </div>
            <Badge color="purple" size="sm">Guest favourite</Badge>
            <Badge color="green" size="sm">Free cancellation</Badge>
          </div>
        </header>

        {/* Gallery: one large tile and a 2 × 2 equal grid on desktop; one tile on mobile. */}
        <section aria-label="Photos" data-figma-id="stay-gallery" className="flex flex-col gap-8 lg:h-[400px] lg:flex-row">
          <div className="relative flex h-[240px] lg:h-auto lg:flex-1">
            <PhotoTile photo={gallery[0]} className="flex-1" />
            <div className="absolute right-12 bottom-12 flex items-center gap-8 rounded-full bg-surface-card-default px-12 py-6 shadow-s">
              <Images className="size-16 text-text-primary" aria-hidden="true" />
              <Typography textStyle="label-sm-semibold">All photos</Typography>
              <CounterBadge count={16} color="black" size="sm" />
            </div>
          </div>
          <div className="hidden grid-cols-2 gap-8 lg:grid lg:flex-1">
            {gallery.slice(1).map((photo) => <PhotoTile key={photo.id} photo={photo} />)}
          </div>
        </section>

        <div className="flex flex-col gap-40 lg:flex-row lg:items-start lg:gap-48">
          <div aria-label="Details" className="flex min-w-0 flex-col gap-32 lg:flex-1">
            <section aria-label="Host" className="flex items-center gap-16">
              <Avatar size={48} initials="PF" alt="Priya Fernandes" online />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Typography textStyle="label-lg-semibold">Hosted by Priya Fernandes</Typography>
                <Typography textStyle="body-sm-regular" color="secondary">Superhost · 6 years hosting · speaks English, Konkani, Hindi</Typography>
              </div>
              <Badge color="purple" size="md">Superhost</Badge>
            </section>

            <Separator orientation="horizontal" variant="default" />

            <section aria-label="Highlights" className="flex flex-col gap-20">
              {highlights.map(({ Icon, title, detail }) => (
                <div key={title} className="flex items-start gap-16">
                  <div className="flex size-40 items-center justify-center rounded-full bg-surface-brand-subtle text-text-brand-default">
                    <Icon className="size-20" aria-hidden="true" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Typography textStyle="label-md-semibold">{title}</Typography>
                    <Typography textStyle="body-sm-regular" color="secondary">{detail}</Typography>
                  </div>
                </div>
              ))}
            </section>

            <Separator orientation="horizontal" variant="default" />

            <Section title="About this place">
              <Typography textStyle="body-md-regular">
                A restored <strong>1920s Portuguese house</strong> around a shaded courtyard pool, ten minutes from Anjuna and Vagator beaches. Three suites open onto a palm garden, breakfast is cooked to order on the verandah, and the village has some of Goa's best cafés. Read the <a href="/" className="text-text-link-default underline">full house guide</a> before you arrive.
              </Typography>
            </Section>

            <Section title="What this place offers" action={<Button variant="secondary" size="sm">Show all 32</Button>}>
              <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
                {amenities.map(({ label, Icon }) => (
                  <div key={label} className="flex items-center gap-12">
                    <Icon className="size-20 text-text-secondary" aria-hidden="true" />
                    <Typography textStyle="body-md-regular" truncate>{label}</Typography>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Choose your room">
              <RadioGroup size="md" variant="card" label="Room type" options={rooms} value={room} onChange={setRoom} />
            </Section>

            <Section title="Anything we should know?">
              <Textarea
                size="md"
                label="Special requests"
                placeholder="Arrival time, dietary needs, a cot for a baby…"
                helperText="Priya usually replies within an hour"
                showCount
                maxLength={300}
              />
            </Section>

            <Separator orientation="horizontal" variant="default" />

            <Section title="4.82 · 312 reviews">
              <div className="grid grid-cols-2 gap-x-32 gap-y-12 md:grid-cols-3">
                {ratingBreakdown.map(({ label, score }) => (
                  <div key={label} className="flex flex-col gap-6">
                    <div className="flex items-center justify-between gap-8">
                      <Typography textStyle="body-sm-regular" color="secondary">{label}</Typography>
                      <Typography textStyle="label-sm-semibold">{score.toFixed(1)}</Typography>
                    </div>
                    <div className="flex h-4 rounded-full bg-border-default-soft">
                      <div className="flex rounded-full bg-text-primary" style={{ width: `${(score / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div aria-label="Review topics" className="flex flex-wrap gap-8">
                {reviewTopics.map(({ label, count }) => (
                  <Chip key={label} label={`${label} · ${count}`} size="sm" selected={topic === label} onSelect={() => setTopic(label)} />
                ))}
              </div>
              {/* Each review is clamped to 4 lines so every card — and grid row — has the same height. */}
              <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                {reviews.map(({ initials, name, meta, stay, text }) => (
                  <Card key={name} variant="secondary" className="flex flex-col gap-12 p-16">
                    <div className="flex items-center gap-12">
                      <Avatar size={40} initials={initials} alt={name} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Typography textStyle="label-md-semibold" truncate>{name}</Typography>
                        <Typography textStyle="body-sm-regular" color="secondary" truncate>{meta}</Typography>
                      </div>
                      <Badge color="grey" size="sm">{stay}</Badge>
                    </div>
                    <Typography textStyle="body-sm-regular" className="line-clamp-4">{text}</Typography>
                  </Card>
                ))}
              </div>
              <div className="flex">
                <Button variant="secondary" size="md">Show all 312 reviews</Button>
              </div>
            </Section>

            <Separator orientation="horizontal" variant="default" />

            <Section title="Where you'll be">
              <div aria-label="Map" className="relative flex h-[240px] items-center justify-center rounded-2xl bg-solid-grey-150">
                <div className="flex size-48 items-center justify-center rounded-full bg-surface-brand-strong text-text-static-light shadow-s">
                  <MapPin className="size-24" aria-hidden="true" />
                </div>
                <div className="absolute top-12 left-12 flex">
                  <Badge color="black" size="md">Exact location after booking</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-8">
                <Typography textStyle="label-md-semibold">Assagao, North Goa, India</Typography>
                <div className="flex flex-wrap gap-8">
                  <Badge color="blue" size="sm" variant="outline">Anjuna beach · 4 km</Badge>
                  <Badge color="blue" size="sm" variant="outline">Vagator beach · 6 km</Badge>
                  <Badge color="blue" size="sm" variant="outline">Mopa airport · 32 km</Badge>
                </div>
              </div>
            </Section>

            <Section title="Things to know">
              <Card variant="secondary" className="flex flex-col overflow-hidden">
                <Accordion type="multiple" size="md" defaultValue={['cancellation']}>
                  {policies.map(({ value, title, body }) => (
                    <AccordionItem key={value} value={value} title={title}>
                      <Typography textStyle="body-sm-regular" color="secondary">{body}</Typography>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </Section>
          </div>

          {/* Desktop: stays in view while the details scroll. Mobile: the end of the page. */}
          <aside aria-label="Booking" data-figma-id="stay-booking" className="flex flex-col lg:sticky lg:top-24 lg:w-[360px]">
            <Card variant="primary" className="flex flex-col gap-16 p-20">
              <div className="flex items-end justify-between gap-12">
                <div className="flex items-end gap-4">
                  <Typography textStyle="heading-lg">{rupees(nightly)}</Typography>
                  <Typography textStyle="body-sm-regular" color="secondary">/ night</Typography>
                </div>
                <div className="flex items-center gap-4">
                  <Star className="size-14 text-text-primary" aria-hidden="true" />
                  <Typography textStyle="label-sm-semibold">4.82</Typography>
                </div>
              </div>
              <DateInput label="Check-in" value={checkIn} onChange={setCheckIn} minDate={EARLIEST} />
              <DateInput label="Check-out" value={checkOut} onChange={setCheckOut} minDate={EARLIEST} />
              <Dropdown size="md" label="Guests" options={guestOptions} value={guests} onChange={setGuests} />
              <Checkbox size="md" checked={pickup} onChange={setPickup} label={`Airport pickup (+${rupees(AIRPORT_PICKUP)})`} />
              <div className="hidden lg:flex">{reserveButton}</div>
              <Typography textStyle="body-sm-regular" color="secondary" align="center">You won't be charged yet</Typography>
              <Separator orientation="horizontal" variant="default" />
              <div className="flex flex-col gap-12">
                <PriceRow label={`${rupees(nightly)} × ${NIGHTS} nights`} value={rupees(stayCost)} />
                <PriceRow label="Cleaning fee" value={rupees(cleaning)} />
                <PriceRow label="Service fee" value={rupees(serviceFee)} />
                <PriceRow label="Taxes (12%)" value={rupees(taxes)} />
                {pickup && <PriceRow label="Airport pickup" value={rupees(AIRPORT_PICKUP)} />}
              </div>
              <Separator orientation="horizontal" variant="default" />
              <PriceRow label="Total" value={rupees(total)} strong />
            </Card>
          </aside>
        </div>

        <Separator orientation="horizontal" variant="default" />

        <Section title="Similar stays nearby">
          {/* Scrolls sideways: in Figma, a clipped row wider than its frame. */}
          <div className="flex gap-16 overflow-x-auto">
            {similarStays.map(({ id, name, price, rating, tone, Icon, badge }) => (
              <div key={id} className="flex w-[240px] flex-none flex-col gap-12">
                <div className={`relative flex h-[160px] items-center justify-center rounded-2xl ${tone}`}>
                  <Icon className="size-32" aria-hidden="true" />
                  <div className="absolute top-8 left-8 flex">
                    <Badge color={badgeColor[badge]} size="sm">{badge}</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-8">
                    <Typography textStyle="label-md-semibold" truncate>{name}</Typography>
                    <div className="flex items-center gap-4">
                      <Star className="size-12 text-text-primary" aria-hidden="true" />
                      <Typography textStyle="label-sm-medium">{rating}</Typography>
                    </div>
                  </div>
                  <Typography textStyle="body-sm-regular" color="secondary">{`${price} / night`}</Typography>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <footer aria-label="Footer" className="flex flex-col gap-8">
          <div className="flex items-center gap-8">
            <Clock className="size-14 text-text-secondary" aria-hidden="true" />
            <Typography textStyle="body-sm-regular" color="secondary">Prices last updated 12 Oct 2026, 9:00 am</Typography>
          </div>
        </footer>
      </div>

      {/* Mobile: sticky (not fixed), so it stays in the page flow and exports at the end of the stack. */}
      <div aria-label="Reserve bar" data-figma-id="stay-bar" className="sticky bottom-0 flex w-full items-center justify-between gap-16 border-t border-border-default-soft bg-surface-card-default px-16 py-12 lg:hidden">
        <div className="flex flex-col gap-2">
          <Typography textStyle="label-lg-semibold">{`${rupees(total)} total`}</Typography>
          <Typography textStyle="body-sm-regular" color="secondary">14 – 17 Nov · 2 guests</Typography>
        </div>
        <div className="flex w-[148px]">{reserveButton}</div>
      </div>
    </main>
  )
}

export default StayPage

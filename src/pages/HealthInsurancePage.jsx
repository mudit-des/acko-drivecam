import { useEffect, useState } from 'react'
import { Accordion, AccordionItem } from '@acko/accordion'
import { Avatar } from '@acko/avatar'
import { Badge } from '@acko/badge'
import { Breadcrumb } from '@acko/breadcrumb'
import { Button } from '@acko/button'
import { Card } from '@acko/card'
import { Chip } from '@acko/chip'
import { Dropdown } from '@acko/dropdown'
import { Separator } from '@acko/separator'
import { TextInput } from '@acko/text-input'
import { Typography } from '@acko/typography'
import {
  Activity,
  Ambulance,
  ArrowRight,
  BadgePercent,
  Building2,
  CalendarCheck,
  Check,
  Cigarette,
  Clock,
  FileCheck2,
  Gift,
  Headphones,
  HeartPulse,
  Hospital,
  Lightbulb,
  MapPin,
  Minus,
  ShieldCheck,
  Smartphone,
  Star,
  Stethoscope,
  UserRound,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'

// Fixed premiums, counts and dates keep the Figma export deterministic.
const heroBenefits = [
  { Icon: Wallet, title: '100% bill payment', detail: "No deductions — don't compromise on what your insurer pays" },
  { Icon: Hospital, title: 'Cashless at 14,000+ hospitals', detail: 'Get admitted at the hospital of your choice without paying upfront' },
  { Icon: BadgePercent, title: 'Zero commission', detail: 'Buy direct, with no agents or middlemen charges' },
  { Icon: ShieldCheck, title: 'No room-rent capping', detail: 'Pick any single private room, with no proportionate cuts' },
]

// Who the quote covers. `counts` lists how many of that member can be added.
const memberTypes = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'children', label: 'Children', countLabel: 'Children', counts: [1, 2, 3, 4] },
  { value: 'parents', label: 'Parents', countLabel: 'Parents', counts: [1, 2] },
  { value: 'inLaws', label: 'Parents-in-law', countLabel: 'Parents-in-law', counts: [1, 2] },
]

// Splits a list into rows of two.
const pairs = (items) => items.reduce((rows, item, index) => (index % 2 ? rows[rows.length - 1].push(item) : rows.push([item]), rows), [])

// TextInput only strips non-digits when uncontrolled, so controlled fields do it here.
const digitsOf = (event) => event.target.value.replace(/\D/g, '')

const countOptions = (counts) => counts.map((count) => ({ value: String(count), label: String(count) }))

const trustStats = [
  { value: '5 Cr+', label: 'Indians trust ACKO' },
  { value: '96%', label: 'Claims settled' },
  { value: '4.8★', label: 'App store rating' },
]

// The "On this page" side nav: one entry per section, in page order.
const navItems = [
  { id: 'what-is', label: 'What is comprehensive health insurance?' },
  { id: 'comparison', label: 'Comparison of health insurance plans' },
  { id: 'right-plan', label: 'Which plan is right for you' },
  { id: 'covered', label: "What's covered" },
  { id: 'expenses', label: 'What each expense pays' },
  { id: 'add-ons', label: 'Useful add-ons' },
  { id: 'why-need', label: 'Why you need it' },
  { id: 'seniors', label: 'Cover for senior citizens' },
  { id: 'buy-direct', label: 'Why buy direct from ACKO' },
  { id: 'reviews', label: 'Why millions trust ACKO' },
  { id: 'claims', label: 'How we earn your trust' },
  { id: 'how-to-buy', label: 'How to buy' },
  { id: 'how-to-renew', label: 'How to renew' },
  { id: 'how-to-claim', label: 'How to file a claim' },
  { id: 'why-acko', label: 'Why buy ACKO health insurance' },
  { id: 'ncb', label: 'What is a no-claim bonus?' },
  { id: 'premium', label: 'What impacts your premium' },
  { id: 'faqs', label: 'Frequently asked questions' },
  { id: 'learn-more', label: 'Learn more' },
]

const plans = ['Comprehensive', 'Basic', 'Top-up']

// `true` = covered, `false` = not covered, a string = optional add-on.
const comparison = [
  {
    group: 'Hospitalisation',
    rows: [
      { label: 'In-patient hospital stay', cover: [true, true, true] },
      { label: 'Pre & post hospitalisation (60/180 days)', cover: [true, true, false] },
      { label: 'Day-care procedures', cover: [true, true, false] },
      { label: 'Room rent with no capping', cover: [true, false, false] },
      { label: 'Ambulance charges', cover: [true, true, false] },
    ],
  },
  {
    group: 'Beyond the hospital',
    rows: [
      { label: 'Annual health check-up', cover: [true, false, false] },
      { label: 'Doctor consultations (OPD)', cover: ['Add-on', false, false] },
      { label: 'Maternity & newborn care', cover: ['Add-on', false, false] },
    ],
  },
  {
    group: 'Premium range',
    rows: [{ label: 'Starting price (approx.)', cover: ['₹549/mo', '₹299/mo', '₹149/mo'] }],
  },
]

const ageGroups = [
  { value: 'under30', label: 'Under 30', advice: 'Lock in a low premium now with a ₹10 lakh comprehensive plan. Premiums are cheapest when you are young and healthy, and waiting periods for pre-existing conditions finish before you are likely to need them.' },
  { value: '30to45', label: '30 – 45', advice: 'Cover your family on one floater plan with at least ₹15 lakh sum insured. Add maternity cover if you are planning a family, and a top-up to protect against one large claim.' },
  { value: '45to60', label: '45 – 60', advice: 'Pick ₹25 lakh or more with no room-rent capping. Lifestyle conditions become more common, so choose a plan with a short waiting period for diabetes and hypertension.' },
  { value: 'over60', label: '60+', advice: 'Buy a dedicated senior citizen plan with cashless home care and a low co-payment. A top-up plan over an existing policy is the most affordable way to raise cover.' },
]

const covered = [
  {
    value: 'hospital',
    title: 'Hospital stay, ICU and surgery',
    body: 'Room, nursing, ICU, surgeon and anaesthetist fees, operation theatre charges and medicines during your stay — paid directly to the hospital.',
    points: ['Single private room with no rent capping', 'ICU charges up to sum insured', 'All 600+ day-care procedures'],
    tip: 'Show your ACKO e-card at the insurance desk. Most cashless approvals come through in under 30 minutes.',
  },
  {
    value: 'prepost',
    title: 'Pre and post hospitalisation',
    body: 'Tests, scans, medicines and follow-up visits 60 days before and 180 days after the hospital stay are reimbursed.',
    points: ['Diagnostic tests and scans', 'Pharmacy bills', 'Follow-up consultations'],
    tip: 'Upload bills in the ACKO app as you go — no need to collect them until the end.',
  },
  {
    value: 'restore',
    title: 'Sum insured restore',
    body: 'If you use up your cover in a year, it is refilled once for a new illness — at no extra cost.',
    points: ['100% refill once a year', 'Works for any family member on a floater'],
  },
  {
    value: 'ambulance',
    title: 'Emergency ambulance',
    body: 'Road ambulance charges to the nearest hospital are paid in full for every hospitalisation claim.',
    points: ['Road ambulance in full', 'Air ambulance with the Global add-on'],
  },
]

const notCovered = [
  {
    value: 'cosmetic',
    title: 'Cosmetic and elective procedures',
    body: 'Treatment that is not medically necessary — cosmetic surgery, hair transplants or weight-loss surgery for a BMI under 40.',
    points: ['Cosmetic or aesthetic surgery', 'Non-prescribed supplements'],
  },
  {
    value: 'waiting',
    title: 'Conditions within the waiting period',
    body: 'Pre-existing illnesses are covered after a waiting period of 2 years on comprehensive plans.',
    points: ['30-day initial waiting period, except accidents', '2 years for pre-existing conditions'],
  },
  {
    value: 'self',
    title: 'Self-inflicted injuries and adventure sports',
    body: 'Injuries from intentional self-harm, or from professional and adventure sports, are excluded.',
    points: ['Professional sports injuries', 'Injuries under the influence of alcohol'],
  },
]

const expensePayouts = [
  { label: 'Room rent (single private room)', basic: 'Up to 1% of sum insured / day', comprehensive: '100%' },
  { label: 'ICU charges', basic: 'Up to 2% of sum insured / day', comprehensive: '100%' },
  { label: 'Consumables (gloves, PPE, syringes)', basic: 'Not paid', comprehensive: '100%' },
  { label: 'Modern treatments (robotic surgery)', basic: 'Up to 50%', comprehensive: '100%' },
  { label: 'AYUSH treatment', basic: 'Up to ₹25,000', comprehensive: '100%' },
  { label: 'Proportionate deductions', basic: 'Applied to the whole bill', comprehensive: 'None' },
]

const addOns = [
  { name: 'OPD cover', price: '₹99/mo', popular: true, title: 'Doctor visits without the bill', body: 'Pays for consultations, tests and medicines that do not need a hospital stay.', tip: 'Five GP visits a year cost about ₹4,000 — this add-on covers them for ₹1,188.' },
  { name: 'Maternity cover', price: '₹349/mo', popular: true, title: 'From pregnancy to newborn', body: 'Delivery, pre-natal check-ups and your newborn from day one, up to ₹1 lakh.', tip: 'Buy it at least 2 years before you plan a family to clear the waiting period.' },
  { name: 'Critical illness', price: '₹149/mo', popular: false, title: 'A lump sum when it matters', body: 'A one-time payout on diagnosis of any of 32 critical illnesses, on top of hospital bills.', tip: 'Use the payout for loss of income or home care that a hospital plan does not pay for.' },
  { name: 'Global cover', price: '₹249/mo', popular: false, title: 'Treatment outside India', body: 'Planned treatment abroad for 11 major illnesses, including travel for you and a companion.', tip: 'Includes air ambulance for emergencies within India.' },
]

const scenarios = [
  { title: 'Appendix surgery', body: 'A sudden appendicitis needs a laparoscopic surgery and a 3-day stay at a private hospital in Bengaluru.', without: '₹1,85,000', withAcko: '₹0' },
  { title: 'Dengue with ICU stay', body: 'A severe case of dengue needs 2 days in the ICU, platelet transfusions and 4 days on a ward.', without: '₹2,40,000', withAcko: '₹0' },
  { title: 'Knee replacement for a parent', body: 'Your father needs a total knee replacement and 10 days of physiotherapy after surgery.', without: '₹4,20,000', withAcko: '₹0' },
]

const seniorCover = [
  'Pre-existing diabetes and hypertension covered after 1 year',
  'Cashless home care for chemotherapy and dialysis',
  'Cataract and joint replacement surgeries',
  'Annual full-body health check-up',
]

const seniorReasons = [
  'Hospital bills after 60 are three times higher on average',
  'Corporate cover ends at retirement',
  'Premiums paid for parents save up to ₹50,000 in tax under Section 80D',
]

const directBenefits = [
  { Icon: Wallet, title: 'Commission-free prices', detail: 'Up to 20% lower premiums than buying through an agent' },
  { Icon: ShieldCheck, title: 'Higher sum insured', detail: 'Choose cover up to ₹1 crore without a medical test' },
  { Icon: Building2, title: 'Every hospital covered', detail: 'Cashless at network hospitals, reimbursement everywhere else' },
]

const reviews = [
  { initials: 'AM', name: 'Aditi Menon', meta: 'Mumbai · Claim settled in 2 hours', text: 'My father was admitted for a bypass surgery. The cashless approval came through before we had finished the admission forms, and the discharge was just as quick.' },
  { initials: 'RS', name: 'Rohan Sharma', meta: 'Delhi · Policy holder since 2022', text: 'Bought a family floater in ten minutes on the app. When my daughter had dengue, I uploaded the bills from the hospital bed and got the refund in three days.' },
  { initials: 'PK', name: 'Priya Krishnan', meta: 'Chennai · Maternity claim', text: 'The maternity add-on covered the delivery and the first NICU days for our son. Nobody asked me for paper copies of anything.' },
]

const claimStats = [
  { label: 'Hospitalisation', percent: 97 },
  { label: 'Day-care procedures', percent: 98 },
  { label: 'Maternity', percent: 94 },
  { label: 'Critical illness', percent: 92 },
]

const buySteps = [
  { title: 'Tell us who to cover', detail: 'Add family members, their ages and your pincode.' },
  { title: 'Pick your plan and add-ons', detail: 'Compare sum insured options and see the premium change live.' },
  { title: 'Pay and get your policy', detail: 'Your policy and e-cards reach your inbox in two minutes.' },
]

const renewSteps = [
  { title: 'Open the app or website', detail: 'Log in with your mobile number — your policy is already there.' },
  { title: 'Review your cover', detail: 'Raise your sum insured, add family members or new add-ons.' },
  { title: 'Pay and download', detail: 'Your no-claim bonus and waiting periods carry over automatically.' },
]

const claimSteps = [
  { Icon: Smartphone, title: 'Start in the app', detail: 'Tell us about the admission in a few taps.' },
  { Icon: FileCheck2, title: 'Share your documents', detail: 'Upload bills and reports — no couriers.' },
  { Icon: Ambulance, title: 'Get treated cashless', detail: 'We settle directly with the hospital.' },
]

const whyAcko = [
  { Icon: Wallet, title: 'Affordable premiums', detail: 'No agent commission, so you pay up to 20% less.' },
  { Icon: Hospital, title: 'Cashless claims', detail: 'At 14,000+ network hospitals across India.' },
  { Icon: Zap, title: 'Instant purchase', detail: 'Buy or renew in minutes, with no medical test up to 45.' },
  { Icon: Smartphone, title: 'Easy claims', detail: 'File and track every claim from the app.' },
  { Icon: Clock, title: 'Quick settlements', detail: 'Cashless approvals in under 30 minutes on average.' },
  { Icon: Headphones, title: '24×7 support', detail: 'Talk to a claims expert any time, any day.' },
]

const ncbSchedule = [
  { year: 'Year 1', bonus: '+0%', cover: '₹10,00,000' },
  { year: 'After 1 claim-free year', bonus: '+50%', cover: '₹15,00,000' },
  { year: 'After 2 claim-free years', bonus: '+100%', cover: '₹20,00,000' },
  { year: 'After a claim', bonus: '−50%', cover: '₹15,00,000' },
]

const premiumFactors = [
  { Icon: UserRound, title: 'Age of the eldest member', detail: 'Premiums rise with age, so a floater is priced on the oldest person covered.' },
  { Icon: MapPin, title: 'Your city', detail: 'Treatment costs more in metros, so premiums are higher there.' },
  { Icon: ShieldCheck, title: 'Sum insured', detail: 'Doubling your cover usually costs only 20–30% more.' },
  { Icon: Users, title: 'Number of members', detail: 'Each person added to a floater raises the premium a little.' },
  { Icon: Activity, title: 'Pre-existing conditions', detail: 'Declared conditions may add a loading or a waiting period.' },
  { Icon: Cigarette, title: 'Lifestyle habits', detail: 'Smoking and tobacco use increase the premium.' },
]

const faqs = [
  { value: 'what', title: 'What is comprehensive health insurance?', body: 'A plan that pays for hospitalisation, pre and post hospital care, day-care procedures and ambulance charges for you and your family, with optional add-ons for OPD, maternity and critical illness.' },
  { value: 'tax', title: 'Can I save tax on my premium?', body: 'Yes. Premiums are deductible under Section 80D — up to ₹25,000 for your family and another ₹50,000 for senior citizen parents.' },
  { value: 'port', title: 'Can I port my existing policy to ACKO?', body: 'Yes. Your waiting periods and no-claim bonus carry over when you port at renewal. Start the request at least 45 days before your current policy expires.' },
  { value: 'ncb', title: 'What is a no-claim bonus?', body: 'For every claim-free year, your sum insured goes up by 50% at no extra cost, up to double your base cover.' },
]

const articles = [
  { title: 'Individual vs family floater health insurance', readTime: '5 min read' },
  { title: 'How much sum insured do you really need?', readTime: '4 min read' },
  { title: 'Waiting periods in health insurance, explained', readTime: '6 min read' },
  { title: 'Cashless vs reimbursement claims', readTime: '4 min read' },
  { title: 'Section 80D: how to save tax on health insurance', readTime: '5 min read' },
  { title: 'Why health insurance claims get rejected', readTime: '7 min read' },
]

const experts = [
  { initials: 'NP', name: 'Nikhila P S', role: 'Health insurance expert · 9 years' },
  { initials: 'RK', name: 'Rekhit Singh Kaushal', role: 'Claims specialist · 7 years' },
]

function Section({ id, title, description, children }) {
  return (
    <section id={id} aria-label={title} className="flex scroll-mt-24 flex-col gap-20">
      <div className="flex flex-col gap-8">
        <Typography textStyle="heading-lg" as="h2">{title}</Typography>
        {description && <Typography textStyle="body-md-regular" color="secondary">{description}</Typography>}
      </div>
      {children}
    </section>
  )
}

function IconCircle({ Icon, tone = 'bg-surface-brand-subtle text-text-brand-default' }) {
  return (
    <div className={`flex size-40 flex-none items-center justify-center rounded-full ${tone}`}>
      <Icon className="size-20" aria-hidden="true" />
    </div>
  )
}

function OnThisPage({ active }) {
  return (
    <nav aria-label="On this page" data-figma-id="health-toc" className="flex flex-col gap-12">
      <div className="flex px-12">
        <Typography textStyle="label-sm-semibold" color="secondary">ON THIS PAGE</Typography>
      </div>
      <div className="flex flex-col gap-2">
        {navItems.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? 'location' : undefined}
            className={`flex rounded-lg px-12 py-8 ${active === id ? 'bg-surface-brand-subtle' : 'hover:bg-surface-page-secondary'}`}
          >
            <Typography
              textStyle={active === id ? 'label-sm-semibold' : 'label-sm-regular'}
              color={active === id ? undefined : 'secondary'}
              className={active === id ? 'text-text-brand-default!' : undefined}
            >
              {label}
            </Typography>
          </a>
        ))}
      </div>
    </nav>
  )
}

function CoverCell({ value }) {
  if (value === true) {
    return (
      <div className="flex w-[72px] flex-none justify-center lg:w-[120px]">
        <Check className="size-20 text-text-status-success" aria-label="Covered" />
      </div>
    )
  }
  if (value === false) {
    return (
      <div className="flex w-[72px] flex-none justify-center lg:w-[120px]">
        <Minus className="size-20 text-text-tertiary" aria-label="Not covered" />
      </div>
    )
  }
  return (
    <div className="flex w-[72px] flex-none justify-center lg:w-[120px]">
      <Typography textStyle="label-xs-semibold" align="center">{value}</Typography>
    </div>
  )
}

function CheckList({ items }) {
  return (
    <div className="flex flex-col gap-8">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-8">
          <Check className="size-16 flex-none text-text-status-success" aria-hidden="true" />
          <Typography textStyle="body-sm-regular">{item}</Typography>
        </div>
      ))}
    </div>
  )
}

function CoverList({ items }) {
  return (
    <Card variant="secondary" className="flex flex-col overflow-hidden">
      <Accordion type="single" size="md" defaultValue={items[0].value}>
        {items.map(({ value, title, body, points, tip }) => (
          <AccordionItem key={value} value={value} title={title}>
            <div className="flex flex-col gap-12">
              <Typography textStyle="body-sm-regular" color="secondary">{body}</Typography>
              <CheckList items={points} />
              {tip && (
                <div aria-label="Claim tip" className="flex items-start gap-8 rounded-lg bg-surface-status-info-subtle p-12">
                  <Lightbulb className="size-16 flex-none text-text-status-info" aria-hidden="true" />
                  <Typography textStyle="body-sm-regular"><strong>Claim tip:</strong> {tip}</Typography>
                </div>
              )}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  )
}

function AddOnCard({ addOn }) {
  return (
    <Card variant="primary" className="flex flex-col gap-12 p-16 md:flex-1">
      <div className="flex items-center justify-between gap-8">
        <Typography textStyle="label-lg-semibold">{addOn.name}</Typography>
        {addOn.popular && <Badge color="purple" size="sm">Popular</Badge>}
      </div>
      <div className="flex items-end gap-4">
        <Typography textStyle="body-sm-regular" color="secondary">starting at</Typography>
        <Typography textStyle="heading-sm">{addOn.price}</Typography>
      </div>
      <div className="flex flex-col gap-4">
        <Typography textStyle="label-md-semibold" as="h3">{addOn.title}</Typography>
        <Typography textStyle="body-sm-regular" color="secondary">{addOn.body}</Typography>
      </div>
      <div className="flex items-start gap-8 rounded-lg bg-surface-page-secondary p-12">
        <Lightbulb className="size-16 flex-none text-text-brand-default" aria-hidden="true" />
        <Typography textStyle="body-sm-regular"><strong>Expert tip:</strong> {addOn.tip}</Typography>
      </div>
    </Card>
  )
}

function StepList({ steps }) {
  return (
    <div className="flex flex-col gap-16 xl:flex-row">
      {steps.map(({ title, detail }, index) => (
        <div key={title} className="flex items-start gap-12 xl:flex-1">
          <div className="flex size-40 flex-none items-center justify-center rounded-full bg-surface-brand-strong">
            <Typography textStyle="label-md-semibold" color="static">{index + 1}</Typography>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Typography textStyle="label-lg-semibold" as="h3">{title}</Typography>
            <Typography textStyle="body-sm-regular" color="secondary">{detail}</Typography>
          </div>
        </div>
      ))}
    </div>
  )
}

// Icon + title + detail tiles, in rows of three from `md` up (flex rows, since heights vary).
function FeatureRows({ items }) {
  const rows = [items.slice(0, 3), items.slice(3)]
  return (
    <div className="flex flex-col gap-16">
      {rows.map((row) => (
        <div key={row[0].title} className="flex flex-col gap-16 md:flex-row">
          {row.map(({ Icon, title, detail }) => (
            <Card key={title} variant="secondary" className="flex flex-col gap-12 p-16 md:flex-1">
              <IconCircle Icon={Icon} />
              <div className="flex flex-col gap-4">
                <Typography textStyle="label-md-semibold" as="h3">{title}</Typography>
                <Typography textStyle="body-sm-regular" color="secondary">{detail}</Typography>
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}

function validateQuote({ selected, eldestAge, parentAge, phone, pincode }) {
  const errors = {}
  const hasCouple = selected.self || selected.spouse
  const hasParents = selected.parents || selected.inLaws
  if (!Object.values(selected).some(Boolean)) errors.members = 'Select at least one member to insure'
  else if (selected.children && !hasCouple) errors.members = 'Add yourself or your spouse to cover children'
  // Field messages stay short: the fields sit two to a row, so longer ones wrap.
  if (hasCouple) {
    const age = Number(eldestAge)
    if (!eldestAge) errors.eldestAge = 'Enter age'
    else if (age < 18 || age > 99) errors.eldestAge = 'Age must be 18–99'
  }
  if (hasParents) {
    const age = Number(parentAge)
    if (!parentAge) errors.parentAge = 'Enter age'
    else if (age < 36 || age > 99) errors.parentAge = 'Age must be 36–99'
    else if (hasCouple && eldestAge && age <= Number(eldestAge)) errors.parentAge = 'Must be older than you'
  }
  if (!phone) errors.phone = 'Enter mobile number'
  else if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = 'Invalid mobile number'
  if (!pincode) errors.pincode = 'Enter pincode'
  else if (!/^[1-9]\d{5}$/.test(pincode)) errors.pincode = 'Invalid pincode'
  return errors
}

function QuoteForm() {
  const [selected, setSelected] = useState({ self: true, spouse: true, children: true, parents: false, inLaws: false })
  const [counts, setCounts] = useState({ children: '1', parents: '2', inLaws: '2' })
  const [eldestAge, setEldestAge] = useState('')
  const [parentAge, setParentAge] = useState('')
  const [phone, setPhone] = useState('')
  const [pincode, setPincode] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [quoteRequested, setQuoteRequested] = useState(false)

  // Errors show only after the first submit, then update as the user fixes them.
  const errors = submitted ? validateQuote({ selected, eldestAge, parentAge, phone, pincode }) : {}
  const hasCouple = selected.self || selected.spouse
  const hasParents = selected.parents || selected.inLaws
  const memberCount = memberTypes.reduce(
    (total, { value, counts: options }) => total + (selected[value] ? (options ? Number(counts[value]) : 1) : 0),
    0,
  )

  const toggle = (value) => {
    setSelected((current) => ({ ...current, [value]: !current[value] }))
    setQuoteRequested(false)
  }

  const detailFields = [
    ...memberTypes
      .filter(({ value, counts: options }) => options && selected[value])
      .map(({ value, countLabel, counts: options }) => (
        <Dropdown
          key={value}
          className="min-w-0 flex-1"
          size="sm"
          label={countLabel}
          options={countOptions(options)}
          value={counts[value]}
          onChange={(count) => setCounts((current) => ({ ...current, [value]: count }))}
        />
      )),
    hasCouple && (
      <TextInput
        key="eldestAge"
        className="min-w-0 flex-1"
        size="sm"
        inputType="number"
        label="Eldest age (you/spouse)"
        placeholder="e.g. 34"
        maxLength={2}
        value={eldestAge}
        onChange={(event) => setEldestAge(digitsOf(event))}
        errorText={errors.eldestAge}
      />
    ),
    hasParents && (
      <TextInput
        key="parentAge"
        className="min-w-0 flex-1"
        size="sm"
        inputType="number"
        label="Eldest parent's age"
        placeholder="e.g. 62"
        maxLength={2}
        value={parentAge}
        onChange={(event) => setParentAge(digitsOf(event))}
        errorText={errors.parentAge}
      />
    ),
  ].filter(Boolean)

  const onSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    setQuoteRequested(Object.keys(validateQuote({ selected, eldestAge, parentAge, phone, pincode })).length === 0)
  }

  return (
    <Card variant="primary" className="flex flex-col p-20 shadow-card">
      <form aria-label="Quote form" data-figma-id="health-quote-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-16">
        <Typography textStyle="heading-sm" as="h3">Get a health plan in 60 seconds!</Typography>

        <div role="group" aria-label="Members" aria-labelledby="quote-members-label" className="flex flex-col gap-12">
          <Typography textStyle="label-md-semibold" id="quote-members-label">Who do you want to insure?</Typography>
          <div className="flex flex-wrap gap-8">
            {memberTypes.map(({ value, label }) => (
              <Chip key={value} label={label} size="sm" selected={selected[value]} onSelect={() => toggle(value)} />
            ))}
          </div>
          {errors.members && <Typography textStyle="body-sm-regular" className="text-text-status-error!">{errors.members}</Typography>}
        </div>

        {/* Fields sit two to a row, so the form stays short however many members are picked. */}
        {pairs(detailFields).map((row) => (
          <div key={row[0].key} className="flex flex-col gap-12 sm:flex-row sm:items-start">{row}</div>
        ))}

        <div className="flex flex-col gap-12 sm:flex-row sm:items-start">
          <TextInput
            className="min-w-0 flex-1"
            size="sm"
            inputType="phone"
            label="Mobile number"
            placeholder="10 digits"
            maxLength={10}
            value={phone}
            onChange={(event) => setPhone(digitsOf(event))}
            errorText={errors.phone}
          />
          <TextInput
            className="min-w-0 flex-1"
            size="sm"
            inputType="pincode"
            label="Pincode"
            placeholder="6 digits"
            value={pincode}
            onChange={(event) => setPincode(digitsOf(event))}
            errorText={errors.pincode}
          />
        </div>

        {quoteRequested && (
          <div role="status" aria-label="Quote requested" className="flex items-start gap-8 rounded-lg bg-surface-status-success-subtle p-12">
            <Check className="size-16 flex-none text-text-status-success" aria-hidden="true" />
            <Typography textStyle="body-sm-regular">{`Fetching prices for ${memberCount} ${memberCount === 1 ? 'member' : 'members'} in ${pincode}.`}</Typography>
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth>Check prices</Button>
        <Typography textStyle="helper-xs-regular" color="secondary" align="center">UIN ACKHLIP25012V022425 | T&Cs apply*</Typography>
      </form>
    </Card>
  )
}

function HealthInsurancePage() {
  const [ageGroup, setAgeGroup] = useState('30to45')
  const [coverTab, setCoverTab] = useState('covered')
  const [activeSection, setActiveSection] = useState(navItems[0].id)

  // Highlights the last section whose heading has scrolled past the top of the viewport.
  useEffect(() => {
    const onScroll = () => {
      let current = navItems[0].id
      for (const { id } of navItems) {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top < 120) current = id
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const advice = ageGroups.find(({ value }) => value === ageGroup).advice

  return (
    <main aria-label="Comprehensive health insurance" data-figma-id="health" className="flex min-h-screen w-full flex-col items-center bg-surface-page-primary">
      <header aria-label="Top bar" data-figma-id="health-topbar" className="flex w-full justify-center border-b border-border-default-soft bg-surface-card-default">
        <div className="flex w-full max-w-[480px] items-center justify-between px-16 py-12 lg:max-w-[1200px] lg:px-40">
          <div className="flex items-center gap-8">
            <div className="flex size-32 items-center justify-center rounded-lg bg-surface-brand-strong text-text-static-light">
              <HeartPulse className="size-20" aria-hidden="true" />
            </div>
            <Typography textStyle="label-xl-semibold">ACKO</Typography>
          </div>
          <Button variant="secondary" size="sm">Claims</Button>
        </div>
      </header>

      {/* Hero: a full-width brand band; inside, the pitch on the left and the quote form on the right stretch to the same height. */}
      <section aria-label="Hero" data-figma-id="health-hero" className="flex w-full justify-center bg-surface-brand-subtle">
        <div className="flex w-full max-w-[480px] flex-col gap-24 px-16 py-24 lg:max-w-[1200px] lg:flex-row lg:gap-48 lg:px-40 lg:py-48">
          <div className="flex flex-col justify-between gap-24 lg:flex-1">
            <div className="flex flex-col items-start gap-16">
              <Badge color="purple" size="md">Trusted by 5 Cr+ Indians</Badge>
              <Typography textStyle="display-md" as="h1">Comprehensive health insurance starting at just ₹22/day</Typography>
              <Typography textStyle="body-md-regular" color="secondary">
                Covers hospital stays, surgeries, ICU, pre and post hospitalisation, and day-care treatment for your whole family.
              </Typography>
            </div>

            <div aria-label="Benefits" className="flex flex-col gap-12">
              {[heroBenefits.slice(0, 2), heroBenefits.slice(2)].map((row) => (
                <div key={row[0].title} className="flex flex-col gap-12 md:flex-row">
                  {row.map(({ Icon, title, detail }) => (
                    <div key={title} className="flex items-start gap-12 rounded-2xl bg-surface-card-default p-16 md:flex-1">
                      <IconCircle Icon={Icon} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Typography textStyle="label-md-semibold" as="h3">{title}</Typography>
                        <Typography textStyle="body-sm-regular" color="secondary">{detail}</Typography>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div aria-label="Top-up" className="flex items-center gap-12 rounded-2xl bg-surface-brand-strong p-16">
              <IconCircle Icon={Stethoscope} tone="bg-surface-card-default text-text-brand-default" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Typography textStyle="label-md-semibold" as="h3" color="static">Covered by your employer?</Typography>
                <Typography textStyle="body-sm-regular" color="static">Add a personal top-up from ₹149/month that stays when you change jobs.</Typography>
              </div>
              <Button variant="secondary-on-dark" size="sm">Get quote</Button>
            </div>
          </div>

          <div className="flex flex-col lg:w-[480px]">
            <QuoteForm />
          </div>
        </div>
      </section>

      <div className="flex w-full max-w-[480px] flex-col gap-40 px-16 pt-24 pb-48 lg:max-w-[1200px] lg:gap-64 lg:px-40 lg:pt-40">
        <section aria-label="Trust" data-figma-id="health-trust" className="flex flex-col gap-16 rounded-3xl bg-surface-page-secondary p-20 lg:flex-row lg:items-center lg:justify-between lg:px-32">
          <Typography textStyle="heading-sm" as="h2">Trusted by 5 Cr+ Indians</Typography>
          <div className="flex gap-12 lg:gap-48">
            {trustStats.map(({ value, label }) => (
              <div key={label} className="flex flex-1 flex-col gap-2 lg:flex-none">
                <Typography textStyle="heading-md">{value}</Typography>
                <Typography textStyle="body-sm-regular" color="secondary">{label}</Typography>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-24">
          <Breadcrumb
            size="sm"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Health insurance', href: '/' },
              { label: 'Comprehensive health insurance' },
            ]}
          />

          {/* Desktop: the side nav stays in view while the content scrolls. Mobile: no side nav. */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-48">
            <aside aria-label="Page navigation" className="hidden lg:sticky lg:top-24 lg:flex lg:w-[256px] lg:flex-none">
              <OnThisPage active={activeSection} />
            </aside>

            <div aria-label="Content" className="flex min-w-0 flex-col gap-40 lg:flex-1 lg:gap-64">
              <Section id="what-is" title="What is comprehensive health insurance?">
                <Typography textStyle="body-md-regular">
                  Comprehensive health insurance pays for your medical treatment from the moment you are admitted to a hospital until you recover at home. It covers your <strong>room, ICU, surgery and medicines</strong>, tests and follow-ups before and after your stay, day-care procedures that don't need an overnight stay, and ambulance charges. Add-ons such as OPD, maternity and critical illness cover fill the gaps, so a single plan protects your whole family's health and savings.
                </Typography>
              </Section>

              <Section
                id="comparison"
                title="Comprehensive vs basic vs top-up health insurance"
                description="Basic plans cap room rent and skip extras, top-ups only pay after a large deductible, and comprehensive plans cover the full journey of an illness."
              >
                <Card variant="primary" className="flex flex-col overflow-hidden">
                  <div aria-label="Plan headings" className="flex items-center gap-4 bg-surface-page-secondary px-16 py-12">
                    <div className="flex flex-1">
                      <Typography textStyle="label-sm-semibold" color="secondary">Cover</Typography>
                    </div>
                    {plans.map((plan, index) => (
                      <div key={plan} className="flex w-[72px] flex-none justify-center lg:w-[120px]">
                        <Typography textStyle="label-sm-semibold" align="center" className={index === 0 ? 'text-text-brand-default!' : undefined}>{plan}</Typography>
                      </div>
                    ))}
                  </div>
                  {comparison.map(({ group, rows }) => (
                    <div key={group} aria-label={group} className="flex flex-col">
                      <div className="flex border-t border-border-default-soft px-16 pt-16 pb-8">
                        <Typography textStyle="label-xs-semibold" color="secondary">{group.toUpperCase()}</Typography>
                      </div>
                      {rows.map(({ label, cover }) => (
                        <div key={label} className="flex items-center gap-4 px-16 py-10">
                          <div className="flex min-w-0 flex-1">
                            <Typography textStyle="body-sm-regular">{label}</Typography>
                          </div>
                          {cover.map((value, index) => <CoverCell key={plans[index]} value={value} />)}
                        </div>
                      ))}
                    </div>
                  ))}
                </Card>
              </Section>

              <Section id="right-plan" title="Which plan is right for you?" description="Select your age for a personalised recommendation.">
                <div aria-label="Age groups" className="flex flex-wrap gap-8">
                  {ageGroups.map(({ value, label }) => (
                    <Chip key={value} label={label} size="md" selected={ageGroup === value} onSelect={() => setAgeGroup(value)} />
                  ))}
                </div>
                <div aria-label="Recommendation" className="flex items-start gap-12 rounded-2xl bg-surface-brand-subtle p-16">
                  <IconCircle Icon={Lightbulb} tone="bg-surface-card-default text-text-brand-default" />
                  <div className="flex min-w-0 flex-1">
                    <Typography textStyle="body-md-regular">{advice}</Typography>
                  </div>
                </div>
              </Section>

              <Section
                id="covered"
                title="What comprehensive health insurance covers"
                description="Everything a comprehensive plan pays for, and the exclusions to know about before you make a claim."
              >
                <div aria-label="Cover tabs" className="flex gap-8">
                  <Chip label="What's covered" size="md" selected={coverTab === 'covered'} onSelect={() => setCoverTab('covered')} />
                  <Chip label="What's not covered" size="md" selected={coverTab === 'excluded'} onSelect={() => setCoverTab('excluded')} />
                </div>
                <CoverList key={coverTab} items={coverTab === 'covered' ? covered : notCovered} />
              </Section>

              <Section
                id="expenses"
                title="How much does comprehensive health insurance pay for each expense?"
                description="A basic plan caps several parts of the hospital bill. Here is what each plan pays on a ₹5 lakh sum insured."
              >
                <Card variant="primary" className="flex flex-col overflow-hidden">
                  <div aria-label="Expense headings" className="flex items-center gap-12 bg-surface-page-secondary px-16 py-12">
                    <div className="flex flex-1">
                      <Typography textStyle="label-xs-semibold" color="secondary">EXPENSE</Typography>
                    </div>
                    <div className="flex w-[96px] flex-none lg:w-[160px]">
                      <Typography textStyle="label-xs-semibold" color="secondary">BASIC PLAN</Typography>
                    </div>
                    <div className="flex w-[96px] flex-none lg:w-[120px]">
                      <Typography textStyle="label-xs-semibold" className="text-text-brand-default!">COMPREHENSIVE</Typography>
                    </div>
                  </div>
                  {expensePayouts.map(({ label, basic, comprehensive }) => (
                    <div key={label} className="flex items-center gap-12 border-t border-border-default-soft px-16 py-12">
                      <div className="flex min-w-0 flex-1">
                        <Typography textStyle="body-sm-regular">{label}</Typography>
                      </div>
                      <div className="flex w-[96px] flex-none lg:w-[160px]">
                        <Typography textStyle="body-sm-regular" color="secondary">{basic}</Typography>
                      </div>
                      <div className="flex w-[96px] flex-none lg:w-[120px]">
                        <Typography textStyle="label-sm-semibold" className="text-text-status-success!">{comprehensive}</Typography>
                      </div>
                    </div>
                  ))}
                </Card>
                <Typography textStyle="body-sm-regular" color="secondary">
                  With a room-rent cap, a basic plan cuts <strong>every</strong> part of the bill in proportion when you pick a costlier room — this is the most common reason claims are paid short.
                </Typography>
              </Section>

              <Section id="add-ons" title="Add-ons available with comprehensive health insurance" description="Close the gaps in your base plan for a small extra premium.">
                {/* Flex rows of flex-1 cards (not a grid): card heights vary with their text. */}
                <div className="flex flex-col gap-16">
                  <div className="flex flex-col gap-16 md:flex-row">
                    {addOns.slice(0, 2).map((addOn) => <AddOnCard key={addOn.name} addOn={addOn} />)}
                  </div>
                  <div className="flex flex-col gap-16 md:flex-row">
                    {addOns.slice(2).map((addOn) => <AddOnCard key={addOn.name} addOn={addOn} />)}
                  </div>
                </div>
                <div className="flex">
                  <Button variant="secondary" size="md">See all add-ons</Button>
                </div>
              </Section>

              <Section id="why-need" title="What happens without health insurance?" description="Real hospital bills, and what you would pay with and without cover.">
                <div className="flex flex-col gap-16 xl:flex-row">
                  {scenarios.map(({ title, body, without, withAcko }) => (
                    <Card key={title} variant="secondary" className="flex flex-col gap-16 p-16 xl:flex-1">
                      <div className="flex flex-col gap-4">
                        <Typography textStyle="label-lg-semibold" as="h3">{title}</Typography>
                        <Typography textStyle="body-sm-regular" color="secondary">{body}</Typography>
                      </div>
                      <div className="flex gap-8">
                        <div className="flex flex-1 flex-col gap-4 rounded-lg bg-surface-status-error-subtle p-12">
                          <Typography textStyle="label-xs-semibold" color="secondary">WITHOUT INSURANCE</Typography>
                          <Typography textStyle="heading-sm" className="text-text-status-error!">{without}</Typography>
                        </div>
                        <div className="flex flex-1 flex-col gap-4 rounded-lg bg-surface-status-success-subtle p-12">
                          <Typography textStyle="label-xs-semibold" color="secondary">WITH ACKO</Typography>
                          <Typography textStyle="heading-sm" className="text-text-status-success!">{withAcko}</Typography>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Section>

              <Section
                id="seniors"
                title="Comprehensive cover for senior citizens"
                description="Parents over 60 need cover that works with existing conditions and frequent check-ups."
              >
                <div className="flex flex-col gap-16 md:flex-row">
                  <Card variant="primary" className="flex flex-col gap-12 p-16 md:flex-1">
                    <div className="flex items-center gap-12">
                      <IconCircle Icon={ShieldCheck} />
                      <Typography textStyle="label-lg-semibold" as="h3">What's covered</Typography>
                    </div>
                    <CheckList items={seniorCover} />
                  </Card>
                  <Card variant="primary" className="flex flex-col gap-12 p-16 md:flex-1">
                    <div className="flex items-center gap-12">
                      <IconCircle Icon={HeartPulse} />
                      <Typography textStyle="label-lg-semibold" as="h3">Why it matters more after 60</Typography>
                    </div>
                    <CheckList items={seniorReasons} />
                  </Card>
                </div>
              </Section>

              <section id="buy-direct" aria-label="Buy direct" data-figma-id="health-direct" className="flex scroll-mt-24 flex-col gap-24 rounded-4xl bg-surface-brand-strong p-24 lg:p-32">
                <div className="flex flex-col items-start gap-16">
                  <Typography textStyle="heading-xl" as="h2" color="static">Buy directly from us. Get more. Save more.</Typography>
                  <Button variant="primary-on-dark" size="md">Check prices</Button>
                </div>
                <div className="flex flex-col gap-16 xl:flex-row">
                  {directBenefits.map(({ Icon, title, detail }) => (
                    <div key={title} className="flex items-start gap-12 xl:flex-1 xl:flex-col">
                      <IconCircle Icon={Icon} tone="bg-surface-card-default text-text-brand-default" />
                      <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <Typography textStyle="label-lg-semibold" as="h3" color="static">{title}</Typography>
                        <Typography textStyle="body-sm-regular" color="static">{detail}</Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <Section id="reviews" title="See why 5 crore+ Indians trust ACKO health insurance">
                <div className="flex flex-col gap-16 xl:flex-row">
                  {reviews.map(({ initials, name, meta, text }) => (
                    <Card key={name} variant="secondary" className="flex flex-col gap-12 p-16 xl:flex-1">
                      <div className="flex items-center gap-12">
                        <Avatar size={40} initials={initials} alt={name} />
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <Typography textStyle="label-md-semibold" truncate>{name}</Typography>
                          <Typography textStyle="body-sm-regular" color="secondary" truncate>{meta}</Typography>
                        </div>
                      </div>
                      <div aria-label="5 stars" className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="size-16 fill-current text-text-status-warning" aria-hidden="true" />
                        ))}
                      </div>
                      <Typography textStyle="body-sm-regular">{text}</Typography>
                    </Card>
                  ))}
                </div>
              </Section>

              <Section
                id="claims"
                title="Your trust isn't assumed, it's earned"
                description="Share of comprehensive health claims settled in FY 2025–26, by category."
              >
                <Card variant="primary" className="flex flex-col gap-16 p-20">
                  {claimStats.map(({ label, percent }) => (
                    <div key={label} className="flex flex-col gap-8">
                      <div className="flex items-center justify-between gap-8">
                        <Typography textStyle="body-sm-regular">{label}</Typography>
                        <Typography textStyle="label-md-semibold">{`${percent}%`}</Typography>
                      </div>
                      <div className="flex h-8 rounded-full bg-surface-brand-subtle">
                        <div className="flex rounded-full bg-surface-brand-strong" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  ))}
                </Card>
              </Section>

              <Section id="how-to-buy" title="How to buy comprehensive health insurance on ACKO">
                <StepList steps={buySteps} />
              </Section>

              <Section id="how-to-renew" title="How to renew your ACKO health insurance">
                <StepList steps={renewSteps} />
              </Section>

              <Section id="how-to-claim" title="How to file a claim">
                <div className="flex flex-col gap-12 xl:flex-row">
                  {claimSteps.map(({ Icon, title, detail }) => (
                    <Card key={title} variant="secondary" className="flex items-center gap-12 p-16 xl:flex-1">
                      <IconCircle Icon={Icon} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Typography textStyle="label-md-semibold" as="h3">{title}</Typography>
                        <Typography textStyle="body-sm-regular" color="secondary">{detail}</Typography>
                      </div>
                    </Card>
                  ))}
                </div>
              </Section>

              <Section id="why-acko" title="Why should you buy ACKO comprehensive health insurance">
                <FeatureRows items={whyAcko} />
              </Section>

              <Section
                id="ncb"
                title="What is a no-claim bonus in health insurance?"
                description="For every year without a claim, your sum insured grows at no extra cost — up to double your base cover."
              >
                <Card variant="primary" className="flex flex-col overflow-hidden">
                  <div aria-label="Bonus headings" className="flex items-center gap-12 bg-surface-page-secondary px-16 py-12">
                    <div className="flex flex-1">
                      <Typography textStyle="label-xs-semibold" color="secondary">POLICY YEAR</Typography>
                    </div>
                    <div className="flex w-[64px] flex-none">
                      <Typography textStyle="label-xs-semibold" color="secondary">BONUS</Typography>
                    </div>
                    <div className="flex w-[104px] flex-none">
                      <Typography textStyle="label-xs-semibold" color="secondary">YOUR COVER</Typography>
                    </div>
                  </div>
                  {ncbSchedule.map(({ year, bonus, cover }) => (
                    <div key={year} className="flex items-center gap-12 border-t border-border-default-soft px-16 py-12">
                      <div className="flex min-w-0 flex-1">
                        <Typography textStyle="body-sm-regular">{year}</Typography>
                      </div>
                      <div className="flex w-[64px] flex-none">
                        <Typography textStyle="label-sm-semibold">{bonus}</Typography>
                      </div>
                      <div className="flex w-[104px] flex-none">
                        <Typography textStyle="label-sm-semibold">{cover}</Typography>
                      </div>
                    </div>
                  ))}
                </Card>
                <div className="flex items-start gap-8 rounded-lg bg-surface-status-info-subtle p-12">
                  <Gift className="size-16 flex-none text-text-status-info" aria-hidden="true" />
                  <Typography textStyle="body-sm-regular">Your no-claim bonus moves with you when you port your policy to ACKO.</Typography>
                </div>
              </Section>

              <Section id="premium" title="What impacts your health insurance premium?">
                <FeatureRows items={premiumFactors} />
              </Section>

              <Section id="faqs" title="Frequently asked questions">
                <Card variant="secondary" className="flex flex-col overflow-hidden">
                  <Accordion type="multiple" size="md" defaultValue={['what']}>
                    {faqs.map(({ value, title, body }) => (
                      <AccordionItem key={value} value={value} title={title}>
                        <Typography textStyle="body-sm-regular" color="secondary">{body}</Typography>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              </Section>

              <Section id="learn-more" title="Learn more about health insurance">
                <div className="flex flex-col gap-12">
                  {articles.map(({ title, readTime }) => (
                    <a key={title} href="/" className="flex items-center gap-12 rounded-xl border border-border-default-soft bg-surface-card-default p-16">
                      <IconCircle Icon={CalendarCheck} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Typography textStyle="label-md-semibold" as="h3">{title}</Typography>
                        <Typography textStyle="body-sm-regular" color="secondary">{readTime}</Typography>
                      </div>
                      <ArrowRight className="size-20 flex-none text-text-secondary" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </Section>

              <Section title="Reviewed by ACKO insurance experts">
                <div className="flex flex-col gap-16 md:flex-row">
                  {experts.map(({ initials, name, role }) => (
                    <div key={name} className="flex items-center gap-12 md:flex-1">
                      <Avatar size={48} initials={initials} alt={name} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Typography textStyle="label-md-semibold" as="h3">{name}</Typography>
                        <Typography textStyle="body-sm-regular" color="secondary">{role}</Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </div>

        <Separator orientation="horizontal" variant="default" />

        <footer aria-label="Footer" className="flex flex-col gap-8">
          <div className="flex items-center gap-8">
            <Clock className="size-14 text-text-secondary" aria-hidden="true" />
            <Typography textStyle="body-sm-regular" color="secondary">Premiums shown are indicative and last updated 20 Oct 2026.</Typography>
          </div>
          <Typography textStyle="helper-xs-regular" color="secondary">ACKO General Insurance Ltd · IRDAI reg. no. 157 · Insurance is the subject matter of solicitation.</Typography>
        </footer>
      </div>
    </main>
  )
}

export default HealthInsurancePage

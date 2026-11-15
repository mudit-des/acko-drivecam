// url=https://www.figma.com/design/43PNFozqSuzG5R4XXDxOyj/Umbrella-DS-2.0?node-id=7273-163&m=dev
// component=Calendar
import figma from 'figma'

const instance = figma.selectedInstance
const { renderProp } = figma.helpers.react

const variant = instance.getEnum('Variant', {
  Single: 'single',
  Range: 'range',
  Multi: 'multi',
})

// Selection is application data: do not infer dates from static day labels.
// Month/year navigation is built into Calendar; the surrounding sheet and
// date-entry field in the documentation frame are separate components.
const selectionState =
  variant === 'range'
    ? 'const [value, setValue] = useState<DateRange | null>(null)'
    : variant === 'multi'
      ? 'const [value, setValue] = useState<Date[]>([])'
      : 'const [value, setValue] = useState<Date | null>(null)'

const calendarExample = figma.code`
  function CalendarExample() {
    // Initialize with your application's selected date(s), if any.
    ${selectionState}

    return (
      <Calendar${renderProp('variant', variant)} value={value} onChange={setValue} />
    )
  }
`

const unsupportedVariant = figma.code`
  /* This Figma Calendar variant has no verified @acko/calendar equivalent.
     Use a Single, Range or Multi variant to generate a Calendar example. */
`

export default {
  example: variant ? calendarExample : unsupportedVariant,
  imports: variant
    ? [
        'import { useState } from "react"',
        'import { Calendar } from "@acko/calendar"',
        ...(variant === 'range'
          ? ['import type { DateRange } from "@acko/calendar"']
          : []),
        'import "@acko/css/calendar.css"',
      ]
    : [],
  id: 'acko-calendar',
  metadata: {
    nestable: false,
    props: {
      variant,
    },
  },
}

import { defineFigmaExportConfig } from './tools/figma-export/config'

export default defineFigmaExportConfig({
  outputDirectory: 'figma-export-output',
  rootSelector: '#root > *',
  layoutMode: 'AUTO_LAYOUT',
  browserChannel: 'chrome',
  network: {
    allowedHosts: ['127.0.0.1', 'localhost'],
    failOnBlockedRequest: true,
  },
  fonts: {
    requiredFamilies: ['Euclid Circular B'],
    assumeAvailable: true,
    familyAliases: {
      '-apple-system': 'Euclid Circular B',
    },
  },
  // Pages are a mobile-first column capped at 480px, so screens are captured
  // at a phone viewport. Add a page per route you want in Figma; run a single
  // screen with `figma:export -- --route /stay`.
  pages: [
    {
      id: 'acko',
      name: 'ACKO insurance homepage',
      route: '/acko',
      viewports: [
        { id: 'desktop', width: 1440, height: 900 },
        { id: 'mobile', width: 390, height: 844 },
      ],
      states: [{ id: 'default', name: 'Default' }],
    },
    {
      id: 'drivecam',
      name: 'ACKO DriveCam landing page',
      route: '/drivecam',
      viewports: [
        { id: 'desktop', width: 1440, height: 900 },
        { id: 'mobile', width: 390, height: 844 },
      ],
      states: [{ id: 'default', name: 'Default' }],
    },
    {
      id: 'dash-cam',
      name: 'ACKO dash cam landing page',
      route: '/dash-cam',
      viewports: [
        { id: 'desktop', width: 1440, height: 900 },
        { id: 'mobile', width: 390, height: 844 },
      ],
      states: [{ id: 'default', name: 'Default' }],
    },
    {
      id: 'stay',
      name: 'Stay details',
      route: '/stay',
      viewports: [
        { id: 'desktop', width: 1440, height: 900 },
        { id: 'mobile', width: 390, height: 844 },
      ],
      states: [{ id: 'default', name: 'Default' }],
    },
    {
      id: 'health-insurance',
      name: 'Comprehensive health insurance',
      route: '/health-insurance',
      viewports: [
        { id: 'desktop', width: 1440, height: 900 },
        { id: 'mobile', width: 390, height: 844 },
      ],
      states: [{ id: 'default', name: 'Default' }],
    },
  ],
})

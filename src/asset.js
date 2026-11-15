// Public files (images, videos, frames) live under the site's base path: "/" locally, "/acko-drivecam/" on GitHub Pages.
export const asset = (path) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`

/**
 * Absolute URLs that respect the deployment's base path.
 *
 * On Vercel the app is served from the domain root, but on GitHub Pages a
 * project site lives under /<repo>/. window.location.origin alone would send
 * OAuth callbacks to the root, which is not the app.
 */
export function appUrl(path = '') {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`.replace(/\/+$/, '')
  return path ? `${base}/${String(path).replace(/^\/+/, '')}` : base
}

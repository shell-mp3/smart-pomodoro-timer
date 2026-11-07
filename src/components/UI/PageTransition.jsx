import { useLocation } from 'react-router-dom'

/**
 * Materialises each route as it mounts: blur, scale and fade resolving
 * together rather than a flat opacity ramp.
 *
 * Keyed on pathname so the animation restarts per route. Enter only - React
 * Router unmounts the old route immediately, so there is no exit frame to
 * animate without holding both trees in memory, which is not worth it here.
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}

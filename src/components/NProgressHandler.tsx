import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { NProgress } from '../lib/nprogress'

export function NProgressHandler() {
  const location = useLocation()

  useLayoutEffect(() => {
    NProgress.start()
    NProgress.done()
  }, [location.pathname, location.key])

  return null
}

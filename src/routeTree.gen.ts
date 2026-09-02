/* eslint-disable */
// @ts-nocheck
// Generated-compatible fallback route tree. TanStack Router normally regenerates this file.

import { Route as rootRoute } from './routes/__root'
import { Route as indexRoute } from './routes/index'
import { Route as dashboardRoute } from './routes/dashboard'
import { Route as forgotPasswordRoute } from './routes/forgot-password'
import { Route as loginRoute } from './routes/login'
import { Route as registerRoute } from './routes/register'
import { Route as resetPasswordRoute } from './routes/reset-password'

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  forgotPasswordRoute,
  loginRoute,
  registerRoute,
  resetPasswordRoute,
])

export { routeTree }

/* eslint-disable */
// @ts-nocheck
// Generated-compatible fallback route tree. TanStack Router normally regenerates this file.

import { Route as rootRoute } from './routes/__root'
import { Route as indexRoute } from './routes/index'
import { Route as dashboardRoute } from './routes/dashboard'
import { Route as dashboardRobotRoute } from './routes/dashboard_.robot'
import { Route as dashboardOperacionesRoute } from './routes/dashboard_.operaciones'
import { Route as dashboardPortafolioRoute } from './routes/dashboard_.portafolio'
import { Route as dashboardFondosRoute } from './routes/dashboard_.fondos'
import { Route as dashboardNotificacionesRoute } from './routes/dashboard_.notificaciones'
import { Route as dashboardPerfilRoute } from './routes/dashboard_.perfil'
import { Route as dashboardPreferenciasRoute } from './routes/dashboard_.preferencias'
import { Route as dashboardSeguridadRoute } from './routes/dashboard_.seguridad'
import { Route as dashboardAdminRoute } from './routes/dashboard_.admin'
import { Route as forgotPasswordRoute } from './routes/forgot-password'
import { Route as loginRoute } from './routes/login'
import { Route as registerRoute } from './routes/register'
import { Route as resetPasswordRoute } from './routes/reset-password'

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  dashboardRobotRoute,
  dashboardOperacionesRoute,
  dashboardPortafolioRoute,
  dashboardFondosRoute,
  dashboardNotificacionesRoute,
  dashboardPerfilRoute,
  dashboardPreferenciasRoute,
  dashboardSeguridadRoute,
  dashboardAdminRoute,
  forgotPasswordRoute,
  loginRoute,
  registerRoute,
  resetPasswordRoute,
])

export { routeTree }

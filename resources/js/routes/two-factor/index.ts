// resources/js/routes/two-factor/index.ts
import {
  queryParams,
  type RouteQueryOptions,
  type RouteDefinition,
} from '../wayfinder'

/** GET /two-factor */
export const show = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: show.url(o),
  method: 'get',
})
show.definition = { methods: ['get', 'head'] as const, url: '/two-factor' } as const
show.url  = (o?: RouteQueryOptions) => show.definition.url + queryParams(o)
show.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: show.url(o),  method: 'get'  })
show.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: show.url(o),  method: 'head' })

/** GET /two-factor-challenge */
export const login = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: login.url(o),
  method: 'get',
})
login.definition = { methods: ['get', 'head'] as const, url: '/two-factor-challenge' } as const
login.url  = (o?: RouteQueryOptions) => login.definition.url + queryParams(o)
login.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: login.url(o),  method: 'get'  })
login.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: login.url(o),  method: 'head' })

/** POST /user/two-factor-authentication */
export const enable = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: enable.url(o),
  method: 'post',
})
enable.definition = { method: 'post' as const, url: '/user/two-factor-authentication' } as const
enable.url = (o?: RouteQueryOptions) => enable.definition.url + queryParams(o)
enable.post = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({ url: enable.url(o), method: 'post' })

/** POST /user/confirmed-two-factor-authentication */
export const confirm = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: confirm.url(o),
  method: 'post',
})
confirm.definition = { method: 'post' as const, url: '/user/confirmed-two-factor-authentication' } as const
confirm.url = (o?: RouteQueryOptions) => confirm.definition.url + queryParams(o)
confirm.post = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({ url: confirm.url(o), method: 'post' })

/** DELETE /user/two-factor-authentication */
export const disable = (o?: RouteQueryOptions): RouteDefinition<'delete'> => ({
  url: disable.url(o),
  method: 'delete',
})
disable.definition = { method: 'delete' as const, url: '/user/two-factor-authentication' } as const
disable.url = (o?: RouteQueryOptions) => disable.definition.url + queryParams(o)
disable.delete = (o?: RouteQueryOptions): RouteDefinition<'delete'> => ({ url: disable.url(o), method: 'delete' })

/** GET /user/two-factor-qr-code */
export const qrCode = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: qrCode.url(o),
  method: 'get',
})
qrCode.definition = { methods: ['get', 'head'] as const, url: '/user/two-factor-qr-code' } as const
qrCode.url  = (o?: RouteQueryOptions) => qrCode.definition.url + queryParams(o)
qrCode.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: qrCode.url(o),  method: 'get'  })
qrCode.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: qrCode.url(o),  method: 'head' })

/** GET /user/two-factor-secret-key */
export const secretKey = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: secretKey.url(o),
  method: 'get',
})
secretKey.definition = { methods: ['get', 'head'] as const, url: '/user/two-factor-secret-key' } as const
secretKey.url  = (o?: RouteQueryOptions) => secretKey.definition.url + queryParams(o)
secretKey.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: secretKey.url(o),  method: 'get'  })
secretKey.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: secretKey.url(o),  method: 'head' })

/** GET /user/two-factor-recovery-codes */
export const recoveryCodes = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: recoveryCodes.url(o),
  method: 'get',
})
recoveryCodes.definition = { methods: ['get', 'head'] as const, url: '/user/two-factor-recovery-codes' } as const
recoveryCodes.url  = (o?: RouteQueryOptions) => recoveryCodes.definition.url + queryParams(o)
recoveryCodes.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: recoveryCodes.url(o),  method: 'get'  })
recoveryCodes.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: recoveryCodes.url(o),  method: 'head' })

/** POST /user/two-factor-recovery-codes */
export const regenerateRecoveryCodes = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: regenerateRecoveryCodes.url(o),
  method: 'post',
})
regenerateRecoveryCodes.definition = { method: 'post' as const, url: '/user/two-factor-recovery-codes' } as const
regenerateRecoveryCodes.url = (o?: RouteQueryOptions) =>
  regenerateRecoveryCodes.definition.url + queryParams(o)
regenerateRecoveryCodes.post = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: regenerateRecoveryCodes.url(o),
  method: 'post',
})

/** Default export bundle (optional) */
const twoFactorRoutes = {
  show,
  login,
  enable,
  confirm,
  disable,
  qrCode,
  secretKey,
  recoveryCodes,
  regenerateRecoveryCodes,
}
export default twoFactorRoutes

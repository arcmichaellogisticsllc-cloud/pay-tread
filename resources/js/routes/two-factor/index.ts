cat > resources/js/routes/two-factor/index.ts <<'EOF'
import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import loginGen from './login'

/**
 * /two-factor-challenge (GET/HEAD)
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: login.url(options),
  method: 'get',
})
login.definition = { methods: ['get','head'], url: '/two-factor-challenge' } as const
login.url = (options?: RouteQueryOptions) => login.definition.url + queryParams(options)
login.get = (o?: RouteQueryOptions) => ({ url: login.url(o), method: 'get' as const })
login.head = (o?: RouteQueryOptions) => ({ url: login.url(o), method: 'head' as const })

/**
 * /user/two-factor-authentication (GET/HEAD)
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: show.url(options),
  method: 'get',
})
show.definition = { methods: ['get','head'], url: '/user/two-factor-authentication' } as const
show.url = (o?: RouteQueryOptions) => show.definition.url + queryParams(o)
show.get = (o?: RouteQueryOptions) => ({ url: show.url(o), method: 'get' as const })
show.head = (o?: RouteQueryOptions) => ({ url: show.url(o), method: 'head' as const })

/**
 * /user/two-factor-authentication (POST)
 */
export const enable = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: enable.url(options),
  method: 'post',
})
enable.definition = { methods: ['post'], url: '/user/two-factor-authentication' } as const
enable.url = (o?: RouteQueryOptions) => enable.definition.url + queryParams(o)
enable.post = (o?: RouteQueryOptions) => ({ url: enable.url(o), method: 'post' as const })

/**
 * /user/confirmed-two-factor-authentication (POST)
 */
export const confirm = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: confirm.url(options),
  method: 'post',
})
confirm.definition = { methods: ['post'], url: '/user/confirmed-two-factor-authentication' } as const
confirm.url = (o?: RouteQueryOptions) => confirm.definition.url + queryParams(o)
confirm.post = (o?: RouteQueryOptions) => ({ url: confirm.url(o), method: 'post' as const })

/**
 * /user/two-factor-authentication (DELETE)
 */
export const disable = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
  url: disable.url(options),
  method: 'delete',
})
disable.definition = { methods: ['delete'], url: '/user/two-factor-authentication' } as const
disable.url = (o?: RouteQueryOptions) => disable.definition.url + queryParams(o)
disable.delete = (o?: RouteQueryOptions) => ({ url: disable.url(o), method: 'delete' as const })

/**
 * /user/two-factor-qr-code (GET/HEAD)
 */
export const qrCode = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: qrCode.url(options),
  method: 'get',
})
qrCode.definition = { methods: ['get','head'], url: '/user/two-factor-qr-code' } as const
qrCode.url = (o?: RouteQueryOptions) => qrCode.definition.url + queryParams(o)
qrCode.get = (o?: RouteQueryOptions) => ({ url: qrCode.url(o), method: 'get' as const })
qrCode.head = (o?: RouteQueryOptions) => ({ url: qrCode.url(o), method: 'head' as const })

/**
 * /user/two-factor-secret-key (GET/HEAD)
 */
export const secretKey = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: secretKey.url(options),
  method: 'get',
})
secretKey.definition = { methods: ['get','head'], url: '/user/two-factor-secret-key' } as const
secretKey.url = (o?: RouteQueryOptions) => secretKey.definition.url + queryParams(o)
secretKey.get = (o?: RouteQueryOptions) => ({ url: secretKey.url(o), method: 'get' as const })
secretKey.head = (o?: RouteQueryOptions) => ({ url: secretKey.url(o), method: 'head' as const })

/**
 * /user/two-factor-recovery-codes (GET/HEAD, POST)
 */
export const recoveryCodes = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: recoveryCodes.url(options),
  method: 'get',
})
recoveryCodes.definition = { methods: ['get','head'], url: '/user/two-factor-recovery-codes' } as const
recoveryCodes.url = (o?: RouteQueryOptions) => recoveryCodes.definition.url + queryParams(o)
recoveryCodes.get = (o?: RouteQueryOptions) => ({ url: recoveryCodes.url(o), method: 'get' as const })
recoveryCodes.head = (o?: RouteQueryOptions) => ({ url: recoveryCodes.url(o), method: 'head' as const })

export const regenerateRecoveryCodes = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: regenerateRecoveryCodes.url(options),
  method: 'post',
})
regenerateRecoveryCodes.definition = { methods: ['post'], url: '/user/two-factor-recovery-codes' } as const
regenerateRecoveryCodes.url = (o?: RouteQueryOptions) => regenerateRecoveryCodes.definition.url + queryParams(o)
regenerateRecoveryCodes.post = (o?: RouteQueryOptions) => ({ url: regenerateRecoveryCodes.url(o), method: 'post' as const })

/**
 * Default export (optional convenience)
 */
const twoFactor = {
  login: Object.assign(login, loginGen),
  show: Object.assign(show, show),
  enable: Object.assign(enable, enable),
  confirm: Object.assign(confirm, confirm),
  disable: Object.assign(disable, disable),
  qrCode: Object.assign(qrCode, qrCode),
  secretKey: Object.assign(secretKey, secretKey),
  recoveryCodes: Object.assign(recoveryCodes, recoveryCodes),
  regenerateRecoveryCodes: Object.assign(regenerateRecoveryCodes, regenerateRecoveryCodes),
}

export default twoFactor
EOF

// resources/js/routes/verification/index.ts
import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../../wayfinder'

/** GET /verify-email  (Email verification prompt/notice) */
export const notice = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: notice.url(o),
  method: 'get',
})
notice.definition = { methods: ['get', 'head'], url: '/verify-email' } as const
notice.url  = (o?: RouteQueryOptions) => notice.definition.url + queryParams(o)
notice.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: notice.url(o),  method: 'get'  })
notice.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: notice.url(o),  method: 'head' })

/**
 * GET /verify-email/{id}/{hash}  (Verify link target)
 * Pass id/hash if you want a concrete URL; if omitted, placeholders remain (useful for debugging).
 */
type VerifyOpts = RouteQueryOptions & { id?: string | number; hash?: string }
export const verify = (o?: VerifyOpts): RouteDefinition<'get'> => ({
  url: verify.url(o),
  method: 'get',
})
verify.definition = { methods: ['get', 'head'], url: '/verify-email/:id/:hash' } as const
verify.url = (o?: VerifyOpts) => {
  const id   = o?.id ?? ':id'
  const hash = o?.hash ?? ':hash'
  const path = `/verify-email/${encodeURIComponent(String(id))}/${encodeURIComponent(String(hash))}`
  return path + queryParams(o)
}
verify.get  = (o?: VerifyOpts): RouteDefinition<'get'>  => ({ url: verify.url(o),  method: 'get'  })
verify.head = (o?: VerifyOpts): RouteDefinition<'head'> => ({ url: verify.url(o),  method: 'head' })

/** POST /email/verification-notification (Resend verification email) */
export const send = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: send.url(o),
  method: 'post',
})
send.definition = { methods: ['post'], url: '/email/verification-notification' } as const
send.url  = (o?: RouteQueryOptions) => send.definition.url + queryParams(o)
send.post = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({ url: send.url(o), method: 'post' })

/* Default export bundle */
const verificationRoutes = { notice, verify, send }
export default verificationRoutes

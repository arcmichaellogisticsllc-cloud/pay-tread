// resources/js/routes/verification/index.ts
import {
  queryParams,
  applyUrlDefaults,
  type RouteQueryOptions,
  type RouteDefinition,
} from '../wayfinder'

/** GET /verify-email */
export const notice = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: notice.url(o),
  method: 'get',
})
notice.definition = { methods: ['get', 'head'] as const, url: '/verify-email' } as const
notice.url  = (o?: RouteQueryOptions) => notice.definition.url + queryParams(o)
notice.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: notice.url(o),  method: 'get'  })
notice.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: notice.url(o),  method: 'head' })

/** GET /verify-email/{id}/{hash} */
type VerifyArgs =
  | { id: string | number; hash: string | number }
  | [id: string | number, hash: string | number]

export const verify = (args: VerifyArgs, o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: verify.url(args, o),
  method: 'get',
})
verify.definition = {
  methods: ['get', 'head'] as const,
  url: '/verify-email/{id}/{hash}',
} as const
verify.url = (args: VerifyArgs, o?: RouteQueryOptions) => {
  const obj = Array.isArray(args) ? { id: args[0], hash: args[1] } : args
  const withDefaults = applyUrlDefaults(obj)
  const url =
    verify.definition.url
      .replace('{id}', St

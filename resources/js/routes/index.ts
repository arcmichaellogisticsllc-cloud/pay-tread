import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../wayfinder'

/**
 * Minimal /dashboard helper because the app imports:
 *   import { dashboard } from '@routes'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: dashboard.url(options),
  method: 'get',
})
dashboard.definition = { methods: ['get','head'], url: '/dashboard' } as const
dashboard.url  = (o?: RouteQueryOptions) => dashboard.definition.url + queryParams(o)
dashboard.get  = (o?: RouteQueryOptions) => ({ url: dashboard.url(o), method: 'get'  as const })
dashboard.head = (o?: RouteQueryOptions) => ({ url: dashboard.url(o), method: 'head' as const })

/**
 * Re-export the specific helpers that the app imports elsewhere.
 * (Your step 2/3 files define these.)
 */
export { edit } from './password'
export { show } from './two-factor'

/**
 * (Optional) re-export the whole modules if you like:
 * export * as password from './password'
 * export * as twoFactor from './two-factor'
 */

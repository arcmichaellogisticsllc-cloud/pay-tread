import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../wayfinder'

/** GET /  (matches routes/web.php -> inertia('dashboard')) */
export const dashboard = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: dashboard.url(o),
  method: 'get',
})
dashboard.definition = { methods: ['get', 'head'], url: '/' } as const
dashboard.url  = (o?: RouteQueryOptions) => dashboard.definition.url + queryParams(o)
dashboard.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: dashboard.url(o),  method: 'get'  })
dashboard.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: dashboard.url(o),  method: 'head' })

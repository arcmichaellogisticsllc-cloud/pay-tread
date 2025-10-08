// resources/js/routes/dashboard/index.ts
import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../../wayfinder' // <-- relative to routes/dashboard/

// GET /dashboard
export const dashboard = (
  options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
  url: dashboard.url(options),
  method: 'get',
})

dashboard.definition = {
  methods: ['get', 'head'] as const,
  url: '/dashboard',
} as const

dashboard.url = (o?: RouteQueryOptions) =>
  dashboard.definition.url + queryParams(o)

dashboard.get = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: dashboard.url(o),
  method: 'get',
})

dashboard.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({
  url: dashboard.url(o),
  method: 'head',
})

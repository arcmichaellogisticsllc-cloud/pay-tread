// resources/js/routes/appearance.ts
import { queryParams, type RouteQueryOptions, type RouteDefinition } from '@/wayfinder'

/** GET /settings/appearance */
export const edit = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: edit.url(o),
  method: 'get',
})

edit.definition = { methods: ['get', 'head'], url: '/settings/appearance' } as const
edit.url  = (o?: RouteQueryOptions) => edit.definition.url + queryParams(o)
edit.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: edit.url(o),  method: 'get' })
edit.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: edit.url(o),  method: 'head' })

export default { edit }

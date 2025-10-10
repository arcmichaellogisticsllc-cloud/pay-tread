// resources/js/routes/appearance/index.ts
import {
  queryParams,
  type RouteQueryOptions,
  type RouteDefinition,
} from '../wayfinder'

/** GET /settings/appearance */
export const edit = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: edit.url(o),
  method: 'get',
})
edit.definition = { methods: ['get', 'head'] as const, url: '/settings/appearance' } as const
edit.url  = (o?: RouteQueryOptions) => edit.definition.url + queryParams(o)
edit.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: edit.url(o),  method: 'get'  })
edit.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: edit.url(o),  method: 'head' })

/** PUT /settings/appearance */
export const update = (o?: RouteQueryOptions): RouteDefinition<'put'> => ({
  url: update.url(o),
  method: 'put',
})
update.definition = { method: 'put' as const, url: '/settings/appearance' } as const
update.url = (o?: RouteQueryOptions) => update.definition.url + queryParams(o)

/** Default export bundle (so `import appearance from '@/routes/appearance'` works) */
const appearanceRoutes = { edit, update }
export default appearanceRoutes

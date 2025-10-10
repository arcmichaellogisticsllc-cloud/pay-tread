// resources/js/routes/profile/index.ts
import {
  queryParams,
  type RouteQueryOptions,
  type RouteDefinition,
} from '../wayfinder'

/** GET /settings/profile */
export const edit = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: edit.url(o),
  method: 'get',
})
edit.definition = { methods: ['get', 'head'] as const, url: '/settings/profile' } as const
edit.url  = (o?: RouteQueryOptions) => edit.definition.url + queryParams(o)
edit.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: edit.url(o),  method: 'get'  })
edit.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: edit.url(o),  method: 'head' })

/** PUT /settings/profile */
export const update = (o?: RouteQueryOptions): RouteDefinition<'put'> => ({
  url: update.url(o),
  method: 'put',
})
update.definition = { method: 'put' as const, url: '/settings/profile' } as const
update.url = (o?: RouteQueryOptions) => update.definition.url + queryParams(o)

/** DELETE /settings/profile (optional, if you support account deletion here) */
export const destroy = (o?: RouteQueryOptions): RouteDefinition<'delete'> => ({
  url: destroy.url(o),
  method: 'delete',
})
destroy.definition = { method: 'delete' as const, url: '/settings/profile' } as const
destroy.url = (o?: RouteQueryOptions) => destroy.definition.url + queryParams(o)
const profileRoutes = { edit, update, destroy };
export default profileRoutes;

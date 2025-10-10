// resources/js/routes/profile.ts
import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../wayfinder'

/** GET /profile */
export const edit = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: edit.url(o),
  method: 'get',
})
edit.definition = { methods: ['get', 'head'], url: '/profile' } as const
edit.url  = (o?: RouteQueryOptions) => edit.definition.url + queryParams(o)
edit.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: edit.url(o),  method: 'get'  })
edit.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: edit.url(o),  method: 'head' })

/** PATCH /profile */
export const update = (o?: RouteQueryOptions): RouteDefinition<'patch'> => ({
  url: update.url(o),
  method: 'patch',
})
update.definition = { methods: ['patch'], url: '/profile' } as const
update.url = (o?: RouteQueryOptions) => update.definition.url + queryParams(o)
update.patch = (o?: RouteQueryOptions): RouteDefinition<'patch'> => ({ url: update.url(o), method: 'patch' })

/** DELETE /profile */
export const destroy = (o?: RouteQueryOptions): RouteDefinition<'delete'> => ({
  url: destroy.url(o),
  method: 'delete',
})
destroy.definition = { methods: ['delete'], url: '/profile' } as const
destroy.url   = (o?: RouteQueryOptions) => destroy.definition.url + queryParams(o)
destroy.delete = (o?: RouteQueryOptions): RouteDefinition<'delete'> => ({ url: destroy.url(o), method: 'delete' })

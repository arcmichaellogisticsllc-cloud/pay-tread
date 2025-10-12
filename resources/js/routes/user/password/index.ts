import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../../../wayfinder'

/** GET /user/password */
export const edit = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: edit.url(o),
  method: 'get',
})
edit.definition = { methods: ['get', 'head'], url: '/user/password' } as const
edit.url  = (o?: RouteQueryOptions) => edit.definition.url + queryParams(o)
edit.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: edit.url(o),  method: 'get' })
edit.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: edit.url(o),  method: 'head' })

/** PUT /user/password */
export const update = (o?: RouteQueryOptions): RouteDefinition<'put'> => ({
  url: update.url(o),
  method: 'put',
})
update.definition = { methods: ['put'], url: '/user/password' } as const
update.url = (o?: RouteQueryOptions) => update.definition.url + queryParams(o)

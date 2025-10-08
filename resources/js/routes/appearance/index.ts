import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../wayfinder';
// If '../wayfinder' does not exist, create it with the required exports or update the path below:
// import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../correct/path/wayfinder'

/** GET /settings/appearance */
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: edit.url(options),
  method: 'get',
})

edit.definition = { methods: ['get', 'head'], url: '/settings/appearance' } as const
edit.url  = (o?: RouteQueryOptions) => edit.definition.url + queryParams(o)
edit.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: edit.url(o),  method: 'get'  })
edit.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: edit.url(o),  method: 'head' })

// (No default export—module exposes the named `edit` helper)

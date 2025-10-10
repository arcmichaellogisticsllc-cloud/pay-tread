// resources/js/routes/user/password.ts
import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../../wayfinder' // relative to routes/user/

// GET /user/password
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: edit.url(options),
  method: 'get',
})
edit.definition = { methods: ['get', 'head'] as const, url: '/user/password' } as const
edit.url  = (o?: RouteQueryOptions) => edit.definition.url + queryParams(o)
edit.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: edit.url(o),  method: 'get'  })
edit.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: edit.url(o),  method: 'head' })

// PUT /user/password
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
  url: update.url(options),
  method: 'put',
})
update.definition = { method: 'put' as const, url: '/user/password' } as const
update.url = (o?: RouteQueryOptions) => update.definition.url + queryParams(o)

/** optional helper for form bindings (POST + method spoofing) */
export const form = () => ({
  edit: edit(),
  update: { action: update().url, method: 'post' as const },
})
const userPasswordRoutes = { edit, update, form };
export default userPasswordRoutes;

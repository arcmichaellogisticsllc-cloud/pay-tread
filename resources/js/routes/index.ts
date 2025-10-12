// resources/js/routes/index.ts
import {
  queryParams,
  type RouteQueryOptions,
  type RouteDefinition,
} from '../wayfinder'

// central re-exports (leaf modules live in their own folders)
export * from './dashboard'                      // exports { dashboard }
export * as appearance from './appearance'       // exposes { edit }
export * as userPassword from './user/password'  // exposes { edit, update }
export * from './profile'                        // exposes { edit, update, destroy }
export * from './verification'                   // exposes { send }

// Example top-level helpers:

/** GET /login */
export const login = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: login.url(o),
  method: 'get',
})
login.definition = { methods: ['get', 'head'], url: '/login' } as const
login.url  = (o?: RouteQueryOptions) => login.definition.url + queryParams(o)
login.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: login.url(o),  method: 'get'  })
login.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: login.url(o),  method: 'head' })

/** POST /logout */
export const logout = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: logout.url(o),
  method: 'post',
})
logout.definition = { methods: ['post'], url: '/logout' } as const
logout.url  = (o?: RouteQueryOptions) => logout.definition.url + queryParams(o)
logout.post = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({ url: logout.url(o), method: 'post' })

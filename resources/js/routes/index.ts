// resources/js/routes/index.ts
import {
  queryParams,
  type RouteQueryOptions,
  type RouteDefinition,
} from './wayfinder'

// central re-exports (leaf modules live in their own folders)
export * as appearance from './appearance'
export * from './dashboard'
export * as userPassword from './user/password'
export * from './profile'        // re-exports { edit, update, destroy }
export * from './verification'   // re-exports { notice, verify, send }
export * from './two-factor'     // re-exports { show, login, ... }

// /login
export const login = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: login.url(o),
  method: 'get',
})
login.definition = { methods: ['get', 'head'] as const, url: '/login' } as const
login.url  = (o?: RouteQueryOptions) => login.definition.url + queryParams(o)
login.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: login.url(o),  method: 'get'  })
login.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: login.url(o),  method: 'head' })

// /logout
export const logout = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: logout.url(o),
  method: 'post',
})
logout.definition = { methods: ['post'] as const, url: '/logout' } as const
logout.url  = (o?: RouteQueryOptions) => logout.definition.url + queryParams(o)
logout.post = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({ url: logout.url(o), method: 'post' })

// /
export const home = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: home.url(o),
  method: 'get',
})
home.definition = { methods: ['get', 'head'] as const, url: '/' } as const
home.url  = (o?: RouteQueryOptions) => home.definition.url + queryParams(o)
home.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: home.url(o),  method: 'get'  })
home.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: home.url(o),  method: 'head' })

// /style-guide
export const styleGuide = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: styleGuide.url(o),
  method: 'get',
})
styleGuide.definition = { methods: ['get', 'head'] as const, url: '/style-guide' } as const
styleGuide.url  = (o?: RouteQueryOptions) => styleGuide.definition.url + queryParams(o)
styleGuide.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: styleGuide.url(o),  method: 'get'  })
styleGuide.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: styleGuide.url(o),  method: 'head' })

// /register
export const register = (o?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: register.url(o),
  method: 'get',
})
register.definition = { methods: ['get', 'head'] as const, url: '/register' } as const
register.url  = (o?: RouteQueryOptions) => register.definition.url + queryParams(o)
register.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: register.url(o),  method: 'get'  })
register.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: register.url(o),  method: 'head' })

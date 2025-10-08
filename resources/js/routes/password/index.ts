// resources/js/routes/password/index.ts
import { queryParams, type RouteQueryOptions, type RouteDefinition } from '../../wayfinder'

/**
 * GET /user/password  (password settings page)
 */
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: edit.url(options),
  method: 'get',
})
edit.definition = { methods: ['get', 'head'], url: '/user/password' } as const
edit.url  = (o?: RouteQueryOptions) => edit.definition.url + queryParams(o)
edit.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: edit.url(o),  method: 'get'  })
edit.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: edit.url(o),  method: 'head' })

/**
 * PUT /user/password  (update password)
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
  url: update.url(options),
  method: 'put',
})
update.definition = { methods: ['put'], url: '/user/password' } as const
update.url  = (o?: RouteQueryOptions) => update.definition.url + queryParams(o)
update.put  = (o?: RouteQueryOptions): RouteDefinition<'put'> => ({ url: update.url(o), method: 'put' })

/**
 * GET /user/confirm-password
 */
export const confirm = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: confirm.url(options),
  method: 'get',
})
confirm.definition = { methods: ['get', 'head'], url: '/user/confirm-password' } as const
confirm.url  = (o?: RouteQueryOptions) => confirm.definition.url + queryParams(o)
confirm.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: confirm.url(o),  method: 'get'  })
confirm.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: confirm.url(o),  method: 'head' })

/**
 * GET /user/confirmed-password-status
 */
export const confirmation = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: confirmation.url(options),
  method: 'get',
})
confirmation.definition = { methods: ['get', 'head'], url: '/user/confirmed-password-status' } as const
confirmation.url  = (o?: RouteQueryOptions) => confirmation.definition.url + queryParams(o)
confirmation.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: confirmation.url(o),  method: 'get'  })
confirmation.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: confirmation.url(o),  method: 'head' })

/**
 * GET /forgot-password  (request reset form)
 */
export const request = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: request.url(options),
  method: 'get',
})
request.definition = { methods: ['get', 'head'], url: '/forgot-password' } as const
request.url  = (o?: RouteQueryOptions) => request.definition.url + queryParams(o)
request.get  = (o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: request.url(o),  method: 'get'  })
request.head = (o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: request.url(o),  method: 'head' })

/**
 * POST /forgot-password  (send reset link email)
 */
export const email = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: email.url(options),
  method: 'post',
})
email.definition = { methods: ['post'], url: '/forgot-password' } as const
email.url  = (o?: RouteQueryOptions) => email.definition.url + queryParams(o)
email.post = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({ url: email.url(o), method: 'post' })

/**
 * GET /reset-password/{token}  (new password form)
 */
type TokenArg = { token: string | number } | [token: string | number] | string | number
export const reset = (args: TokenArg, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: reset.url(args, options),
  method: 'get',
})
reset.definition = { methods: ['get', 'head'], url: '/reset-password/{token}' } as const
reset.url = (args: TokenArg, options?: RouteQueryOptions) => {
  let token: string | number
  if (Array.isArray(args)) token = args[0]
  else if (typeof args === 'object') token = (args as { token: string | number }).token
  else token = args
  return reset.definition.url.replace('{token}', String(token)).replace(/\/+$/, '') + queryParams(options)
}
reset.get  = (args: TokenArg, o?: RouteQueryOptions): RouteDefinition<'get'>  => ({ url: reset.url(args, o),  method: 'get'  })
reset.head = (args: TokenArg, o?: RouteQueryOptions): RouteDefinition<'head'> => ({ url: reset.url(args, o),  method: 'head' })

/**
 * POST /reset-password  (submit new password)
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
  url: store.url(options),
  method: 'post',
})
store.definition = { methods: ['post'], url: '/reset-password' } as const
store.url  = (o?: RouteQueryOptions) => store.definition.url + queryParams(o)
store.post = (o?: RouteQueryOptions): RouteDefinition<'post'> => ({ url: store.url(o), method: 'post' })

/**
 * Default export: namespace-style object
 */
const password = {
  edit,
  update,
  confirm,
  confirmation,
  request,
  email,
  reset,
  store,
}
export default password

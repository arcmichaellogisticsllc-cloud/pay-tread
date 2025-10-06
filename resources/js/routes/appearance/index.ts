import {
  queryParams,
  type RouteQueryOptions,
  type RouteDefinition,
} from '../../wayfinder'

// GET /settings/appearance
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: edit.url(options),
  method: 'get',
})

edit.definition = {
  methods: ['get', 'head'],
  url: '/settings/appearance',
} as const

edit.url = (options?: RouteQueryOptions) =>
  edit.definition.url + queryParams(options)

edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
  url: edit.url(options),
  method: 'get',
})

edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
  url: edit.url(options),
  method: 'head',
})

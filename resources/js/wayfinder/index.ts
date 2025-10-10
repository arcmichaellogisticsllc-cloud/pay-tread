export type QueryParams = Record<
  string,
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined
  | Record<string, string | number | boolean>
>

export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options'

// Supports either a single method or an array of methods (some files use "methods")
export type RouteDefinition<TMethod extends Method | Method[]> = {
  url: string
} & (TMethod extends Method[] ? { methods: TMethod } : { method: TMethod })

export type RouteFormDefinition<TMethod extends Method> = {
  action: string
  method: TMethod
}

export type RouteQueryOptions = {
  query?: QueryParams
  mergeQuery?: QueryParams
}

// Build a query string, with optional merge of existing window params
export const queryParams = (options?: RouteQueryOptions): string => {
  if (!options || (!options.query && !options.mergeQuery)) return ''

  const query = options.query ?? options.mergeQuery
  const includeExisting = options.mergeQuery !== undefined

  const getValue = (value: string | number | boolean) => {
    if (value === true) return '1'
    if (value === false) return '0'
    return value.toString()
  }

  const params = new URLSearchParams(
    includeExisting && typeof window !== 'undefined' ? window.location.search : ''
  )

  for (const key in query) {
    const val = query[key]

    if (val === undefined || val === null) {
      params.delete(key)
      continue
    }

    if (Array.isArray(val)) {
      if (params.has(`${key}[]`)) params.delete(`${key}[]`)
      val.forEach(v => params.append(`${key}[]`, v.toString()))
      continue
    }

    if (typeof val === 'object') {
      // clear previous nested keys like foo[bar]
      params.forEach((_, paramKey) => {
        if (paramKey.startsWith(`${key}[`)) params.delete(paramKey)
      })
      for (const subKey in val) {
        const subVal = (val as Record<string, unknown>)[subKey]
        if (subVal === undefined) continue
        if (['string', 'number', 'boolean'].includes(typeof subVal)) {
          params.set(`${key}[${subKey}]`, getValue(subVal as string | number | boolean))
        }
      }
      continue
    }

    // primitive
    params.set(key, getValue(val as string | number | boolean))
  }

  const str = params.toString()
  return str.length > 0 ? `?${str}` : ''
}

// URL defaults (optional helper)
let urlDefaults: Record<string, unknown> = {}

export const setUrlDefaults = (params: Record<string, unknown>) => {
  urlDefaults = params
}

export const addUrlDefault = (key: string, value: string | number | boolean) => {
  urlDefaults[key] = value
}

export const applyUrlDefaults = <T extends Record<string, unknown> | undefined>(existing: T): T => {
  const existingParams = { ...(existing ?? ({} as Record<string, unknown>)) }
  for (const key in urlDefaults) {
    if (existingParams[key] === undefined && urlDefaults[key] !== undefined) {
      ;(existingParams as Record<string, unknown>)[key] = urlDefaults[key]
    }
  }
  return existingParams as T
}

// Guard for optional path params ordering
export const validateParameters = (
  args: Record<string, unknown> | undefined,
  optional: string[]
) => {
  const missing = optional.filter(key => !args?.[key])
  const expectedMissing = optional.slice(missing.length * -1)
  for (let i = 0; i < missing.length; i++) {
    if (missing[i] !== expectedMissing[i]) {
      throw Error('Unexpected optional parameters missing. Unable to generate a URL.')
    }
  }
}

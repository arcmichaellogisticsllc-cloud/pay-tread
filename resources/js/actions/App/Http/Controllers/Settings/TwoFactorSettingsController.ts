import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\TwoFactorSettingsController::show
* @see app/Http/Controllers/Settings/TwoFactorSettingsController.php:13
* @route '/two-factor'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/two-factor',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorSettingsController::show
* @see app/Http/Controllers/Settings/TwoFactorSettingsController.php:13
* @route '/two-factor'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorSettingsController::show
* @see app/Http/Controllers/Settings/TwoFactorSettingsController.php:13
* @route '/two-factor'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorSettingsController::show
* @see app/Http/Controllers/Settings/TwoFactorSettingsController.php:13
* @route '/two-factor'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

const TwoFactorSettingsController = { show }

export default TwoFactorSettingsController
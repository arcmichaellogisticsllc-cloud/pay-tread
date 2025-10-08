// append to resources/js/routes/password/index.ts (if you want)
import { type RouteQueryOptions, type RouteDefinition, queryParams } from '../../wayfinder'

export const update = (o?: RouteQueryOptions): RouteDefinition<'put'> => ({
  url: update.url(o),
  method: 'put',
})
update.definition = { methods: ['put'], url: '/user/password' } as const
update.url = (o?: RouteQueryOptions) => update.definition.url + queryParams(o)
export { update }

import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import confirmD7e05f from './confirm'
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmablePasswordController.php:40
* @route '/user/confirm-password'
*/
export const confirm = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: confirm.url(options),
    method: 'get',
})

confirm.definition = {
    methods: ["get","head"],
    url: '/user/confirm-password',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmablePasswordController.php:40
* @route '/user/confirm-password'
*/
confirm.url = (options?: RouteQueryOptions) => {
    return confirm.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmablePasswordController.php:40
* @route '/user/confirm-password'
*/
confirm.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: confirm.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmablePasswordController.php:40
* @route '/user/confirm-password'
*/
confirm.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: confirm.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedPasswordStatusController::confirmation
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedPasswordStatusController.php:17
* @route '/user/confirmed-password-status'
*/
export const confirmation = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: confirmation.url(options),
    method: 'get',
})

confirmation.definition = {
    methods: ["get","head"],
    url: '/user/confirmed-password-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedPasswordStatusController::confirmation
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedPasswordStatusController.php:17
* @route '/user/confirmed-password-status'
*/
confirmation.url = (options?: RouteQueryOptions) => {
    return confirmation.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedPasswordStatusController::confirmation
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedPasswordStatusController.php:17
* @route '/user/confirmed-password-status'
*/
confirmation.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: confirmation.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedPasswordStatusController::confirmation
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedPasswordStatusController.php:17
* @route '/user/confirmed-password-status'
*/
confirmation.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: confirmation.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see app/Http/Controllers/Auth/PasswordResetLinkController.php:17
* @route '/forgot-password'
*/
export const request = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: request.url(options),
    method: 'get',
})

request.definition = {
    methods: ["get","head"],
    url: '/forgot-password',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see app/Http/Controllers/Auth/PasswordResetLinkController.php:17
* @route '/forgot-password'
*/
request.url = (options?: RouteQueryOptions) => {
    return request.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see app/Http/Controllers/Auth/PasswordResetLinkController.php:17
* @route '/forgot-password'
*/
request.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: request.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::request
* @see app/Http/Controllers/Auth/PasswordResetLinkController.php:17
* @route '/forgot-password'
*/
request.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: request.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::email
* @see app/Http/Controllers/Auth/PasswordResetLinkController.php:29
* @route '/forgot-password'
*/
export const email = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: email.url(options),
    method: 'post',
})

email.definition = {
    methods: ["post"],
    url: '/forgot-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::email
* @see app/Http/Controllers/Auth/PasswordResetLinkController.php:29
* @route '/forgot-password'
*/
email.url = (options?: RouteQueryOptions) => {
    return email.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PasswordResetLinkController::email
* @see app/Http/Controllers/Auth/PasswordResetLinkController.php:29
* @route '/forgot-password'
*/
email.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: email.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see app/Http/Controllers/Auth/NewPasswordController.php:22
* @route '/reset-password/{token}'
*/
export const reset = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reset.url(args, options),
    method: 'get',
})

reset.definition = {
    methods: ["get","head"],
    url: '/reset-password/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see app/Http/Controllers/Auth/NewPasswordController.php:22
* @route '/reset-password/{token}'
*/
reset.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return reset.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see app/Http/Controllers/Auth/NewPasswordController.php:22
* @route '/reset-password/{token}'
*/
reset.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reset.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::reset
* @see app/Http/Controllers/Auth/NewPasswordController.php:22
* @route '/reset-password/{token}'
*/
reset.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reset.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::store
* @see app/Http/Controllers/Auth/NewPasswordController.php:35
* @route '/reset-password'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/reset-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::store
* @see app/Http/Controllers/Auth/NewPasswordController.php:35
* @route '/reset-password'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\NewPasswordController::store
* @see app/Http/Controllers/Auth/NewPasswordController.php:35
* @route '/reset-password'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

const password = {
    confirm: Object.assign(confirm, confirmD7e05f),
    confirmation: Object.assign(confirmation, confirmation),
    request: Object.assign(request, request),
    email: Object.assign(email, email),
    reset: Object.assign(reset, reset),
    store: Object.assign(store, store),
}

export default password

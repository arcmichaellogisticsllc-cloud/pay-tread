// resources/js/actions/settings/passwordController.ts

type HttpMethod = 'post' | 'get' | 'put' | 'patch' | 'delete'
export type PasswordFormDef = { action: string; method: HttpMethod }

/** Centralized builders so both API shapes use the same logic */
const make = {
  update(): PasswordFormDef {
    // Adjust endpoint/method if your backend differs
    return { action: '/user/password', method: 'post' }
  },
}

const PasswordController = {
  // Supports: PasswordController.update.form()
  update: {
    form(): PasswordFormDef {
      return make.update()
    },
  },

  // Supports legacy calls: PasswordController.update_form()
  update_form(): PasswordFormDef {
    return make.update()
  },
}

export default PasswordController
export { PasswordController }

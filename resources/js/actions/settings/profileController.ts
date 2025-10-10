// resources/js/actions/settings/profileController.ts

type HttpMethod = 'post' | 'get' | 'put' | 'patch' | 'delete'
export type ProfileFormDef = { action: string; method: HttpMethod }

/** Centralized builders so both API shapes use the same logic */
const make = {
  update(): ProfileFormDef {
    // adjust if your backend path differs
    return { action: '/settings/profile', method: 'post' }
  },
  destroy(): ProfileFormDef {
    // if account deletion uses another path, change it here
    return { action: '/settings/profile', method: 'post' }
  },
}

const ProfileController = {
  // Supports: ProfileController.update.form()
  update: {
    form(): ProfileFormDef {
      return make.update()
    },
  },

  // Supports: ProfileController.destroy.form()
  destroy: {
    form(): ProfileFormDef {
      return make.destroy()
    },
  },

  // Legacy helpers some templates might use:
  update_form(): ProfileFormDef {
    return make.update()
  },
  destroy_form(): ProfileFormDef {
    return make.destroy()
  },
}

export default ProfileController
export { ProfileController }

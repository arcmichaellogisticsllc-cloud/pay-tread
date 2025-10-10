// resources/js/actions/settings/profileController.ts

type HttpMethod = 'post' | 'get' | 'put' | 'patch' | 'delete'
export type ProfileFormDef = { action: string; method: HttpMethod } // <— renamed (safe to export)

const make = {
  update(): ProfileFormDef {
    return { action: '/settings/profile', method: 'post' } // adjust endpoint/method if needed
  },
  destroy(): ProfileFormDef {
    return { action: '/settings/profile', method: 'post' }
  },
}

const ProfileController = {
  // supports: ProfileController.update.form()
  update: {
    form(): ProfileFormDef {
      return make.update()
    },
  },

  // supports: ProfileController.destroy.form()
  destroy: {
    form(): ProfileFormDef {
      return make.destroy()
    },
  },

  // supports legacy calls: ProfileController.update_form(), destroy_form()
  update_form(): ProfileFormDef {
    return make.update()
  },
  destroy_form(): ProfileFormDef {
    return make.destroy()
  },
}

export default ProfileController
export { ProfileController } // ⬅ no re-export of FormDef here

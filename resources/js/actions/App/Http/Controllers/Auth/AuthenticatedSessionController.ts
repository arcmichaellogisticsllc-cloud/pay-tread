// Login
export default {
  store: {
    url: () => '/login',
    form(overrides: Record<string, unknown> = {}) {
      return {
        as: 'form',
        method: 'post',
        action: '/login',
        data: {
          email: '',
          password: '',
          remember: false,
        },
        ...overrides,
      };
    },
  },
  destroy: {
    url: () => '/logout',
    form(overrides: Record<string, unknown> = {}) {
      return {
        as: 'form',
        method: 'post', // Fortify logout is POST by default
        action: '/logout',
        data: {},
        ...overrides,
      };
    },
  },
};

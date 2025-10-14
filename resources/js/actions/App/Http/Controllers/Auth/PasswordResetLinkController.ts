// Forgot password (send reset link)
export default {
  store: {
    url: () => '/forgot-password',
    form(overrides: Record<string, unknown> = {}) {
      return {
        as: 'form',
        method: 'post',
        action: '/forgot-password', // Fortify's "password.email" endpoint
        data: {
          email: '',
        },
        ...overrides,
      };
    },
  },
};

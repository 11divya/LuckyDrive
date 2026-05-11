// Login.helper.js — all logic for the Login screen lives here.

export const TAB_KEYS = {
  login: 'login',
  signup: 'signup',
};

export const buildLoginHandler = ({ login, message, navigate, redirectTo }) =>
  async (values) => {
    try {
      const user = await login(values);
      message.success(`Welcome back, ${user?.name?.split(' ')[0] || 'driver'}.`);
      if (user?.role === 'admin') navigate('/admin', { replace: true });
      else navigate(redirectTo || '/', { replace: true });
    } catch (err) {
      message.error(
        err?.status === 501
          ? 'Login API is not yet wired up — backend returns 501. Wire up POST /api/auth/login to test end-to-end.'
          : err.message || 'Login failed'
      );
      throw err;
    }
  };

export const buildSignupHandler = ({ signup, message, navigate }) =>
  async (values) => {
    try {
      const user = await signup(values);
      message.success(`Welcome, ${user?.name?.split(' ')[0] || 'driver'} — account created.`);
      navigate('/', { replace: true });
    } catch (err) {
      message.error(
        err?.status === 501
          ? 'Signup API is not yet wired up — backend returns 501. Wire up POST /api/auth/signup to test end-to-end.'
          : err.message || 'Signup failed'
      );
      throw err;
    }
  };

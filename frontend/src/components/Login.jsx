import React from 'react';
import { Leaf, LockKeyhole, Mail, Phone, UserRound, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AuthField = ({ icon: Icon, ...inputProps }) => (
  <label className="flex h-12 w-full items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/80 px-4 text-gray-400 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
    {React.createElement(Icon, { size: 17, strokeWidth: 1.8, 'aria-hidden': true })}
    <input
      {...inputProps}
      className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-400"
      required
    />
  </label>
);

const Login = () => {
  const { setShowUserLogin, setUser } = useAppContext();
  const [state, setState] = React.useState('login');
  const [formData, setFormData] = React.useState({
    name: '',
    identifier: '',
    email: '',
    phone: '',
    password: '',
  });

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const url = state === 'login' ? `${API_URL}/api/user/login` : `${API_URL}/api/user/register`;
    try {
      const payload = state === 'login'
        ? { identifier: formData.identifier, password: formData.password }
        : { name: formData.name, email: formData.email, phone: formData.phone, password: formData.password };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success) {
        setUser(data.user);
        setShowUserLogin(false);
        toast.success(state === 'login' ? 'Logged in' : 'Registered');
      } else {
        toast.error(data?.message || 'Authentication failed');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const isLogin = state === 'login';

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-gray-950/60 px-4 py-5 backdrop-blur-sm"
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSubmitHandler}
        aria-label={isLogin ? 'Log in to Greencart' : 'Create a Greencart account'}
        className={`relative my-auto flex w-full flex-col justify-center overflow-hidden rounded-3xl border border-white/10 bg-gray-900 px-6 py-7 text-center shadow-2xl shadow-black/30 sm:aspect-square ${
          isLogin
            ? 'sm:w-[min(100%,520px,calc(100dvh-2rem))]'
            : 'sm:w-[min(100%,640px,calc(100dvh-2rem))]'
        } sm:px-10 sm:py-7`}
      >
        <button
          type="button"
          onClick={() => setShowUserLogin(false)}
          aria-label="Close sign in form"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Leaf size={22} strokeWidth={1.8} />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-2 text-sm leading-5 text-gray-400">
          {isLogin ? 'Sign in to continue shopping' : 'Join Greencart for fresh picks and easy shopping'}
        </p>

        <div className="mt-7 grid grid-cols-1 gap-3">
          {!isLogin && (
            <AuthField
              icon={UserRound}
              type="text"
              name="name"
              placeholder="Full name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
            />
          )}

          {isLogin ? (
            <AuthField
              icon={Mail}
              type="text"
              name="identifier"
              placeholder="Email or phone number"
              autoComplete="username"
              value={formData.identifier}
              onChange={handleChange}
            />
          ) : (
            <>
              <AuthField
                icon={Mail}
                type="email"
                name="email"
                placeholder="Email address"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
              <AuthField
                icon={Phone}
                type="tel"
                name="phone"
                placeholder="Phone number"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </>
          )}

          <AuthField
            icon={LockKeyhole}
            type="password"
            name="password"
            placeholder="Password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {isLogin && (
          <div className="mt-4 text-left">
            <button type="button" className="text-sm font-medium text-primary transition hover:text-orange-300">
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="mt-5 flex h-14 w-full max-w-[360px] shrink-0 cursor-pointer items-center justify-center self-center rounded-xl bg-primary px-6 text-base font-semibold leading-none text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dull focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          {isLogin ? 'Log in' : 'Create account'}
        </button>

        <p className="mt-5 text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => setState((previous) => previous === 'login' ? 'register' : 'login')}
            className="font-semibold text-primary transition hover:text-orange-300"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;

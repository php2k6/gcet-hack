import React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // nice icons
// import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
const Login = () => {
  const [flipped, setFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => console.log(tokenResponse),
  });
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 p-5">
        <div className="perspective relative min-h-[680px] w-[420px]">
          <div
            className={`transform-style-preserve-3d relative min-h-[680px] w-full transition-transform duration-700 ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            <form action="#">
              <div className="absolute mt-20 flex min-h-[600px] w-full flex-col justify-start rounded-2xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-6 text-center">
                  <h1 className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                    Welcome Back
                  </h1>
                  <p className="text-sm text-slate-500">
                    Sign in to your account
                  </p>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="php@gcet.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div className="relative mb-4">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                  <button
                    type="button"
                    className="absolute top-10 right-3 text-slate-400 hover:text-indigo-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="mb-4 flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-indigo-500"
                    />
                    Remember me
                  </label>
                  <a href="#" className="text-indigo-500 hover:underline">
                    Forgot password?
                  </a>
                </div>

                <button className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 font-semibold text-white transition hover:shadow-lg">
                  Sign In
                </button>
                <div className="relative my-4 text-center text-sm text-slate-400">
                  <span className="bg-white-100/0 relative z-10 px-4">
                    or sign up with email
                  </span>
                  <div className="absolute top-1/2 left-0 -z-0 h-px w-full bg-slate-200"></div>
                </div>
                <div className="mb-4 flex gap-3">
                  <button
                    onClick={() => login()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 transition hover:border-indigo-500 hover:shadow-md"
                  >
                    <span>
                      {" "}
                      <svg
                        className="social-icon mt-0 mr-2 inline h-4 w-4 pt-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </span>
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-600">
                    Don’t have an account?{" "}
                    <span
                      className="cursor-pointer font-semibold text-indigo-500 hover:underline"
                      onClick={() => setFlipped(false)}
                    >
                      <a href="/signup">Create one</a>
                    </span>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

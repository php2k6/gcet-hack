import React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // nice icons

const Login = () => {
  const [flipped, setFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 p-5">
        <div className="perspective relative min-h-[680px] w-[420px]">
          <div
            className={`transform-style-preserve-3d relative min-h-[680px] w-full transition-transform duration-700 ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Signup Form */}
            <div className="absolute flex min-h-[680px] w-full flex-col justify-start rounded-2xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl backface-hidden">
              <div className="mb-6 text-center">
                <h1 className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                  Create Account
                </h1>
                <p className="text-sm text-slate-500">
                  Join us and start your journey
                </p>
              </div>

              {/* Social login */}
              <div className="mb-4 flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 transition hover:border-indigo-500 hover:shadow-md">
                  <span>Google</span>
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 transition hover:border-indigo-500 hover:shadow-md">
                  <span>Facebook</span>
                </button>
              </div>

              <div className="relative my-4 text-center text-sm text-slate-400">
                <span className="relative z-10 bg-white px-4">
                  or sign up with email
                </span>
                <div className="absolute top-1/2 left-0 -z-0 h-px w-full bg-slate-200"></div>
              </div>

              {/* Name */}
              <div className="mb-3 flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Password */}
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

              {/* Terms */}
              <div className="mb-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 accent-indigo-500"
                />
                <label htmlFor="terms" className="text-slate-600">
                  I agree to the terms
                </label>
              </div>

              {/* Submit */}
              <button className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 font-semibold text-white transition hover:shadow-lg">
                Create Account
              </button>

              <p className="mt-3 text-center text-xs text-slate-500">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-indigo-500 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-indigo-500 hover:underline">
                  Privacy Policy
                </a>
              </p>

              <div className="mt-4 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <span
                    className="cursor-pointer font-semibold text-indigo-500 hover:underline"
                    onClick={() => setFlipped(true)}
                  >
                    Sign in
                  </span>
                </p>
              </div>
            </div>

            {/* Login Form */}
            <div className="absolute flex min-h-[680px] w-full rotate-y-180 flex-col justify-start rounded-2xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl backface-hidden">
              <div className="mb-6 text-center">
                <h1 className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                  Welcome Back
                </h1>
                <p className="text-sm text-slate-500">
                  Sign in to your account
                </p>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Password */}
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

              <div className="mt-4 text-center">
                <p className="text-sm text-slate-600">
                  Don’t have an account?{" "}
                  <span
                    className="cursor-pointer font-semibold text-indigo-500 hover:underline"
                    onClick={() => setFlipped(false)}
                  >
                    Create one
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

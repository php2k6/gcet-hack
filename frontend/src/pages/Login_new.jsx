import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: 0 // Default to citizen role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Handle Google Sign-In Success
  const handleGoogleLogin = async (credentialResponse) => {
    console.log('🔍 Google Sign-In response received for login');
    setMessage({ type: "", text: "" });

    try {
      const backendResponse = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_token: credentialResponse.credential
        })
      });

      const data = await backendResponse.json();

      if (backendResponse.ok) {
        console.log('✅ Google login successful:', data);
        
        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        setMessage({
          type: "success",
          text: `Welcome back ${data.user.name}! Login successful.`
        });
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
        
      } else {
        console.error('❌ Google login failed:', data);
        setMessage({
          type: "error",
          text: data.detail || "Google login failed."
        });
      }
    } catch (error) {
      console.error('❌ Network error during Google login:', error);
      setMessage({
        type: "error",
        text: `Network error during Google login: ${error.message}`
      });
    }
  };

  // Handle Google Sign-In Error
  const handleGoogleError = () => {
    console.error('Google Sign-In failed');
    setMessage({
      type: "error",
      text: "Google Sign-In failed. Please try again."
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: parseInt(form.role)
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        setMessage({
          type: "success",
          text: `Welcome back ${data.user.name}! Login successful.`
        });
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.detail || "Login failed."
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: `Network error: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 p-5">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
            Welcome Back
          </h1>
          <p className="mt-2 text-slate-600">Sign in to your account</p>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border-l-4 border-green-500"
                : "bg-red-100 text-red-700 border-l-4 border-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Google Login Section */}
        <div className="mb-6">
          <button
            onClick={loginWithGoogle}
            disabled={googleLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors"
          >
            {googleLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Signing in with Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-medium text-gray-700">
              Password:
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block font-medium text-gray-700">
              Role:
            </label>
            <select
              id="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={0}>Citizen</option>
              <option value={1}>Authority</option>
              <option value={2}>Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 font-medium transition-all"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Login Button */}
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={handleGoogleError}
            theme="outline"
            shape="rectangular"
            size="large"
            text="signin_with"
            width="100%"
            use_fedcm_for_prompt={false}
          />
        </div>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Create one here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoogleAuth, useSignup } from "../api/auth";
const Signup = () => {
  const [flipped, setFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const navigate = useNavigate();
  const googleAuth = useGoogleAuth();
  const signupMutation = useSignup();

  // Google Client ID
  const GOOGLE_CLIENT_ID = "233711984336-lmlqdbhcc7uksgusqchb4envpb6224f8.apps.googleusercontent.com";

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      console.log("🔧 Initializing Google Sign-In...");

      if (typeof window.google !== "undefined") {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        console.log("✅ Google Sign-In initialized successfully");
        setGoogleLoaded(true);
      } else {
        console.error("❌ Google Sign-In library not loaded");
      }
    };

    // Check if Google library is already loaded
    if (typeof window.google !== "undefined") {
      initializeGoogleSignIn();
    } else {
      // Wait for Google library to load
      const checkGoogleLoaded = setInterval(() => {
        if (typeof window.google !== "undefined") {
          initializeGoogleSignIn();
          clearInterval(checkGoogleLoaded);
        }
      }, 100);

      // Clear interval after 10 seconds to avoid infinite checking
      setTimeout(() => {
        clearInterval(checkGoogleLoaded);
        if (!googleLoaded) {
          console.error("Google Sign-In library failed to load");
        }
      }, 10000);
    }
  }, [googleLoaded]);

  // Handle Google Sign-In Response
  const handleCredentialResponse = async (response) => {
    console.log("🔍 Google Sign-In response received");
    console.log("ID Token:", response.credential);

    try {
      // Use the googleAuth mutation to send ID token to backend
      const result = await googleAuth.mutateAsync({
        id_token: response.credential,
      });

      console.log("✅ Google login successful:", result);

      // Store tokens and user data
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("user_data", JSON.stringify(result.user));

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("❌ Google authentication failed:", error);
      alert("Google sign-in failed. Please try again.");
    }
  };

  // Manual trigger for Google Sign-In
  const signInWithGoogle = () => {
    console.log("🔍 Manual Google Sign-In triggered");

    if (typeof window.google !== "undefined") {
      window.google.accounts.id.prompt();
      console.log("Google Sign-In dialog should appear...");
    } else {
      console.error("Google Sign-In not loaded");
      alert("Google Sign-In not available. Please try again.");
    }
  };
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    // district: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password) {
        alert("Please fill in all required fields");
        return;
      }

      // Create the signup data
      const signupData = {
        name: formData.name + (formData.lastName ? ` ${formData.lastName}` : ''),
        email: formData.email,
        password: formData.password,
        phone: formData.phone || "", // Default to empty string if not provided
        district: "" // Default to empty string as per backend requirements
      };

      // Call the signup mutation
      const result = await signupMutation.mutateAsync(signupData);
      
      console.log("Signup successful:", result);
      
      // Navigate to home page or dashboard
      navigate("/");
      
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 p-5">
        <div className="perspective relative min-h-[680px] w-[420px]">
          <div
            className={`transform-style-preserve-3d relative min-h-[680px] w-full transition-transform duration-700 ${flipped ? "rotate-y-180" : ""
              }`}
          >
            <form action="#">
              <div className="absolute mt-20 flex min-h-[600px] w-full flex-col justify-start rounded-2xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl backface-hidden">
                <div className="mb-6 text-center">
                  <h1 className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-3xl font-bold text-transparent">
                    Create Account
                  </h1>
                </div>

                <div className="mb-4 flex gap-3">
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={!googleLoaded || googleAuth.isPending}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 transition hover:border-indigo-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!googleLoaded ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                        <span>Loading...</span>
                      </>
                    ) : googleAuth.isPending ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>
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
                    )}
                  </button>
                </div>

                <div className="relative my-4 text-center text-sm text-slate-400">
                  <span className="bg-white-100/0 relative z-10 px-4">
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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      type="text"
                      placeholder="Prabhav"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Last Name
                    </label>
                    <input
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      type="text"
                      placeholder="Patel"
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    type="email"
                    placeholder="php@gcet.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="mb-3">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <input
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    type="tel"
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative mb-4">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <button
                    type="button"
                    className="absolute top-10 right-3 text-slate-400 hover:text-indigo-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <button
                  onClick={handleSignup}
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{" "}
                    <span
                      className="cursor-pointer font-semibold text-indigo-500 hover:underline"
                      onClick={() => setFlipped(true)}
                    >
                      <a href="/login">Sign in</a>
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

export default Signup;

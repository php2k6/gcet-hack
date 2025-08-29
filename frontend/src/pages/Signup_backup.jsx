import React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth, useSignup } from "../api/auth";

const Signup = () => {
  const [flipped, setFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    district: "",
  });

  const navigate = useNavigate();
  const googleAuth = useGoogleAuth();
  const signupMutation = useSignup();

  // Google Login hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log("� Google login successful, exchanging code for token...");
        
        // Exchange the authorization code for an ID token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            code: response.code,
            client_id: "233711984336-lmlqdbhcc7uksgusqchb4envpb6224f8.apps.googleusercontent.com",
            client_secret: "GOCSPX-your-client-secret", // You'll need to add this
            redirect_uri: "postmessage",
            grant_type: "authorization_code",
          }),
        });

        const tokenData = await tokenResponse.json();
        
        if (tokenData.id_token) {
          console.log("📨 Sending ID token to backend...");
          await googleAuth.mutateAsync({
            id_token: tokenData.id_token,
            type: 'signup'
          });
        }
      } catch (error) {
        console.error("❌ Google Sign-In error:", error);
        alert("Google Sign-In failed. Please try again.");
      }
    },
    onError: (error) => {
      console.error("❌ Google login error:", error);
      alert("Google Sign-In failed. Please try again.");
    },
    flow: "auth-code",
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle regular email/password signup
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await signupMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 p-5">
        <div className="perspective relative min-h-[680px] w-[420px]">
          <div
            className={`preserve-3d relative h-full w-full transition-transform duration-1000 ${flipped ? "rotate-y-180" : ""
              }`}
          >
            {/* Front Side - Sign Up */}
            <div className="backface-hidden absolute inset-0 rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
              <div className="mb-8 text-center">
                <h1 className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-3xl font-bold text-transparent">
                  Join the Movement
                </h1>
                <p className="mt-2 text-slate-200">
                  Help build a better community
                </p>
              </div>

              <div className="mb-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={googleAuth.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 transition hover:border-indigo-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleAuth.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
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
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative my-4 text-center text-sm text-slate-400">
                <span className="bg-white-100/0 relative z-10 px-4">
                  or sign up with email
                </span>
                <div className="absolute top-1/2 left-0 -z-0 h-px w-full bg-slate-200"></div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Prabhav"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Email Address
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                    placeholder="prabhav@example.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    District
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  >
                    <option value="">Select District</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Surat">Surat</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Bhavnagar">Bhavnagar</option>
                    <option value="Jamnagar">Jamnagar</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                    <option value="Anand">Anand</option>
                    <option value="Mehsana">Mehsana</option>
                    <option value="Patan">Patan</option>
                    <option value="Banaskantha">Banaskantha</option>
                    <option value="Sabarkantha">Sabarkantha</option>
                    <option value="Aravalli">Aravalli</option>
                    <option value="Kheda">Kheda</option>
                    <option value="Panchmahals">Panchmahals</option>
                    <option value="Dahod">Dahod</option>
                    <option value="Mahisagar">Mahisagar</option>
                    <option value="Bharuch">Bharuch</option>
                    <option value="Narmada">Narmada</option>
                    <option value="Navsari">Navsari</option>
                    <option value="Valsad">Valsad</option>
                    <option value="Dang">Dang</option>
                    <option value="Tapi">Tapi</option>
                    <option value="Kachchh">Kachchh</option>
                    <option value="Morbi">Morbi</option>
                    <option value="Surendranagar">Surendranagar</option>
                    <option value="Botad">Botad</option>
                    <option value="Amreli">Amreli</option>
                    <option value="Junagadh">Junagadh</option>
                    <option value="Porbandar">Porbandar</option>
                    <option value="Devbhoomi Dwarka">Devbhoomi Dwarka</option>
                    <option value="Gir Somnath">Gir Somnath</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 font-semibold text-white transition hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signupMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-300">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="font-semibold text-white hover:text-indigo-200 transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;

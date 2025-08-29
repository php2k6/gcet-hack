import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    district: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Handle Google Sign-In Success
  const handleGoogleSignup = async (credentialResponse) => {
    console.log('🔍 Google Sign-In response received for signup');
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
        console.log('✅ Google signup successful:', data);

        // fetch google profile photo using id token
        const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          headers: {
            'Authorization': `Bearer ${credentialResponse.credential}`
          }
        });

        const userInfo = await userInfoResponse.json();

        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem("user_img", userInfo.picture);

        setMessage({
          type: "success",
          text: `Welcome ${data.user.name}! Google signup successful. You are now logged in.`
        });
        
      } else {
        console.error('❌ Google signup failed:', data);
        setMessage({
          type: "error",
          text: "Google signup failed."
        });
      }
    } catch (error) {
      console.error('❌ Network error during Google signup:', error);
      setMessage({
        type: "error",
        text: `Network error during Google signup: ${error.message}`
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
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: `Account created successfully for ${data.user.name}. Please login now.`
        });
        setForm({ name: "", email: "", password: "", phone: "", district: "" });
      } else {
        setMessage({
          type: "error",
          text: data.detail || "Signup failed."
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
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-20">
      <h2 className="text-2xl font-bold mb-4">📝 Create New Account</h2>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium">
            Name:
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-medium">
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-medium">
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block font-medium">
            Phone:
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="district" className="block font-medium">
            District:
          </label>
          <select
            id="district"
            value={form.district}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-gray-500 text-sm">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Google Sign-Up Button */}
      <div className="mb-6">
        <GoogleLogin
          onSuccess={handleGoogleSignup}
          onError={handleGoogleError}
          theme="outline"
          shape="rectangular"
          size="large"
          text="signup_with"
          width="100%"
          use_fedcm_for_prompt={false}
        />
      </div>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}

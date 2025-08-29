import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useSignup } from "../api/auth";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    district: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [toastMessage, setToastMessage] = useState({ show: false, message: "", type: "success" });
  
  // Use the signup hook
  const signupMutation = useSignup();

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToastMessage({ show: true, message, type });
    setTimeout(() => {
      setToastMessage({ show: false, message: "", type: "success" });
    }, 4000);
  };

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

        // Store tokens and user data (same as Google signup)
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem("user_img", userInfo.picture);

        showToast(`Welcome ${data.user.name}! Google signup successful. Redirecting to home...`, "success");
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
        
      } else {
        console.error('❌ Google signup failed:', data);
        showToast("Google signup failed. Please try again.", "error");
      }
    } catch (error) {
      console.error('❌ Network error during Google signup:', error);
      showToast(`Network error during Google signup: ${error.message}`, "error");
    }
  };

  // Handle Google Sign-In Error
  const handleGoogleError = () => {
    console.error('Google Sign-In failed');
    showToast("Google Sign-In failed. Please try again.", "error");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      // Prepare the form data, ensuring phone is empty string if not provided
      const signupData = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || "", // Send empty string if phone is not provided
        district: form.district
      };

      const result = await signupMutation.mutateAsync(signupData);
      
      // Store user data in localStorage (consistent with Google signup)
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("user_data", JSON.stringify(result.user));
      if (result.refresh_token) {
        localStorage.setItem("refresh_token", result.refresh_token);
      }
      
      showToast(`Welcome ${result.user.name}! Account created successfully. Redirecting to home...`, "success");
      
      // Clear form
      setForm({ name: "", email: "", password: "", phone: "", district: "" });
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      showToast(error.response?.data?.detail || error.message || "Signup failed. Please try again.", "error");
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
          toastMessage.type === "success" 
            ? "bg-green-500 text-white" 
            : "bg-red-500 text-white"
        } p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {toastMessage.type === "success" ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">{toastMessage.message}</span>
            </div>
            <button 
              onClick={() => setToastMessage({ show: false, message: "", type: "success" })}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
            Phone (Optional):
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter your phone number (optional)"
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
          disabled={signupMutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {signupMutation.isPending ? "Creating Account..." : "Create Account"}
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
    </>
  );
}

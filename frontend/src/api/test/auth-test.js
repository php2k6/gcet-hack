// Configuration
const API_BASE_URL = "http://localhost:8000/api";
const GOOGLE_CLIENT_ID =
  "233711984336-lmlqdbhcc7uksgusqchb4envpb6224f8.apps.googleusercontent.com";

// Initialize Google Sign-In when page loads
function initializeGoogleSignIn() {
  console.log("🔧 Initializing Google Sign-In...");

  if (typeof google !== "undefined") {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    console.log("✅ Google Sign-In initialized successfully");
    showSuccess("Google Sign-In library loaded successfully");
  } else {
    console.error("❌ Google Sign-In library not loaded");
    showError("Google Sign-In library failed to load");
  }
}

// Handle Google Sign-In Response (automatic callback)
async function handleCredentialResponse(response) {
  console.log("🔍 Google Sign-In response received");
  console.log("ID Token:", response.credential);

  showSuccess("Google token received, authenticating with backend...");

  try {
    // Send the ID token to backend
    const backendResponse = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_token: response.credential,
      }),
    });

    console.log("Backend response status:", backendResponse.status);

    if (backendResponse.ok) {
      const data = await backendResponse.json();
      console.log("✅ Google login successful:", data);

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_data", JSON.stringify(data.user));

      showSuccess(
        `Welcome ${data.user.name}! Google authentication successful.`,
      );
      onLoginSuccess(data);
    } else {
      const error = await backendResponse.json();
      console.error("❌ Backend error:", error);
      showError("Google sign-in failed: " + error.detail);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
    showError("Network error during Google sign-in: " + error.message);
  }
}

// Manual trigger for Google Sign-In
function signInWithGoogle() {
  console.log("🔍 Manual Google Sign-In triggered");

  if (typeof google !== "undefined") {
    google.accounts.id.prompt();
    showSuccess("Google Sign-In dialog should appear...");
  } else {
    showError("Google Sign-In not loaded");
  }
}

// Handle successful login (both Google and regular)
function onLoginSuccess(data) {
  console.log("✅ Login successful:", data.user);

  // Hide login section, show user section
  document.getElementById("login-section").style.display = "none";
  document.getElementById("user-section").style.display = "block";

  // Populate user information
  document.getElementById("user-name").textContent = data.user.name;
  document.getElementById("user-email").textContent = data.user.email;
  document.getElementById("user-role").textContent = getRoleName(
    data.user.role,
  );
  document.getElementById("user-district").textContent =
    data.user.district || "Not specified";
  document.getElementById("user-google").textContent = data.user.is_google
    ? "Yes"
    : "No";
  document.getElementById("user-id").textContent = data.user.id;

  // Show test section
  document.getElementById("test-section").style.display = "block";
}

// Convert role number to name
function getRoleName(role) {
  switch (role) {
    case 0:
      return "Citizen";
    case 1:
      return "Authority";
    case 2:
      return "Admin";
    default:
      return "Unknown";
  }
}

// Show error messages
function showError(message) {
  console.error("❌", message);

  const errorDiv = document.getElementById("error-message");
  const successDiv = document.getElementById("success-message");

  // Hide success message
  successDiv.style.display = "none";

  // Show error message
  errorDiv.textContent = message;
  errorDiv.style.display = "block";

  // Auto-hide after 10 seconds
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 10000);
}

// Show success messages
function showSuccess(message) {
  console.log("✅", message);

  const errorDiv = document.getElementById("error-message");
  const successDiv = document.getElementById("success-message");

  // Hide error message
  errorDiv.style.display = "none";

  // Show success message
  successDiv.textContent = message;
  successDiv.style.display = "block";

  // Auto-hide after 5 seconds
  setTimeout(() => {
    successDiv.style.display = "none";
  }, 5000);
}

// Check if user is already logged in
function checkAuthStatus() {
  console.log("🔍 Checking authentication status...");

  const token = localStorage.getItem("access_token");
  const userData = localStorage.getItem("user_data");

  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      console.log("✅ Found stored authentication");
      onLoginSuccess({ user: user, access_token: token });
      showSuccess("Welcome back! You are already logged in.");
    } catch (error) {
      console.error("❌ Invalid stored user data");
      logout();
    }
  } else {
    console.log("ℹ️ No stored authentication found");
  }
}

// Logout function
function logout() {
  console.log("🚪 Logging out...");

  // Clear stored data
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_data");

  // Sign out from Google
  if (typeof google !== "undefined") {
    google.accounts.id.disableAutoSelect();
  }

  // Update UI
  document.getElementById("login-section").style.display = "block";
  document.getElementById("user-section").style.display = "none";
  document.getElementById("test-section").style.display = "none";

  // Clear test results
  clearTestResults();

  showSuccess("Logged out successfully");
}

// Make authenticated API requests
async function makeAuthenticatedRequest(url, options = {}) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    showError("Please sign in first");
    return null;
  }

  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, authOptions);

    if (response.status === 401) {
      // Token expired or invalid
      showError("Session expired. Please sign in again.");
      logout();
      return null;
    }

    return response;
  } catch (error) {
    console.error("Request failed:", error);
    showError("Request failed: " + error.message);
    return null;
  }
}

// Form handlers
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Page loaded, initializing...");

  // Initialize Google Sign-In
  initializeGoogleSignIn();

  // Check if already authenticated
  checkAuthStatus();

  // Regular login form
  document
    .getElementById("login-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("🔑 Regular login attempt...");

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const role = parseInt(document.getElementById("role").value);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Regular login successful");

          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          localStorage.setItem("user_data", JSON.stringify(data.user));

          showSuccess(`Welcome ${data.user.name}! Login successful.`);
          onLoginSuccess(data);
        } else {
          const error = await response.json();
          console.error("❌ Login failed:", error);
          showError("Login failed: " + error.detail);
        }
      } catch (error) {
        console.error("❌ Network error:", error);
        showError("Network error during login: " + error.message);
      }
    });

  // Signup form
  document
    .getElementById("signup-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("📝 Signup attempt...");

      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const phone = document.getElementById("signup-phone").value;
      const district = document.getElementById("signup-district").value;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone, district }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Signup successful");
          showSuccess(
            `Account created successfully for ${data.user.name}! Please login now.`,
          );

          // Clear form
          document.getElementById("signup-form").reset();
        } else {
          const error = await response.json();
          console.error("❌ Signup failed:", error);
          showError("Signup failed: " + error.detail);
        }
      } catch (error) {
        console.error("❌ Network error:", error);
        showError("Network error during signup: " + error.message);
      }
    });
});

// Refresh token
async function refreshToken() {
  console.log("🔄 Refreshing token...");

  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) {
    showError("No refresh token found. Please login again.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      showSuccess("Token refreshed successfully!");
    } else {
      const error = await response.json();
      showError("Token refresh failed: " + error.detail);
    }
  } catch (error) {
    showError("Network error during token refresh: " + error.message);
  }
}

// Test API functions
function updateStatus(sectionId, success) {
  const statusEl = document.getElementById(sectionId);
  statusEl.className = `status-indicator ${success ? "status-success" : "status-error"}`;
  statusEl.textContent = success ? "Success" : "Failed";
}

function clearTestResults() {
  const sections = [
    "auth-status",
    "issues-status",
    "user-status",
    "authority-status",
  ];
  sections.forEach((id) => {
    const el = document.getElementById(id);
    el.className = "status-indicator status-pending";
    el.textContent = "Not Tested";
  });

  [
    "auth-response",
    "issues-response",
    "user-response",
    "authority-response",
  ].forEach((id) => {
    document.getElementById(id).textContent = "Response will appear here...";
  });
}

async function testCurrentUser() {
  console.log("🧪 Testing GET /auth/me");

  const response = await makeAuthenticatedRequest(`${API_BASE_URL}/auth/me`);

  if (response && response.ok) {
    const data = await response.json();
    document.getElementById("auth-response").textContent = JSON.stringify(
      data,
      null,
      2,
    );
    updateStatus("auth-status", true);
    showSuccess("Auth test successful!");
  } else {
    const error = response ? await response.text() : "Network error";
    document.getElementById("auth-response").textContent = error;
    updateStatus("auth-status", false);
  }
}

async function testRefreshToken() {
  await refreshToken();
}

async function testGetIssues() {
  console.log("🧪 Testing GET /issues");

  const response = await makeAuthenticatedRequest(`${API_BASE_URL}/issues`);

  if (response && response.ok) {
    const data = await response.json();
    document.getElementById("issues-response").textContent = JSON.stringify(
      data,
      null,
      2,
    );
    updateStatus("issues-status", true);
    showSuccess("Issues test successful!");
  } else {
    const error = response ? await response.text() : "Network error";
    document.getElementById("issues-response").textContent = error;
    updateStatus("issues-status", false);
  }
}

async function testCreateIssue() {
  console.log("🧪 Testing POST /issues");

  // Need to get authorities first
  const authResponse = await makeAuthenticatedRequest(`${API_BASE_URL}/issues`);
  if (!authResponse || !authResponse.ok) {
    showError("Failed to get issues data for authority_id");
    return;
  }

  const issuesData = await authResponse.json();
  let authority_id = null;

  // Try to get an authority_id from existing issues
  if (issuesData.issues && issuesData.issues.length > 0) {
    authority_id = issuesData.issues[0].authority_id;
  }

  if (!authority_id) {
    document.getElementById("issues-response").textContent =
      "No existing issues found to get authority_id. Cannot test issue creation.";
    updateStatus("issues-status", false);
    return;
  }

  const testIssue = {
    title: "Test Issue from Frontend",
    description: "This is a test issue created from the frontend test page",
    location: "Test Location",
    authority_id: authority_id,
    category: "Test Category",
    priority: 2,
  };

  const response = await makeAuthenticatedRequest(`${API_BASE_URL}/issues`, {
    method: "POST",
    body: JSON.stringify(testIssue),
  });

  if (response && response.ok) {
    const data = await response.json();
    document.getElementById("issues-response").textContent = JSON.stringify(
      data,
      null,
      2,
    );
    updateStatus("issues-status", true);
    showSuccess("Issue creation test successful!");
  } else {
    const error = response ? await response.text() : "Network error";
    document.getElementById("issues-response").textContent = error;
    updateStatus("issues-status", false);
  }
}

async function testUserProfile() {
  console.log("🧪 Testing GET /user/me");

  const response = await makeAuthenticatedRequest(`${API_BASE_URL}/user/me`);

  if (response && response.ok) {
    const data = await response.json();
    document.getElementById("user-response").textContent = JSON.stringify(
      data,
      null,
      2,
    );
    updateStatus("user-status", true);
    showSuccess("User profile test successful!");
  } else {
    const error = response ? await response.text() : "Network error";
    document.getElementById("user-response").textContent = error;
    updateStatus("user-status", false);
  }
}

async function testAuthorities() {
  console.log("🧪 Testing Authority endpoints");

  // First try to get current user data to see if they have authority access
  const userResponse = await makeAuthenticatedRequest(
    `${API_BASE_URL}/auth/me`,
  );

  if (userResponse && userResponse.ok) {
    const userData = await userResponse.json();

    // Authority endpoints require specific permissions
    document.getElementById("authority-response").textContent =
      `User Role: ${getRoleName(userData.role)}\n` +
      `Authority endpoints require Admin (role 2) or Authority (role 1) permissions.\n` +
      `Current user has role ${userData.role}.\n\n` +
      `To test authority endpoints, you need:\n` +
      `1. Admin access, or\n` +
      `2. Authority user access with proper authority_id\n\n` +
      `Authority endpoints are protected and require specific permissions.`;

    if (userData.role >= 1) {
      updateStatus("authority-status", true);
      showSuccess("Authority permission check completed!");
    } else {
      updateStatus("authority-status", false);
      showError("Insufficient permissions for authority endpoints");
    }
  } else {
    const error = userResponse ? await userResponse.text() : "Network error";
    document.getElementById("authority-response").textContent = error;
    updateStatus("authority-status", false);
  }
}

async function testAPICall() {
  console.log("🧪 Running all API tests...");
  await testCurrentUser();
  await testGetIssues();
  await testUserProfile();
  await testAuthorities();
}

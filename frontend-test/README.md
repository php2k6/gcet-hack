# 🚀 Frontend Authentication Test

This folder contains sample frontend code to test the Google Authentication and regular login functionality with the GCET Hack backend API.

## 📁 Files

- **`index.html`** - Main test page with authentication forms and API testing
- **`auth.js`** - JavaScript code handling authentication logic
- **`README.md`** - This documentation file

## 🔧 Setup Instructions

### 1. Backend Prerequisites

Make sure your backend is running:

```bash
cd ../backend
uvicorn app.main:app --reload
```

The backend should be accessible at `http://localhost:8000`

### 2. Open the Test Page

1. Open `index.html` in your web browser
2. Or use a local server for better CORS handling:

```bash
# Using Python 3
python -m http.server 8080

# Using Node.js (if you have http-server installed)
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

Then visit: `http://localhost:8080`

### 3. Google Client ID Configuration

The Google Client ID is already configured in the code:
```
233711984336-lmlqdbhcc7uksgusqchb4envpb6224f8.apps.googleusercontent.com
```

This matches the `GOOGLE_CLIENT_ID` in your backend `.env` file.

## 🧪 Testing Features

### Authentication Tests

1. **Google Sign-In**
   - Click the Google sign-in button
   - Test automatic sign-in flow
   - Verify token exchange with backend

2. **Regular Login**
   - Test email/password login
   - Try different roles (Citizen, Authority, Admin)
   - Test invalid credentials

3. **Account Creation**
   - Create new user accounts
   - Test duplicate email handling
   - Verify validation

### API Endpoint Tests

After logging in, you can test various API endpoints:

1. **Auth Endpoints**
   - `GET /auth/me` - Get current user info
   - `POST /auth/refresh-token` - Refresh access token

2. **Issues Endpoints**
   - `GET /issues` - List all issues
   - `POST /issues` - Create new issue

3. **User Endpoints**
   - `GET /user/me` - Get user profile

4. **Authority Endpoints**
   - Permission-based testing
   - Role verification

## 🎯 Test Scenarios

### Google Authentication Test

1. Click "Sign in with Google"
2. Complete Google OAuth flow
3. Verify user creation/login in backend
4. Check token storage and API access

### Regular Authentication Test

1. Use these test credentials:
   - **Admin**: `admin@admin.com` / `admin` (role: 2)
   - **Test User**: Create via signup form

2. Test different roles and permissions

### API Integration Test

1. Login with any method
2. Click "Test API Call" to run all endpoint tests
3. Verify responses and error handling
4. Test token refresh functionality

## 🔍 Debugging

### Console Logs

Open browser DevTools (F12) to see detailed logs:
- Authentication flow
- API requests/responses
- Error messages
- Token management

### Network Tab

Monitor network requests to:
- Verify API calls are made correctly
- Check request headers (Authorization)
- Inspect response data

### Common Issues

1. **CORS Errors**: Make sure backend has proper CORS configuration
2. **Google Sign-In Not Loading**: Check internet connection and Google client ID
3. **401 Unauthorized**: Token expired or invalid - try refreshing
4. **Backend Connection**: Ensure backend is running on localhost:8000

## 📊 Status Indicators

The test page includes status indicators for each API section:
- 🟠 **Pending** - Not tested yet
- 🟢 **Success** - Test passed
- 🔴 **Failed** - Test failed

## 🛡️ Security Notes

- Tokens are stored in localStorage for testing
- In production, consider more secure storage methods
- Google Client ID is public and safe to expose
- Backend handles all security validation

## 🚀 Next Steps

After successful testing:
1. Integrate authentication into your main frontend
2. Implement proper error handling
3. Add loading states and user feedback
4. Consider token refresh automation
5. Implement logout confirmation

## 📝 Test Checklist

- [ ] Google Sign-In works
- [ ] Regular login works
- [ ] Account creation works
- [ ] Token refresh works
- [ ] API calls authenticated correctly
- [ ] Error handling displays properly
- [ ] Logout clears all data
- [ ] Role-based access respected

Happy testing! 🎉

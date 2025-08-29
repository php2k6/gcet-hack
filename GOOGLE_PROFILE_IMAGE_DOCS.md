# Google Profile Image Integration

This implementation fetches and displays Google profile images using the ID token instead of the access token, maintaining your existing authentication flow.

## How It Works

### 1. **ID Token Storage**
- During Google authentication, the ID token is stored in localStorage as `google_id_token`
- The ID token contains user profile information including the profile picture URL

### 2. **JWT Decoding**
- Created utility functions to decode the JWT ID token client-side
- Extracts the `picture` field from the token payload
- No external API calls needed - all data is in the token

### 3. **Profile Image Caching**
- Profile images are cached in localStorage as `profile_photo`
- Reduces repeated token decoding and improves performance
- Cached image is used across page refreshes

### 4. **Smart Fallback Logic**
```javascript
// Order of preference:
1. Cached profile photo (localStorage)
2. Google picture from ID token (for Google users)
3. Default avatar (fallback)
```

## Files Modified

### 1. **googleUtils.js** (New)
- `decodeJWT()` - Decodes JWT tokens client-side
- `getGoogleProfilePicture()` - Extracts picture from ID token
- `getUserProfileImage()` - Main function with fallback logic
- `fetchGoogleProfileImage()` - Caches Google profile image

### 2. **auth.js** (Updated)
- Stores Google ID token during authentication
- Fetches and caches profile image automatically
- Clears tokens and images on logout

### 3. **Profile.jsx** (Updated)
- Uses new profile image utility
- Reactive updates when image changes
- Error handling for broken images
- Added `object-cover` for better image display

### 4. **user.js** (Updated)
- Added `useRefreshGoogleProfileImage()` hook
- Event-based profile image updates

## Key Features

### ✅ **No External API Calls**
- Uses ID token data directly (no 401 errors)
- Works offline once token is cached
- Faster loading times

### ✅ **Automatic Caching**
- Profile images cached in localStorage
- Persistent across sessions
- Reduces token processing

### ✅ **Error Handling**
- Graceful fallback to default avatar
- Image load error handling
- Token decode error handling

### ✅ **Real-time Updates**
- Profile image updates when user data changes
- Event-driven image refresh
- Reactive state management

### ✅ **Security**
- No exposure of access tokens
- Client-side token decoding only
- Proper cleanup on logout

## Debugging

The implementation includes console logging to help debug:

```javascript
// Check browser console for:
- "Decoded Google ID token: {...}"
- "Extracted Google profile picture: URL"
- "Getting user profile image for: [username]"
- "Using stored profile photo: URL"
- "Caching Google profile picture: URL"
```

## Usage Example

```javascript
// The profile image is automatically handled
const { data: user } = useGetMe();
const googleIdToken = localStorage.getItem("google_id_token");
const profileImage = getUserProfileImage(user, googleIdToken);

// In JSX:
<img src={profileImage} alt="Profile" />
```

## Token Structure

The Google ID token contains:
```json
{
  "sub": "user-id",
  "email": "user@gmail.com", 
  "name": "User Name",
  "picture": "https://lh3.googleusercontent.com/...",
  "given_name": "User",
  "family_name": "Name"
}
```

## Benefits

1. **No 401 Errors** - Uses ID token instead of access token
2. **Better Performance** - Cached images, no repeated API calls
3. **Offline Support** - Works with cached data
4. **Automatic Updates** - Profile image updates with user data
5. **Clean Integration** - No changes to auth flow
6. **Error Resilient** - Multiple fallback options

This implementation solves the 401 error issue while providing a robust, cached, and user-friendly profile image system.

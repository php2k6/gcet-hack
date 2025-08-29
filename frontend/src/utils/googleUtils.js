// src/utils/googleUtils.js

/**
 * Decode JWT token without verification (client-side only, for display purposes)
 * @param {string} token - JWT token to decode
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token) {
      console.log('No token provided to decodeJWT');
      return null;
    }
    
    console.log('Decoding JWT token, length:', token.length);
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid JWT format, parts:', parts.length);
      return null;
    }
    
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = JSON.parse(atob(paddedPayload));
    console.log('Successfully decoded JWT payload');
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Extract Google profile picture from ID token
 * @param {string} idToken - Google ID token
 * @returns {string|null} - Profile picture URL or null
 */
export const getGoogleProfilePicture = (idToken) => {
  const decoded = decodeJWT(idToken);
  console.log('Decoded Google ID token:', decoded);
  const pictureUrl = decoded?.picture || null;
  console.log('Extracted Google profile picture:', pictureUrl);
  return pictureUrl;
};

/**
 * Get user profile image with fallback logic
 * @param {object} user - User object from API
 * @param {string} googleIdToken - Google ID token (if available)
 * @returns {string} - Profile image URL or default
 */
export const getUserProfileImage = (user, googleIdToken = null) => {
  console.log('Getting user profile image for:', user?.name, 'isGoogle:', user?.is_google);
  console.log('Google ID token provided:', !!googleIdToken);
  console.log('Google ID token length:', googleIdToken?.length);
  
  // Don't check stored photo first - always try to get from Google token for testing
  // const storedPhoto = localStorage.getItem("profile_photo");
  // if (storedPhoto) {
  //   console.log('Using stored profile photo:', storedPhoto);
  //   return storedPhoto;
  // }
  
  // If user is Google user and we have ID token, extract from token
  if (user?.is_google && googleIdToken) {
    console.log('User is Google user, extracting picture from ID token');
    const googlePicture = getGoogleProfilePicture(googleIdToken);
    if (googlePicture) {
      // Cache the profile photo
      console.log('Caching Google profile picture:', googlePicture);
      localStorage.setItem("profile_photo", googlePicture);
      return googlePicture;
    } else {
      console.log('No picture found in Google ID token');
    }
  } else {
    console.log('Conditions not met - isGoogle:', user?.is_google, 'hasToken:', !!googleIdToken);
  }
  
  console.log('Using default avatar');
  // Fallback to default avatar
  return "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/helene-engels.png";
};

/**
 * Fetch and cache Google profile image
 * @param {string} googleIdToken - Google ID token
 * @returns {Promise<string>} - Profile image URL
 */
export const fetchGoogleProfileImage = async (googleIdToken) => {
  try {
    const profilePicture = getGoogleProfilePicture(googleIdToken);
    if (profilePicture) {
      localStorage.setItem("profile_photo", profilePicture);
      return profilePicture;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Google profile image:', error);
    return null;
  }
};

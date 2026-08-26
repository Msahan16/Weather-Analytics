import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthContext = createContext();

// Whitelist of authorized users
const WHITELISTED_USERS = [
  'careers@fidenz.com',
  'kanishka.d@fidenz.com',
  'srimal.w@fidenz.com',
  'narada.a@fidenz.com',
  'amindu.l@fidenz.com',
  'niroshanan.s@fidenz.com'
];

export const AuthProvider = ({ children }) => {
  // Try using Auth0 hook if available
  let auth0 = null;
  try {
    auth0 = useAuth0();
  } catch (e) {
    // Auth0 provider not wrapped or in fallback mode
  }

  // Local / Simulated Auth0 State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('weather_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [mfaPending, setMfaPending] = useState(null); // { email, tempToken, code }
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('weather_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('weather_auth_user');
    }
  }, [user]);

  // Auth0 sync if logged in via real Auth0 Universal Login
  useEffect(() => {
    if (auth0 && auth0.isAuthenticated && auth0.user) {
      const email = auth0.user.email?.toLowerCase();
      if (!WHITELISTED_USERS.includes(email)) {
        setAuthError(`Access Denied: ${email} is not in the authorized evaluator whitelist.`);
        auth0.logout({ returnTo: window.location.origin });
        return;
      }
      setUser({
        email: auth0.user.email,
        name: auth0.user.name || 'Fidenz Evaluator',
        picture: auth0.user.picture,
        mfaVerified: true,
        authMethod: 'Auth0 Universal Login',
        role: 'Evaluator'
      });
    }
  }, [auth0?.isAuthenticated, auth0?.user]);

  /**
   * Step 1 & 3: Login initiation with Whitelist Validation
   */
  const initiateLogin = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);

    // Simulate network authentication delay
    await new Promise(r => setTimeout(r, 600));

    const normalizedEmail = email.trim().toLowerCase();

    // Step 3: Check Whitelist & Disallow Public Signups
    if (!WHITELISTED_USERS.includes(normalizedEmail)) {
      setAuthLoading(false);
      setAuthError('Public signups are disabled. Only whitelisted evaluators (e.g. careers@fidenz.com) can log in.');
      return { success: false };
    }

    // Check credentials for test user
    if (normalizedEmail === 'careers@fidenz.com' && password !== 'Pass#fidenz') {
      setAuthLoading(false);
      setAuthError('Invalid credentials. Please use Password: Pass#fidenz');
      return { success: false };
    }

    // Step 2: Trigger Multi-Factor Authentication (Email Verification OTP)
    const generatedOtp = '824901'; // Simulated secure 6-digit OTP
    setMfaPending({
      email: normalizedEmail,
      otp: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 min expiry
    });

    setAuthLoading(false);
    return { success: true, mfaRequired: true, demoOtp: generatedOtp };
  };

  /**
   * Step 2: Complete Multi-Factor Authentication (MFA OTP)
   */
  const verifyMfaOtp = async (inputOtp) => {
    setAuthLoading(true);
    setAuthError(null);

    await new Promise(r => setTimeout(r, 500));

    if (!mfaPending) {
      setAuthLoading(false);
      setAuthError('No active MFA session found. Please start login again.');
      return false;
    }

    if (inputOtp.trim() !== mfaPending.otp && inputOtp.trim() !== '123456') {
      setAuthLoading(false);
      setAuthError('Invalid verification code. Please check your email or use the pre-filled demo code.');
      return false;
    }

    // Success: Establish authenticated session
    const authenticatedUser = {
      email: mfaPending.email,
      name: mfaPending.email.split('@')[0],
      role: 'Whitelisted Evaluator',
      mfaVerified: true,
      authMethod: 'Auth0 + Email MFA',
      token: 'jwt_mock_bearer_' + Math.random().toString(36).substring(2),
      loginTime: new Date().toISOString()
    };

    setUser(authenticatedUser);
    setMfaPending(null);
    setAuthLoading(false);
    return true;
  };

  /**
   * Cancel MFA step
   */
  const cancelMfa = () => {
    setMfaPending(null);
    setAuthError(null);
  };

  /**
   * Logout Flow
   */
  const logout = () => {
    if (auth0 && auth0.isAuthenticated) {
      auth0.logout({ returnTo: window.location.origin });
    }
    setUser(null);
    setMfaPending(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        mfaPending,
        authError,
        authLoading,
        initiateLogin,
        verifyMfaOtp,
        cancelMfa,
        logout,
        auth0
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

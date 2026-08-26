const { auth } = require('express-oauth2-jwt-bearer');
const config = require('../config');

// Initialize Auth0 JWT check middleware if configured
let jwtCheck = null;

if (config.auth0IssuerBaseUrl && config.auth0Audience) {
  try {
    jwtCheck = auth({
      audience: config.auth0Audience,
      issuerBaseURL: config.auth0IssuerBaseUrl,
      tokenSigningAlg: 'RS256'
    });
  } catch (err) {
    console.warn('[Auth0] JWT middleware initialization warning:', err.message);
  }
}

/**
 * Flexible authentication middleware:
 * - If AUTH_REQUIRED is true: Enforces valid Auth0 JWT.
 * - If AUTH_REQUIRED is false (Dev Mode / Demo Evaluation): Validates JWT if provided,
 *   otherwise permits guest/demo access with informative header.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (config.authRequired) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is required to access weather analytics.',
        hint: 'Please log in via Auth0 or set AUTH_REQUIRED=false in backend/.env for local evaluation.'
      });
    }

    if (jwtCheck) {
      return jwtCheck(req, res, next);
    }
  }

  // Development / Demo Mode: if a token exists and jwtCheck is ready, optionally verify
  if (authHeader && jwtCheck && config.auth0IssuerBaseUrl.includes('.auth0.com')) {
    return jwtCheck(req, res, (err) => {
      if (err) {
        // Log notice but continue in dev mode
        console.warn('[Auth0] Dev mode token check warning:', err.message);
      }
      next();
    });
  }

  // Pass through for development/evaluation
  req.auth = req.auth || {
    sub: 'demo-user|fidenz-evaluator',
    email: 'careers@fidenz.com',
    role: 'Evaluator'
  };
  res.setHeader('X-Auth-Mode', config.authRequired ? 'Enforced' : 'Dev-Permissive');
  next();
};

module.exports = {
  requireAuth
};

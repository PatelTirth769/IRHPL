const admin = require('../config/firebase');
const ApiError = require('../utils/ApiError');

const auth = () => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Please authenticate');
    }

    const token = authHeader.split(' ')[1];
    
    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user payload
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Error Details:', error);
    next(new ApiError(401, 'Please authenticate'));
  }
};

module.exports = auth;

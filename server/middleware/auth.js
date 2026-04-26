const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * auth — verifies JWT AND checks the user is still active in the DB.
 * Inactive accounts are blocked with 403 on every protected request.
 */
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Real-time isActive check — catches deactivation without waiting for JWT expiry
    const user = await User.findById(decoded.userId).select('isActive role');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.isActive === false) {
      return res.status(403).json({
        message: 'Account is inactive. Please contact your administrator.',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    req.user = { ...decoded, role: user.role }; // always use DB role (not stale JWT role)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { auth, authorize };

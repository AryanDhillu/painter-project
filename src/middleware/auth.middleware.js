const jwt = require('jsonwebtoken');

// This is our main authentication middleware
function authMiddleware(req, res, next) {
  // 1. Get token from the Authorization header
  const authHeader = req.header('Authorization');

  // 2. Check if token exists
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // The header format is "Bearer <token>". We just want the token part.
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token format is incorrect' });
  }

  try {
    // 3. Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. If valid, add the decoded user info to the request object
    req.user = decoded;

    // 5. Call next() to pass control to the next function (the controller)
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}



// New middleware to check for 'Owner' role
function isOwner(req, res, next) {
  // must run *after* authMiddleware
  if (req.user && req.user.role === 'Owner') {
    next(); // User is an Owner, proceed
  } else {
    // User is not an Owner, send Forbidden error
    res.status(403).json({ message: 'Access denied. requires Owner role.' });
  }
}

module.exports = {authMiddleware, isOwner};
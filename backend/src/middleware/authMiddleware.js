const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  // Get token from request header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'No token, access denied' })
  }

  try {
    // Verify token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // attach user info to request
    next() // move on to the actual route
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = authMiddleware
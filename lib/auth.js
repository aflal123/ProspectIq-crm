import jwt from 'jsonwebtoken';

export function getAuthUser(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    return decoded;
  } catch (err) {
    return null;
  }
}

import jwt from 'jsonwebtoken';

// Checks the "Authorization: Bearer <token>" header and puts { id, role } on req.user.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please sign in to continue' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired, please sign in again' });
  }
}

// Use after requireAuth.
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
}

export function signToken(user) {
  return jwt.sign({ sub: String(user.id), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = getDB();

    const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({ token, username: admin.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.adminId = decoded.id;
    next();
  });
};

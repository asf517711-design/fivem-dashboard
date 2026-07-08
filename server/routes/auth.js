const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// بيانات مؤقتة (استخدم قاعدة بيانات في الإنتاج)
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ error: 'خطأ في اسم المستخدم أو كلمة المرور' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'خطأ في اسم المستخدم أو كلمة المرور' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

// Verify Token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Profile
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;
const authService = require('../services/authService');
const jwtUtil = require('../config/jwt');

async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    const user = await authService.register({ email, password, name });
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await authService.authenticate({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwtUtil.sign({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { register, login };

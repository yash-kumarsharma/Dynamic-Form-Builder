require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { connectRedis } = require('./config/redisClient');
const { attach: attachWs } = require('./utils/ws');

const authRoutes = require('./routes/auth');
const formsRoutes = require('./routes/forms');

const PORT = process.env.PORT || 4000;
const WS_PORT = parseInt(process.env.WS_PORT || '4001', 10);

async function start() {
  
  await connectRedis();
  console.log('Connected to Redis');

  const app = express();
  app.use(cors());
  app.use(express.json());

  
  app.use('/api/auth', authRoutes);
  app.use('/api/forms', formsRoutes);

  
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views/index.html'));
  });

  const server = app.listen(PORT, () => {
    console.log(`Normal server running on port: ${PORT}`);
  });

  
  const WebSocket = require('ws');
  const wss = new WebSocket.Server({ port: WS_PORT });
  attachWs(wss);
  console.log(`WebSocket server running on port: ${WS_PORT}`);
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});

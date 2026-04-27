require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const authRoutes      = require('./routes/auth');
const messageRoutes   = require('./routes/messages');
const logRoutes       = require('./routes/logs');
const contactRoutes   = require('./routes/contacts');
const whatsappRoutes  = require('./routes/whatsapp');
const { startScheduler } = require('./jobs/scheduler');
const { migrate } = require('./config/migrate');
const { initialize } = require('./services/whatsappService');

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth',      authRoutes);
app.use('/api/messages',  messageRoutes);
app.use('/api/logs',      logRoutes);
app.use('/api/contacts',  contactRoutes);
app.use('/api/whatsapp',  whatsappRoutes);
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }));
app.use((req, res) => res.status(404).json({ error: `${req.method} ${req.path} not found` }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`\n🚀 SmartMsg API → http://localhost:${PORT}`);
  await migrate();
  startScheduler();
  initialize();
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const { connectDB } = require('./config/database');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const carsRoutes = require('./routes/cars.routes');
const ticketsRoutes = require('./routes/tickets.routes');
const drawsRoutes = require('./routes/draws.routes');
const adminRoutes = require('./routes/admin.routes');
const settingsRoutes = require('./routes/settings.routes');
const paymentsRoutes = require('./routes/payments.routes');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(compression());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) =>
  res.json({
    success: true,
    data: { service: 'luckydrive-backend', status: 'ok', uptime: process.uptime() },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/draws', drawsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`[server] LuckyDrive API listening on http://localhost:${PORT}`);
    console.log(`[server] CORS origin: ${CLIENT_URL}`);
    console.log(`[server] Payments provider: ${process.env.PAYMENTS_PROVIDER || 'mock'}`);
  });
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  });
}

module.exports = app;

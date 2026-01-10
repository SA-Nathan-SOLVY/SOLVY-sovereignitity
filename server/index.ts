import express from 'express';
import cors from 'cors';
import stripeRoutes from './routes/stripe.js';
import unitRoutes from './routes/unit.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve JWKS
app.use('/.well-known', express.static('dist-server'));

// API Routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/unit', unitRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import stripeRoutes from './routes/stripe';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/stripe', stripeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import tourneeRoutes from './routes/tournees';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser les JSON
app.use(express.json());
app.use('/api/tournees', tourneeRoutes);

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Route par défaut pour vérifier si le serveur tourne
app.get('/', (req, res) => {
  res.send('API is running');
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

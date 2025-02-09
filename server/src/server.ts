import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import tourneeRoutes from './routes/tournees';
import fs from 'fs';
import path from 'path';

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

// Nouvelle route pour charger les livreurs depuis bdd_livreurs.json
app.get('/api/livreurs', async (req: Request, res: Response): Promise<void> => {
  try {
    const livreursPath = path.join(__dirname, 'bdd_livreurs.json');
    console.log(`Chemin du fichier : ${livreursPath}`);

    if (!fs.existsSync(livreursPath)) {
      console.error('Fichier livreurs non trouvé');
      res.status(404).json({ message: 'Aucun livreur trouvé' });
      return;
    }

    const data = fs.readFileSync(livreursPath, 'utf-8');
    console.log(`Contenu brut du fichier : ${data}`);

    const livreurs = JSON.parse(data);
    console.log(`Données parsées : ${JSON.stringify(livreurs)}`);

    res.json(livreurs);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier livreurs:', (error as Error).message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route par défaut pour vérifier si le serveur tourne
app.get('/', (req: Request, res: Response): void => {
  res.send('API is running');
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

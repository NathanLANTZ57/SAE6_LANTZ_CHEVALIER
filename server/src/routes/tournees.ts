import express from 'express';
import { Tournee } from '../models/Tournee';

const router = express.Router();

// Route pour obtenir toutes les tournées
router.get('/', async (req, res) => {
  try {
    const tournees = await Tournee.find();
    res.json(tournees);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tournées' });
  }
});

// Route pour valider la livraison d'un dépôt
router.put('/valider/:tourneeId/:depotId', async (req, res) => {
  try {
    const { tourneeId, depotId } = req.params;
    const tournee = await Tournee.findById(tourneeId);
    if (tournee) {
      const depot = tournee.dépôts.id(depotId);
      if (depot) {
        depot.livraison_validée = true;
        await tournee.save();
        res.json({ message: 'Livraison validée' });
      } else {
        res.status(404).json({ error: 'Dépôt non trouvé' });
      }
    } else {
      res.status(404).json({ error: 'Tournée non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la validation de la livraison' });
  }
});

export default router;

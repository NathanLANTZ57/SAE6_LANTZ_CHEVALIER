import mongoose from 'mongoose';

const PanierSchema = new mongoose.Schema({
  type: { type: String, required: true },
  quantité: { type: Number, required: true }
});

const DepotSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  adresse: { type: String, required: true },
  itinéraire: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  paniers: [PanierSchema],
  livraison_validée: { type: Boolean, default: false }
});

const TourneeSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  livreur: { type: String, required: true },
  dépôts: [DepotSchema]
});

export const Tournee = mongoose.model('Tournee', TourneeSchema);

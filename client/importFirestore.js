const admin = require("firebase-admin");
const fs = require("fs");

// Charger la clé d'authentification Firebase
const serviceAccount = require("./serviceAccountKey.json");

// Initialiser Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Charger les données JSON
const data = JSON.parse(fs.readFileSync("tournées.json", "utf8"));

// Fonction pour importer les données dans Firestore
async function importData() {
  const batch = db.batch();
  const collectionRef = db.collection("tournées"); // Nom de la collection

  data.forEach((tournee) => {
    const docRef = collectionRef.doc(); // Créer un document unique
    batch.set(docRef, tournee);
  });

  await batch.commit();
  console.log("✅ Importation des données terminée !");
}

// Exécuter l'importation
importData().catch(console.error);

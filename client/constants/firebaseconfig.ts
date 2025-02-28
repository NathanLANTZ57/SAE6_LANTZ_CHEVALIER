// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importer Firestore
import { getAnalytics } from "firebase/analytics";

// Votre configuration Firebase
const firebaseConfig = {
   apiKey: "TON_API_KEY",
  authDomain: "TON_PROJET.firebaseapp.com",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_BUCKET.appspot.com",
  messagingSenderId: "TON_MESSAGING_ID",
  appId: "TON_APP_ID",
  measurementId: "TON_MEASUREMENT_ID"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firestore
const db = getFirestore(app); // Utilisez Firestore pour la base de données

// (Optionnel) Initialiser Analytics si vous en avez besoin
const analytics = getAnalytics(app);

export { db }; // Exporter `db` pour l'utiliser dans votre application
export const MAPBOX_API_KEY = "pk.eyJ1IjoibnRoaCIsImEiOiJjbTc5NHI0czgwMW4wMmpxeTB3aXVndHk5In0.1qbbZnc-1MVtoUN1pwFIVw";
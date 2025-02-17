// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importer Firestore
import { getAnalytics } from "firebase/analytics";

// Votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBViHOlwEhTo4IezuQEGFqKfkqk9KrIVV8",
  authDomain: "sae6-7b080.firebaseapp.com",
  projectId: "sae6-7b080",
  storageBucket: "sae6-7b080.firebasestorage.app",
  messagingSenderId: "83160049604",
  appId: "1:83160049604:web:631427ec93c67c5a98e691",
  measurementId: "G-9NCXPPQBS0"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firestore
const db = getFirestore(app); // Utilisez Firestore pour la base de données

// (Optionnel) Initialiser Analytics si vous en avez besoin
const analytics = getAnalytics(app);

export { db }; // Exporter `db` pour l'utiliser dans votre application
export const MAPBOX_API_KEY = "pk.eyJ1IjoibnRoaCIsImEiOiJjbTc5NHI0czgwMW4wMmpxeTB3aXVndHk5In0.1qbbZnc-1MVtoUN1pwFIVw";
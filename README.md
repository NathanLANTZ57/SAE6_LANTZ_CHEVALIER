# 🚀 Installation & Mise en route

### 🛠️ **Prérequis**
Assure-toi d’avoir installé les outils suivants :
- **Node.js** (v18+) : [Télécharger ici](https://nodejs.org/)
- **Expo CLI** : `npm install -g expo-cli`
- **Firebase Project** : Crée un projet sur [Firebase Console](https://console.firebase.google.com/) et configure Firestore.

---

### 📥 **1. Cloner le projet**
```sh
git clone https://github.com/NathanLANTZ57/SAE6_LANTZ_CHEVALIER.git
cd SAE6_LANTZ_CHEVALIER
```

### 📦 **2. Installer les dépendances**
```sh
npm install
```

---

### 🏗️ **3. Configuration du projet**

#### 🔥 **Configurer Firebase**
1. Crée un projet Firebase et active **Firestore**.
2. Récupère les clés de configuration et crée le fichier suivant :

```sh
touch constants/firebaseconfig.ts
```

3. Ajoute les clés Firebase dans ce fichier :

```ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_PROJET.firebaseapp.com",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_BUCKET.appspot.com",
  messagingSenderId: "TON_MESSAGING_ID",
  appId: "TON_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

### 📸 **4. Scanner un QR Code avec Expo**
Installe l'application **Expo Go** sur ton téléphone 📱.

```sh
npx expo start
```

Puis, scanne le QR code avec Expo Go pour voir ton app en action ! 🚀

---

### 📦 **Dépendances principales**
📌 Installe toutes les librairies utilisées avec :

```sh
npx expo install react-native-maps react-native-reanimated react-native-gesture-handler react-native-screens expo-router expo-font expo-notifications
npx expo install firebase @react-native-async-storage/async-storage
npm install @expo/vector-icons @mapbox/polyline
```

---

### 🎯 **Commandes utiles**
| Commande | Description |
|----------|------------|
| `npx expo start` | Démarrer l'application Expo |
| `npx expo run:android` | Exécuter sur un simulateur Android |
| `npx expo run:ios` | Exécuter sur un simulateur iOS (Mac uniquement) |

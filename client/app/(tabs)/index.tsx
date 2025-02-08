import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router"; // Importer le routeur

const HomeScreen = () => {
  const router = useRouter(); // Initialiser le routeur

  // Charger la police Montserrat Alternates
  const [fontsLoaded] = useFonts({
    MontserratAlternates: require("../../assets/fonts/MontserratAlternates-Regular.ttf"),
  });

  const [fontsLoaded2] = useFonts({
    Comme: require("../../assets/fonts/Comme-ExtraLight.ttf"),
  });


  // Vérification du chargement des polices
  if (!fontsLoaded) {
    return <Text>Chargement des polices...</Text>;
  }
  if (!fontsLoaded2) {
    return <Text>Chargement des polices...</Text>;
  }


  // Obtenir la date actuelle au format "Mardi 28 janvier 2025" avec jour en majuscule
  const getFormattedDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("fr-FR", options);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };

  const currentDate = getFormattedDate();

  // Données de la liste
  const data = [
    { id: "1", city: "Épinal", depots: 3, distance: 103 },
    { id: "2", city: "Dinozé", depots: 3, distance: 70 },
    { id: "3", city: "Golbey", depots: 3, distance: 26 },
    { id: "4", city: "Ville 4", depots: 3, distance: 32 },
    { id: "5", city: "Ville 5", depots: 3, distance: 15 },
    { id: "6", city: "Ville 6", depots: 3, distance: 60 },
  ];

  // Fonction pour gérer la sélection d'une carte
  const handleSelect = (city: string) => {
    router.push(`/details?city=${city}`); // Naviguer vers la page de détails
  };

  // Fonction pour afficher chaque carte
  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleSelect(item.city)}>
      <View style={[styles.card]}>
        <Text style={styles.cityName}>{item.city}</Text>
        <Text style={styles.cardText}>Dépôts : {item.depots}</Text>
        <Text style={styles.cardText}>Kilométrage : {item.distance}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Date */}
      <Text style={styles.date}>{currentDate}</Text>

      {/* Liste des villes */}
      <FlatList
        data={data}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2} // Grille avec 2 colonnes
        columnWrapperStyle={styles.row} // Style entre colonnes
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f6f6f6", // Couleur de fond claire
  },
  date: {
    textAlign: "left", // Alignement à gauche
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "MontserratAlternates", // Application explicite de la police
    color: "#333", // Couleur légèrement foncée
    marginBottom: 36,
    marginLeft: 12,
    marginTop: 12,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16, // Espacement entre les lignes
  },
  card: {
    flex: 1,
    backgroundColor: "#fff", // Fond blanc pour la carte
    borderWidth: 1,
    borderColor: "#e0e0e0", // Bordure légèrement grise
    borderRadius: 8, // Coins arrondis
    padding: 18,
    marginHorizontal: 16, // Espacement horizontal
    marginVertical: 6, // Espacement vertical
    alignItems: "flex-start", // Aligner le texte à gauche
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Ombre sur Android
    marginTop: 20,
    
  },
  cityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7ba352", // Vert pour le nom des villes
    marginBottom: 8,
    fontFamily:'Comme',
  },
  cardText: {
    fontSize: 14,
    color: "#333", // Texte sombre
    fontFamily:'Comme',
  },
});

export default HomeScreen;

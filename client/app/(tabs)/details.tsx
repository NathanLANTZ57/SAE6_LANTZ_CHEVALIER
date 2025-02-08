import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { router, useRouter } from "expo-router";

const DetailsScreen = () => {
  const data = [
    {
      id: "1",
      title: "Panier Simple Hebdomadaire",
      details: [
        "Nombre : 10 paniers à Église Saint Antoine",
        "Nombre : 10 paniers à Ligue de l'enseignement",
        "Nombre : 10 paniers à Centre Léo LaGrange",
      ],
    },
    {
      id: "2",
      title: "Panier Simple Hebdomadaire",
      details: [
        "Nombre : 10 paniers à Église Saint Antoine",
        "Nombre : 10 paniers à Ligue de l'enseignement",
        "Nombre : 10 paniers à Centre Léo LaGrange",
      ],
    },
    {
      id: "3",
      title: "Panier Simple Hebdomadaire",
      details: [
        "Nombre : 10 paniers à Église Saint Antoine",
        "Nombre : 10 paniers à Ligue de l'enseignement",
        "Nombre : 10 paniers à Centre Léo LaGrange",
      ],
    },
    {
      id: "4",
      title: "Panier Simple Hebdomadaire",
      details: [
        "Nombre : 10 paniers à Église Saint Antoine",
        "Nombre : 10 paniers à Ligue de l'enseignement",
        "Nombre : 10 paniers à Centre Léo LaGrange",
      ],
    },
  ];
  



  const router = useRouter();

  const renderCard = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.card, index === 0 && styles.firstCard]}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      {item.details.map((detail: string, idx: number) => (
        <Text key={idx} style={styles.cardDetail}>
          {detail}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Bouton Retour */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      {/* Titre en haut */}
      <Text style={styles.header}>Tournée : Épinal</Text>

      {/* Liste des cartes */}
      <FlatList
        data={data}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        style={styles.flatList} // Limiter l'espace de scroll
      />

      {/* Bouton en bas, fixe */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/map")} // Naviguer vers la carte
      >
        <Text style={styles.buttonText}>C’est compris !</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
    zIndex: 10, // S'assurer que le bouton est au-dessus des autres éléments
  },
  backButtonText: {
    fontSize: 14,
    color: "#7ba352",
    fontFamily:'Comme',
  },
  header: {
    textAlign: "left",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "MontserratAlternates",
    color: "#333",
    marginBottom: 16,
    marginLeft: 16,
    marginTop: 80, // Décaler pour laisser de l'espace au bouton retour
  },
  flatList: {
    flex: 1, // Permet à la liste de s'adapter à l'espace disponible
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  firstCard: {
    marginTop: 30, // Ajout d'une marge en haut uniquement pour la première carte
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7ba352",
    marginBottom: 8,
    fontFamily:'Comme',
  },
  cardDetail: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    fontFamily:'Comme',
  },
  button: {
    backgroundColor: "#7ba352",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16, // Centrer avec un espacement latéral
    marginBottom: 55, // Espacement en bas
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily:'Comme',
  },
});

export default DetailsScreen;

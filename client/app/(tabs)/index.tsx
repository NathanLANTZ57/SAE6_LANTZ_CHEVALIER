import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../constants/firebaseconfig";

const HomeScreen = () => {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les polices personnalisées
  const [fontsLoaded] = useFonts({
    MontserratAlternates: require("../../assets/fonts/MontserratAlternates-Regular.ttf"),
    Comme: require("../../assets/fonts/Comme-ExtraLight.ttf"),
  });

  // Vérifier si les polices sont chargées
  if (!fontsLoaded) {
    return <Text>Chargement des polices...</Text>;
  }

  // Récupérer les données depuis Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "livreurs"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Obtenir la date actuelle formatée
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7ba352" />
        <Text>Chargement des données...</Text>
      </View>
    );
  }

  // Gestion de la sélection d'une carte
  const handleSelect = (city: string) => {
    router.push(`/details?city=${city}`);
  };

  // Rendu des cartes
  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleSelect(item.city)}>
      <View style={styles.card}>
        <Text style={styles.cityName}>{item.city}</Text>
        <Text style={styles.cardText}>Dépôts : {item.depots}</Text>
        <Text style={styles.cardText}>Kilométrage : {item.distance}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Affichage de la date */}
      <Text style={styles.date}>{currentDate}</Text>

      {/* Liste des villes */}
      <FlatList
        data={data}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f6f6f6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  date: {
    textAlign: "left",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "MontserratAlternates",
    color: "#333",
    marginBottom: 36,
    marginLeft: 12,
    marginTop: 12,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 20,
  },
  cityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7ba352",
    marginBottom: 8,
    fontFamily: "Comme",
  },
  cardText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Comme",
  },
});

export default HomeScreen;

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

  if (!fontsLoaded) {
    return <Text>Chargement des polices...</Text>;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tournées"));
        const fetchedData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            jour: data.jour,
            city: data.city,
            depots: data.depots,
            distance: data.distance,
          };
        });

        // Obtenir le jour actuel
        const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        const today = jours[new Date().getDay()];

        // Filtrer les tournées du jour
        const todaysTours = fetchedData.filter((tournee) => tournee.jour === today);

        setData(todaysTours);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7ba352" />
        <Text>Chargement des tournées...</Text>
      </View>
    );
  }

  const handleSelect = (city: string) => {
    router.push(`/details?city=${city}`);
  };

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleSelect(item.city)}>
      <View style={styles.card}>
        <Text style={styles.cityName}>{item.city}</Text>
        <Text style={styles.cardText}>Dépôts : {item.depots}</Text>
        <Text style={styles.cardText}>Distance : {item.distance}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Tournées du jour :</Text>
      <FlatList
        data={data}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

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
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#7ba352",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    textAlign: "center",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 18,
    marginVertical: 6,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
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

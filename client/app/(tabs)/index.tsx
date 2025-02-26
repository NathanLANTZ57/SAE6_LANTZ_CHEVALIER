import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../constants/firebaseconfig";

const HomeScreen = () => {
  const router = useRouter();
  const [toursNonLivrees, setToursNonLivrees] = useState<any[]>([]);
  const [toursLivrees, setToursLivrees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les polices personnalisées
  const [fontsLoaded] = useFonts({
    MontserratAlternates: require("../../assets/fonts/MontserratAlternates-Regular.ttf"),
    Comme: require("../../assets/fonts/Comme-ExtraLight.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Chargement des polices...</Text>;
  }

  const fetchData = async () => {
    setIsLoading(true);
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
          statut: data.statut, // Ajout du statut
        };
      });

      // Obtenir le jour actuel
      const jours = [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
      ];
      const today = jours[new Date().getDay()];

      // Filtrer les tournées du jour
      const todaysTours = fetchedData.filter(
        (tournee) => tournee.jour === today
      );

      // Séparer les tournées livrées et non livrées
      const nonLivrees = todaysTours.filter(
        (tournee) => tournee.statut === "nonlivre"
      );
      const livrees = todaysTours.filter(
        (tournee) => tournee.statut === "livre"
      );

      setToursNonLivrees(nonLivrees);
      setToursLivrees(livrees);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelect = (tournee: any) => {
    if (tournee.statut === "livre") {
      Alert.alert("Tournée déjà livrée", "Cette tournée est déjà livrée.");
    } else {
      router.push(`/details?city=${tournee.city}`);
    }
  };

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      disabled={item.statut === "livre"}
    >
      <View
        style={[
          styles.card,
          item.statut === "livre" ? styles.cardLivree : styles.cardNonLivree,
        ]}
      >
        <Text style={styles.cityName}>{item.city}</Text>
        <Text style={styles.cardText}>Dépôts : {item.depots}</Text>
        <Text style={styles.cardText}>Distance : {item.distance}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7ba352" />
        <Text>Chargement des tournées...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Tournées du jour :</Text>

      {toursNonLivrees.length > 0 && (
        <>
          <Text style={styles.subHeader}>Tournées Non Livrées :</Text>
          <FlatList
            data={toursNonLivrees}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
          />
        </>
      )}

      {toursLivrees.length > 0 && (
        <>
          <Text style={styles.subHeader}>Tournées Livrées :</Text>
          <FlatList
            data={toursLivrees}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
          />
        </>
      )}

      {toursNonLivrees.length === 0 && toursLivrees.length === 0 && (
        <Text style={styles.noToursText}>
          Aucune tournée prévue pour aujourd'hui.
        </Text>
      )}

      {/* Bouton d'actualisation */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
        <Text style={styles.refreshButtonText}>Actualiser</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>
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
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7ba352",
    marginBottom: 8,
    textAlign: "left",
    paddingHorizontal: 16,
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
  cardNonLivree: {
    borderColor: "#ff9800", // Orange pour les tournées non livrées
  },
  cardLivree: {
    borderColor: "#4caf50", // Vert pour les tournées livrées
    backgroundColor: "#e8f5e9", // Vert clair pour indiquer qu'elles sont livrées
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
  noToursText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  refreshButton: {
    backgroundColor: "#7ba352",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "50%",
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  button: {
    backgroundColor: "#7ba352",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    width: "50%",
    alignSelf: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default HomeScreen;

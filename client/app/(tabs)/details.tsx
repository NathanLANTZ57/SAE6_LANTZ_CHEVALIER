import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../constants/firebaseconfig";

const DetailsScreen = () => {
  const router = useRouter();
  const { city } = useLocalSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "tournées"), where("city", "==", city));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setData(querySnapshot.docs[0].data().livraisons);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [city]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Tournée : {city}</Text>

      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.adresse}</Text>
            <Text style={styles.cardDetail}>Nombre : {item.nombre} paniers</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <TouchableOpacity style={styles.button} onPress={() => router.push(`/map?city=${city}`)}>
        <Text style={styles.buttonText}>Voir sur la carte</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#7ba352",
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDetail: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    backgroundColor: "#7ba352",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default DetailsScreen;

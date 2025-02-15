import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Animated, FlatList } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../constants/firebaseconfig";
import * as ImagePicker from "expo-image-picker";

const MapScreen = () => {
  const router = useRouter();
  const { city } = useLocalSearchParams();
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useState(new Animated.Value(90))[0];

  const [initialRegion, setInitialRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "tournées"), where("city", "==", city));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const fetchedData = querySnapshot.docs[0].data().livraisons;
          const coordinates = fetchedData.map((livraison: any) => livraison.coordonnees);
          setRouteCoordinates(coordinates);

          if (coordinates.length > 0) {
            setInitialRegion({
              latitude: coordinates[0].latitude,
              longitude: coordinates[0].longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchData();
  }, [city]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion || undefined}
      >
        {routeCoordinates.map((coord, index) => (
          <Marker key={index} coordinate={coord} />
        ))}
        <Polyline coordinates={routeCoordinates} strokeColor="#7ba352" strokeWidth={4} />
      </MapView>

      {/* Bouton Retour */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      {/* Bouton Scan */}
      <TouchableOpacity style={styles.scanCircle} onPress={() => console.log("Scan")}>
        <Image source={require("../../assets/images/scan_noir.png")} style={styles.scanImage} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  backButton: { position: "absolute", top: 20, left: 16, backgroundColor: "#fff", padding: 12, borderRadius: 8 },
  backButtonText: { fontSize: 16, color: "#7ba352", fontWeight: "bold" },
  scanCircle: { position: "absolute", bottom: 20, right: 20, width: 60, height: 60, backgroundColor: "#fff", borderRadius: 30, justifyContent: "center", alignItems: "center" },
  scanImage: { width: 30, height: 30, resizeMode: "contain" },
});

export default MapScreen;

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, FlatList } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, MAPBOX_API_KEY } from "../../constants/firebaseconfig";
import polyline from "@mapbox/polyline";
import * as ImagePicker from "expo-image-picker";

const MapScreen = () => {
  const router = useRouter();
  const { city } = useLocalSearchParams();
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [tourneeCoordinates, setTourneeCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [initialRegion, setInitialRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const q = query(collection(db, "tournées"), where("city", "==", city));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const fetchedData = querySnapshot.docs[0].data().livraisons;
          const coordinates = fetchedData.map((livraison: any) => livraison.coordonnees);
          setTourneeCoordinates(coordinates); // Enregistre les vrais points de la tournée

          if (coordinates.length > 1) {
            const start = `${coordinates[0].longitude},${coordinates[0].latitude}`;
            const end = `${coordinates[coordinates.length - 1].longitude},${coordinates[coordinates.length - 1].latitude}`;
            const waypoints = coordinates
              .slice(1, -1)
              .map((coord: { latitude: number; longitude: number }) => `${coord.longitude},${coord.latitude}`)
              .join(";");

            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${waypoints};${end}?geometries=polyline&steps=true&access_token=${MAPBOX_API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.routes.length > 0) {
              const route = data.routes[0];
              const decodedCoordinates = polyline.decode(route.geometry).map(([lat, lng]) => ({
                latitude: lat,
                longitude: lng,
              }));

              setRouteCoordinates(decodedCoordinates);
              setInstructions(route.legs.flatMap((leg: any) => leg.steps.map((step: any) => step.maneuver.instruction)));
            }
          }

          setInitialRegion({
            latitude: coordinates[0].latitude,
            longitude: coordinates[0].longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [city]);

  // Fonction pour ouvrir la caméra et scanner un QR-Code
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Vous devez autoriser l'accès à la caméra pour scanner un QR-Code.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      alert(`QR Code scanné : ${result.assets[0].uri}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7ba352" />
        <Text>Chargement de l'itinéraire...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion || undefined}>
        {/* Affichage du trajet avec l'itinéraire optimisé */}
        {routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeColor="#7ba352" strokeWidth={4} />}
        
        {/* Marqueurs avec numéros */}
        {tourneeCoordinates.map((coord, index) => (
          <Marker key={index} coordinate={coord}>
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Bouton de retour */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      {/* Instructions de navigation */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsHeader}>Instructions de navigation :</Text>
        <FlatList
          data={instructions}
          renderItem={({ item }) => <Text style={styles.instructionText}>{item}</Text>}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      {/* Bouton Scan QR-Code avec ouverture de la caméra */}
      <TouchableOpacity style={styles.scanCircle} onPress={openCamera}>
        <Image source={require("../../assets/images/scan_noir.png")} style={styles.scanImage} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  map: { flex: 1 },
  backButton: { position: "absolute", top: 20, left: 16, backgroundColor: "#fff", padding: 12, borderRadius: 8 },
  backButtonText: { fontSize: 16, color: "#7ba352", fontWeight: "bold" },
  instructionsContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    maxHeight: 150,
  },
  instructionsHeader: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  instructionText: { fontSize: 14, color: "#333", marginBottom: 3 },
  scanCircle: { 
    position: "absolute", 
    bottom: 20, 
    right: 20, 
    width: 60, 
    height: 60, 
    backgroundColor: "#fff", 
    borderRadius: 30, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  scanImage: { width: 30, height: 30, resizeMode: "contain" },
  markerContainer: { 
    backgroundColor: "red", 
    padding: 5, 
    borderRadius: 20, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  markerText: { color: "white", fontWeight: "bold", fontSize: 14 },
});

export default MapScreen;

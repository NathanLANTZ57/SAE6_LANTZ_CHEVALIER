import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, FlatList, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db, MAPBOX_API_KEY } from "../../constants/firebaseconfig";
import polyline from "@mapbox/polyline";
import { CameraView, Camera } from "expo-camera";

const MapScreen = () => {
  const router = useRouter();
  const { city } = useLocalSearchParams();
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [tourneeCoordinates, setTourneeCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [tourneeData, setTourneeData] = useState<any[]>([]);
  const [tourneeId, setTourneeId] = useState<string | null>(null); // Stocke l'ID de la tournée Firestore
  const [initialRegion, setInitialRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const q = query(collection(db, "tournées"), where("city", "==", city));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0]; // Prend la première tournée correspondante
          setTourneeId(docSnapshot.id); // Stocke l'ID Firestore du document
          const fetchedData = docSnapshot.data().livraisons;
          setTourneeData(fetchedData);
          const coordinates = fetchedData.map((livraison: any) => livraison.coordonnees);
          setTourneeCoordinates(coordinates);

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

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    if (tourneeCoordinates.length > 0) {
      const newCoordinates = [...tourneeCoordinates];
      newCoordinates.shift();
      setTourneeCoordinates(newCoordinates);

      if (newCoordinates.length > 0) {
        const newInstructions = tourneeData.slice(1).map((livraison: any, index: number) => `Arrêt ${index + 1}: ${livraison.adresse}`);
        setInstructions(newInstructions);
      } else {
        // Met à jour le statut Firestore
        if (tourneeId) {
          const tourneeRef = doc(db, "tournées", tourneeId);
          await updateDoc(tourneeRef, { statut: "livre" });
        }

        Alert.alert("Tournée terminée", "Vous avez scanné tous les points.", [{ text: "OK", onPress: () => setScanning(false) }]);
      }
    }

    setTimeout(() => {
      setScanning(false);
      setScanned(false);
    }, 1000);
  };

  if (scanning) {
    return (
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      >
        <TouchableOpacity style={styles.closeButton} onPress={() => setScanning(false)}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </CameraView>
    );
  }

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
        {routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeColor="#7ba352" strokeWidth={4} />}
        {tourneeCoordinates.map((coord, index) => (
          <Marker key={index} coordinate={coord}>
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsHeader}>Instructions de navigation :</Text>
        <FlatList
          data={instructions}
          renderItem={({ item }) => <Text style={styles.instructionText}>{item}</Text>}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      <TouchableOpacity style={styles.scanCircle} onPress={() => setScanning(true)}>
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
  scanCircle: { position: "absolute", bottom: 20, right: 20, width: 60, height: 60, backgroundColor: "#fff", borderRadius: 30, justifyContent: "center", alignItems: "center" },
  scanImage: { width: 30, height: 30, resizeMode: "contain" },
  camera: { flex: 1 },
  closeButton: { position: "absolute", top: 40, left: 20, backgroundColor: "white", padding: 10, borderRadius: 8 },
  closeButtonText: { fontSize: 16, fontWeight: "bold" },
  markerContainer: { backgroundColor: "#fff", padding: 5, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  markerText: { fontSize: 16, fontWeight: "bold" },
  instructionsContainer: { position: "absolute", bottom: 100, left: 0, right: 0, backgroundColor: "white", padding: 10, borderRadius: 8, maxHeight: "30%" },
  instructionsHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  instructionText: { fontSize: 14, marginBottom: 3 },
});

export default MapScreen;

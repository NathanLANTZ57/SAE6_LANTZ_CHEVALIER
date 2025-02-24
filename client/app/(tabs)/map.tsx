import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, FlatList, Alert, Modal, ScrollView } from "react-native";
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
  const [tourneeData, setTourneeData] = useState<any[]>([]);
  const [tourneeId, setTourneeId] = useState<string | null>(null);
  const [initialRegion, setInitialRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [paniersScannes, setPaniersScannes] = useState<{ [key: string]: number }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [instructions, setInstructions] = useState<string[]>([]);


  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      let coordinates: { latitude: number; longitude: number }[] = [];
      try {
        const q = query(collection(db, "tournées"), where("city", "==", city));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0];
          setTourneeId(docSnapshot.id);
          const fetchedData = docSnapshot.data().livraisons;
          setTourneeData(fetchedData);

          coordinates = fetchedData.map((livraison: any) => livraison.coordonnees);
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
      } finally {
        setLoading(false);
      }
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

    };

    fetchRoute();
  }, [city]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const livraisonActuelle = tourneeData[0];
    if (!livraisonActuelle || !livraisonActuelle.adresse) {
      Alert.alert("Erreur", "Aucune livraison en cours.");
      setScanned(false);
      return;
    }

    setPaniersScannes((prev) => {
      const currentScanned = prev[livraisonActuelle.adresse] || 0;
      return { ...prev, [livraisonActuelle.adresse]: currentScanned + 1 };
    });

    if ((paniersScannes[livraisonActuelle.adresse] || 0) + 1 >= livraisonActuelle.nombre) {
      Alert.alert("Livraison terminée", `Tous les paniers pour ${livraisonActuelle.adresse} ont été livrés.`);

      const newTourneeData = [...tourneeData];
      newTourneeData.shift();
      setTourneeData(newTourneeData);

      if (newTourneeData.length === 0 && tourneeId) {
        const tourneeRef = doc(db, "tournées", tourneeId);
        await updateDoc(tourneeRef, { statut: "livre" });

        Alert.alert("Tournée terminée", "Toutes les livraisons ont été effectuées.");
      }
    }

    setTimeout(() => {
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
        {tourneeData.map((livraison, index) => (
          <Marker key={index} coordinate={livraison.coordonnees}>
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
        <Text style={styles.instructionsHeader}>Livraisons :</Text>
        <FlatList
          data={tourneeData}
          renderItem={({ item }) => (
            <View style={styles.instructionItem}>
              <Text style={styles.instructionText}>{item.adresse}</Text>
              <Text style={styles.scannedText}>
                {paniersScannes[item.adresse] || 0} / {item.nombre} scannés
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={() => setScanning(true)}>
        <Text style={styles.scanButtonText}>Scanner un panier</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.instructionsButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.instructionsButtonText}>Voir les instructions</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.instructionsHeader}>Instructions de navigation</Text>
            <ScrollView>
              {instructions.map((instruction: string, index: number) => (
                <Text key={index} style={styles.instructionText}>{instruction}</Text>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  map: { flex: 1 },
  backButton: { position: "absolute", top: 20, left: 16, backgroundColor: "#fff", padding: 12, borderRadius: 8 },
  backButtonText: { fontSize: 16, color: "#7ba352", fontWeight: "bold" },
  scanButton: { backgroundColor: "#7ba352", padding: 12, borderRadius: 8, marginTop: 20, alignItems: "center" },
  scanButtonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  camera: { flex: 1 },
  closeButton: { position: "absolute", top: 40, left: 20, backgroundColor: "white", padding: 10, borderRadius: 8 },
  closeButtonText: { fontSize: 16, fontWeight: "bold" },
  markerContainer: { backgroundColor: "#fff", padding: 5, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  markerText: { fontSize: 16, fontWeight: "bold" },
  instructionsContainer: { padding: 10, backgroundColor: "white", borderRadius: 8, margin: 10 },
  instructionItem: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  scannedText: { fontSize: 14, color: "#7ba352", fontWeight: "bold" },
  instructionsHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  instructionText: { fontSize: 14, marginBottom: 3 },
  instructionsButton: { backgroundColor: "#7ba352", padding: 12, borderRadius: 8, marginTop: 20, alignItems: "center" },
  instructionsButtonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%", maxHeight: "80%" },
  closeModalButton: { backgroundColor: "#7ba352", padding: 12, borderRadius: 8, marginTop: 20, alignItems: "center" },
  closeModalText: { fontSize: 16, fontWeight: "bold", color: "#fff" },

});

export default MapScreen;

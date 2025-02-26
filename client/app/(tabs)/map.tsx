import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, MAPBOX_API_KEY } from "../../constants/firebaseconfig";
import polyline from "@mapbox/polyline";
import { CameraView, Camera } from "expo-camera";

const MapScreen = () => {
  const router = useRouter();
  const { city } = useLocalSearchParams();
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [tourneeData, setTourneeData] = useState<any[]>([]);
  const [tourneeId, setTourneeId] = useState<string | null>(null);
  const [initialRegion, setInitialRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [paniersScannes, setPaniersScannes] = useState<{ [key: string]: number }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [instructions, setInstructions] = useState<string[]>([]);

  const [currentDepotIndex, setCurrentDepotIndex] = useState(0); // Track the current depot
  const [depotScanned, setDepotScanned] = useState(false);
  const [isScanningDepot, setIsScanningDepot] = useState(true);
  const [scanTimeout, setScanTimeout] = useState(false);

  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (scanned || scanTimeout) return;
    setScanned(true);
    setScanTimeout(true);
  
    scanTimeoutRef.current = setTimeout(() => setScanTimeout(false), 2000);
  
    if (isScanningDepot) {
      Alert.alert(
        `Dépôt ${currentDepotIndex + 1} scanné`,
        "Prêt à scanner les paniers",
        [{ text: "OK", onPress: () => setScanning(false) }]
      );
      setIsScanningDepot(false);
    } else {
      setPaniersScannes(prev => {
        const livraisonActuelle = tourneeData[0];
        if (!livraisonActuelle) return prev;
  
        const newCount = (prev[livraisonActuelle.adresse] || 0) + 1;
        const newState = { ...prev, [livraisonActuelle.adresse]: newCount };
  
        // Vérification IMMÉDIATE avec la nouvelle valeur
        if (newCount === livraisonActuelle.nombre) {
          Alert.alert(
            "Dépôt complet",
            `${livraisonActuelle.nombre} paniers scannés !`,
            [{
              text: "OK",
              onPress: () => {
                const newTourneeData = tourneeData.slice(1);
                setTourneeData(newTourneeData);
                setScanning(false);
                
                if (newTourneeData.length === 0) {
                  Alert.alert("Tournée terminée", "Retour au dépôt principal");
                  setCurrentDepotIndex(0);
                } else {
                  setIsScanningDepot(true);
                  setCurrentDepotIndex(prev => prev + 1);
                }
              }
            }]
          );
        }
  
        return newState;
      });
    }
  
    setTimeout(() => setScanned(false), 1000);
  };

  const toggleScanning = () => {
    setScanning(true);
  };

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  if (scanning) {
    return (
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        {/* Ajoutez ce overlay personnalisé */}
        <View style={styles.overlay}>
          <View style={styles.border}>
            <View style={styles.topLeftCorner} />
            <View style={styles.topRightCorner} />
            <View style={styles.bottomLeftCorner} />
            <View style={styles.bottomRightCorner} />
          </View>
        </View>
  
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
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="#7ba352" strokeWidth={4} />
        )}
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

      <TouchableOpacity style={styles.scanButton} onPress={toggleScanning} disabled={scanTimeout}>
        <Text style={styles.scanButtonText}>
          {isScanningDepot
            ? `Scanner le dépôt ${currentDepotIndex + 1}`
            : "Scanner un panier"}
        </Text>
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
                <Text key={index} style={styles.instructionText}>
                  {instruction}
                </Text>
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
  backButton: {
    position: "absolute",
    top: 20,
    left: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: { fontSize: 16, color: "#7ba352", fontWeight: "bold" },
  scanButton: {
    backgroundColor: "#7ba352",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  scanButtonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  camera: { flex: 1 },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: { fontSize: 16, fontWeight: "bold" },
  markerContainer: {
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: { fontSize: 16, fontWeight: "bold" },
  instructionsContainer: { padding: 10, backgroundColor: "white", borderRadius: 8, margin: 10 },
  instructionItem: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  scannedText: { fontSize: 14, color: "#7ba352", fontWeight: "bold" },
  instructionsHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  instructionText: { fontSize: 14, marginBottom: 3 },
  instructionsButton: {
    backgroundColor: "#7ba352",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  instructionsButtonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  closeModalButton: {
    backgroundColor: "#7ba352",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  closeModalText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(123, 163, 82, 0.5)',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  topLeftCorner: {
    position: 'absolute',
    left: -2,
    top: -2,
    width: 30,
    height: 30,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: '#7ba352',
  },
  topRightCorner: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 30,
    height: 30,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: '#7ba352',
  },
  bottomLeftCorner: {
    position: 'absolute',
    left: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#7ba352',
  },
  bottomRightCorner: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#7ba352',
  },
});

export default MapScreen;

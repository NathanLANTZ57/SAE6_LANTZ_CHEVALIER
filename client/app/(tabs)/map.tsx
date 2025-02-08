import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Animated, FlatList } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker"; // ✅ On importe expo-image-picker

const MapScreen = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false); // État du volet
  const animation = useState(new Animated.Value(90))[0]; // Hauteur initiale = 90 (fermé)

  const routeCoordinates = [
    { latitude: 48.285, longitude: 6.95 },
    { latitude: 48.29, longitude: 6.97 },
    { latitude: 48.31, longitude: 6.99 },
  ];

  const instructions = [
    "Tournez à droite dans 500m",
    "Au rond-point, prenez la deuxième sortie",
    "Continuez tout droit pendant 1km",
    "Tournez à gauche après le feu",
    "Vous êtes arrivé à destination",
  ];

  // ✅ Ouvrir l'appareil photo natif du téléphone
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "Vous devez autoriser l'accès à l'appareil photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      Alert.alert("Photo capturée", `Photo enregistrée à : ${result.assets[0].uri}`);
      console.log(result.assets[0].uri);
    }
  };

  // ✅ Fonction pour ouvrir/fermer le volet
  const toggleInstructions = () => {
    setIsExpanded(!isExpanded); // Basculer l'état
    Animated.timing(animation, {
      toValue: isExpanded ? 90 : 550, // 90px (fermé) ou 250px (ouvert)
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Volet déroulant des instructions (EN HAUT) */}
      <Animated.View style={[styles.instructionBox, { height: animation }]}>
        {/* Liste des instructions */}
        {isExpanded && (
          <FlatList
            data={instructions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Text
                style={[
                  styles.listItem,
                  index % 2 === 0 ? styles.evenItem : styles.oddItem, // Fond gris une ligne sur deux
                  index === 0 && styles.firstListItem, // Appliquer un style spécifique au premier élément
                ]}
              >
                {item}
              </Text>
            )}
          />
        )}

        <TouchableOpacity onPress={toggleInstructions}>
          <Text style={styles.instructionText}>
            {isExpanded ? "Fermer les instructions" : instructions[0]}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Carte */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 48.285,
          longitude: 6.95,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {routeCoordinates.map((coord, index) => (
          <Marker key={index} coordinate={coord} />
        ))}
        <Polyline coordinates={routeCoordinates} strokeColor="#7ba352" strokeWidth={4} />
      </MapView>

      {/* Bouton Retour */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/details")}>
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      {/* Bouton Scan (Ouvrir appareil photo natif) */}
      <TouchableOpacity style={styles.scanCircle} onPress={openCamera}>
        <Image source={require("../../assets/images/scan_noir.png")} style={styles.scanImage} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  instructionBox: {
    position: "absolute",
    top: 0, // Place le volet en haut
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden", // Cache le contenu débordant
    zIndex: 10, // S'assure que le volet est au-dessus de la carte
  },
  instructionText: {
    fontSize: 22,
    textAlign: "center",
    paddingVertical: 8,
    marginTop: 35,
    fontFamily:'Comme',
  },
  listItem: {
    fontSize: 22,
    paddingVertical: 10,
    marginBottom: 25,
    fontFamily:'Comme',
  },
  evenItem: {
    backgroundColor: "#f5f5f5", // Fond gris clair pour les éléments pairs
  },
  oddItem: {
    backgroundColor: "#fff", // Fond blanc pour les éléments impairs
  },
  firstListItem: {
    marginTop: 60, // Style spécifique pour le premier élément
  },
  backButton: {
    position: "absolute",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#7ba352",
    fontWeight: "bold",
    fontFamily:'Comme',
  },
  scanCircle: {
    position: "absolute",
    bottom: 20, // Position en bas
    right: 20, // Position à droite
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 30, // Cercle parfait
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scanImage: {
    width: 30, // Taille de l'image
    height: 30,
    resizeMode: "contain",
  },
});

export default MapScreen;

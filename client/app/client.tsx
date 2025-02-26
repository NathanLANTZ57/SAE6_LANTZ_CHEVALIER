import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../constants/firebaseconfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ClientScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const savedNotifications = await AsyncStorage.getItem("notifications");
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    };
    loadNotifications();
  }, []);

  useEffect(() => {
    const tournéesRef = collection(db, "tournées");
    const q = query(tournéesRef, where("statut", "==", "livre"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newNotifications = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          city: data.city || "Inconnue",
          jour: data.jour || "Jour inconnu",
          dateLivraison: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toLocaleDateString() : "Date inconnue", // 🔥 Récupère la vraie date
          heureLivraison: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toLocaleTimeString() : "Heure inconnue",
        };
      });

      if (newNotifications.length > 0) {
        setNotifications((prev) => {
          const updatedNotifications = [
            ...newNotifications.filter(
              (newItem) => !prev.some((prevItem) => prevItem.id === newItem.id)
            ),
            ...prev,
          ];
          AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const removeNotification = async (id: string) => {
    const updatedNotifications = notifications.filter((notif) => notif.id !== id);
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Espace Client</Text>
      <Text style={styles.text}>Bienvenue dans l'espace client.</Text>

      {notifications.length === 0 ? (
        <Text style={styles.noNotifText}>Aucune notification pour l'instant.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>
                  🚚 Tournée : <Text style={styles.bold}>{item.city}</Text>
                </Text>
                <Text style={styles.notificationText}>
                  📅 Jour : <Text style={styles.bold}>{item.jour}</Text>
                </Text>
                <Text style={styles.dateText}>
                  🕒 Livrée le **{item.dateLivraison}** à **{item.heureLivraison}**
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeNotification(item.id)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>❌</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "red" }]}
        onPress={async () => {
          await AsyncStorage.removeItem("notifications");
          setNotifications([]);
        }}
      >
        <Text style={styles.buttonText}>Effacer toutes les notifications</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f6f6", alignItems: "center" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  text: { fontSize: 16, color: "#777", textAlign: "center", marginBottom: 20 },
  noNotifText: { fontSize: 16, color: "#777", textAlign: "center", marginBottom: 20 },
  button: {
    backgroundColor: "#7ba352",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    width: "80%",
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    width: "90%",
    alignSelf: "center",
    borderLeftWidth: 5,
    borderLeftColor: "#7ba352",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationContent: {
    flex: 1,
    paddingRight: 10,
  },
  notificationText: { fontSize: 16, color: "#333", marginBottom: 2 },
  bold: { fontWeight: "bold" },
  dateText: { fontSize: 14, color: "#777", marginTop: 2 },
  removeButton: {
    backgroundColor: "red",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 50,
  },
  removeButtonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
});

export default ClientScreen;

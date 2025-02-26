import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../constants/notifications";

const HomeScreen = () => {
  const router = useRouter();

  useEffect(() => {
    async function getToken() {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await AsyncStorage.setItem("expoPushToken", token);
      }
    }
    getToken();
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur l'application</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("(tabs)")}
      >
        <Text style={styles.buttonText}>Aller sur l'application livreur</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("client")}
      >
        <Text style={styles.buttonText}>Aller sur l'application client</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#7ba352",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    width: "80%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default HomeScreen;
